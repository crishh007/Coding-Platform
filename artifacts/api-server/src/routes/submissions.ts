import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db } from "@workspace/db";
import { submissionsTable, usersTable, problemsTable } from "@workspace/db";
import {
  ListSubmissionsQueryParams,
  CreateSubmissionBody,
  GetSubmissionParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

const SUBMISSION_STATUSES = ["pending", "accepted", "wrong_answer", "time_limit_exceeded", "memory_limit_exceeded", "runtime_error", "compilation_error"] as const;

function randomStatus() {
  const weights = [0, 0.45, 0.25, 0.10, 0.05, 0.10, 0.05];
  const r = Math.random();
  let cumulative = 0;
  for (let i = 0; i < SUBMISSION_STATUSES.length; i++) {
    cumulative += weights[i];
    if (r < cumulative) return SUBMISSION_STATUSES[i];
  }
  return "accepted";
}

router.get("/submissions", async (req, res): Promise<void> => {
  const parsed = ListSubmissionsQueryParams.safeParse(req.query);
  let subs = await db.select({
    s: submissionsTable,
    u: usersTable,
  }).from(submissionsTable)
    .leftJoin(usersTable, eq(submissionsTable.userId, usersTable.id));

  if (parsed.success) {
    const { contestId, userId, problemId, status } = parsed.data as any;
    if (contestId) subs = subs.filter(({ s }) => s.contestId === Number(contestId));
    if (userId) subs = subs.filter(({ s }) => s.userId === Number(userId));
    if (problemId) subs = subs.filter(({ s }) => s.problemId === Number(problemId));
    if (status) subs = subs.filter(({ s }) => s.status === status);
  }

  res.json(subs.map(({ s, u }) => subToDto(s, u)));
});

router.post("/submissions", async (req, res): Promise<void> => {
  const parsed = CreateSubmissionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data as any;

  // Simulate judging — randomize status with realistic weights
  const status = randomStatus();
  const executionTime = status === "time_limit_exceeded" ? null : Math.floor(Math.random() * 500) + 10;
  const memoryUsed = Math.floor(Math.random() * 50000) + 5000;
  const score = status === "accepted" ? 100 : 0;

  const [sub] = await db.insert(submissionsTable).values({
    problemId: data.problemId,
    contestId: data.contestId ?? null,
    userId: data.userId ?? 1,
    language: data.language,
    code: data.code,
    status,
    executionTime,
    memoryUsed,
    score,
    isVirtual: data.isVirtual ?? false,
  }).returning();

  // Update problem stats
  await db.update(problemsTable)
    .set({
      totalSubmissions: db.$count(submissionsTable, eq(submissionsTable.problemId, data.problemId)) as any,
    })
    .where(eq(problemsTable.id, data.problemId));

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, sub.userId));

  res.status(201).json(subToDto(sub, user ?? null));
});

router.get("/submissions/:id", async (req, res): Promise<void> => {
  const params = GetSubmissionParams.safeParse({ ...req.params, id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [result] = await db.select({
    s: submissionsTable,
    u: usersTable,
  }).from(submissionsTable)
    .leftJoin(usersTable, eq(submissionsTable.userId, usersTable.id))
    .where(eq(submissionsTable.id, params.data.id));

  if (!result) {
    res.status(404).json({ error: "Submission not found" });
    return;
  }

  res.json(subToDto(result.s, result.u));
});

function subToDto(s: any, u: any) {
  return {
    id: s.id,
    problemId: s.problemId,
    contestId: s.contestId,
    userId: s.userId,
    username: u?.username ?? `user_${s.userId}`,
    language: s.language,
    code: s.code,
    status: s.status,
    executionTime: s.executionTime,
    memoryUsed: s.memoryUsed,
    score: s.score,
    isVirtual: s.isVirtual,
    createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : s.createdAt,
  };
}

export default router;
