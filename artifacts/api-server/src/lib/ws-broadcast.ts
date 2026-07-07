import { WebSocketServer, WebSocket } from "ws";
import type { IncomingMessage } from "http";
import { db } from "@workspace/db";
import {
  contestsTable,
  submissionsTable,
  usersTable,
} from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { logger } from "./logger";

let wss: WebSocketServer | null = null;

export function createWsServer(server: import("http").Server) {
  wss = new WebSocketServer({ server, path: "/api/ws" });

  wss.on("connection", (ws: WebSocket & { _contestId?: number }, req: IncomingMessage) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    const contestId = parseInt(url.searchParams.get("contestId") ?? "0", 10);

    logger.info({ contestId }, "WS client connected");

    ws.on("error", (err) => logger.error({ err }, "WS error"));
    ws.on("close", () => logger.info({ contestId }, "WS client disconnected"));

    if (contestId) {
      ws._contestId = contestId;
      sendLeaderboard(ws, contestId);
    }
  });

  setInterval(() => broadcastAll(), 5000);

  logger.info("WebSocket server started on /api/ws");
  return wss;
}

async function buildLeaderboard(contestId: number) {
  const submissions = await db
    .select({
      userId: submissionsTable.userId,
      problemId: submissionsTable.problemId,
      status: submissionsTable.status,
      score: submissionsTable.score,
      createdAt: submissionsTable.createdAt,
      isVirtual: submissionsTable.isVirtual,
    })
    .from(submissionsTable)
    .where(eq(submissionsTable.contestId, contestId))
    .orderBy(submissionsTable.createdAt);

  const users = await db.select().from(usersTable);
  const userMap = new Map(users.map((u) => [u.id, u]));

  const participantMap = new Map<
    number,
    {
      userId: number;
      score: number;
      penalty: number;
      isVirtual: boolean;
      problems: Map<
        number,
        { solved: boolean; attempts: number; solvedAt?: Date; score: number }
      >;
    }
  >();

  for (const sub of submissions) {
    if (!participantMap.has(sub.userId)) {
      participantMap.set(sub.userId, {
        userId: sub.userId,
        score: 0,
        penalty: 0,
        isVirtual: sub.isVirtual ?? false,
        problems: new Map(),
      });
    }
    const p = participantMap.get(sub.userId)!;
    const prob = p.problems.get(sub.problemId) ?? {
      solved: false,
      attempts: 0,
      score: 0,
    };

    if (!prob.solved) {
      prob.attempts += 1;
      if (sub.status === "accepted") {
        prob.solved = true;
        prob.score = sub.score ?? 100;
        prob.solvedAt = sub.createdAt instanceof Date ? sub.createdAt : new Date(sub.createdAt ?? Date.now());
        p.score += prob.score;
        p.penalty += (prob.attempts - 1) * 20;
      }
    }
    p.problems.set(sub.problemId, prob);
  }

  const entries = Array.from(participantMap.values())
    .sort((a, b) => b.score - a.score || a.penalty - b.penalty)
    .map((p, idx) => {
      const user = userMap.get(p.userId);
      return {
        rank: idx + 1,
        userId: p.userId,
        username: user?.username ?? `user_${p.userId}`,
        score: p.score,
        penalty: p.penalty,
        isVirtual: p.isVirtual,
        tier: user?.tier ?? "newbie",
        teamName: null,
        problemResults: Array.from(p.problems.entries()).map(([, r]) => ({
          solved: r.solved,
          attempts: r.attempts,
          score: r.score,
        })),
      };
    });

  return { type: "leaderboard", contestId, entries, ts: Date.now() };
}

async function sendLeaderboard(ws: WebSocket, contestId: number) {
  if (ws.readyState !== WebSocket.OPEN) return;
  try {
    const payload = await buildLeaderboard(contestId);
    ws.send(JSON.stringify(payload));
  } catch (err) {
    logger.error({ err }, "Failed to send leaderboard via WS");
  }
}

async function broadcastAll() {
  if (!wss || wss.clients.size === 0) return;
  const activeContests = await db
    .select()
    .from(contestsTable)
    .where(eq(contestsTable.status, "active"));

  const activeIds = new Set(activeContests.map((c) => c.id));

  for (const client of wss.clients) {
    if (client.readyState !== WebSocket.OPEN) continue;
    const ws = client as any;
    if (ws._contestId && activeIds.has(ws._contestId)) {
      await sendLeaderboard(client, ws._contestId);
    }
  }
}
