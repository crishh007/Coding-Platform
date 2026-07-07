import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  contestsTable, registrationsTable, virtualParticipationsTable,
  submissionsTable, contestProblemsTable, problemsTable, usersTable, violationsTable
} from "@workspace/db";
import {
  ListContestsQueryParams,
  CreateContestBody,
  GetContestParams,
  UpdateContestParams,
  UpdateContestBody,
  DeleteContestParams,
  RegisterForContestParams,
  RegisterForContestBody,
  StartVirtualParticipationParams,
  StartVirtualParticipationBody,
  GetContestLeaderboardParams,
  GetContestProblemsParams,
  AddProblemToContestParams,
  AddProblemToContestBody,
  GetContestViolationsParams,
  ReportViolationParams,
  ReportViolationBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/contests", async (req, res): Promise<void> => {
  const parsed = ListContestsQueryParams.safeParse(req.query);
  const status = parsed.success ? parsed.data.status : undefined;
  const type = parsed.success ? parsed.data.type : undefined;

  let query = db.select().from(contestsTable);
  const contests = await query;

  let filtered = contests;
  if (status && status !== "all") {
    filtered = filtered.filter((c) => c.status === status);
  }
  if (type && type !== "all") {
    filtered = filtered.filter((c) => c.type === type);
  }

  res.json(filtered.map(contestToDto));
});

router.post("/contests", async (req, res): Promise<void> => {
  const parsed = CreateContestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { tags, startTime, endTime, ...rest } = parsed.data as any;
  const [contest] = await db.insert(contestsTable).values({
    ...rest,
    tags: tags ?? [],
    startTime: new Date(startTime),
    endTime: new Date(endTime),
  }).returning();

  res.status(201).json(contestToDto(contest));
});

router.get("/contests/:id", async (req, res): Promise<void> => {
  const params = GetContestParams.safeParse({ ...req.params, id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [contest] = await db.select().from(contestsTable).where(eq(contestsTable.id, params.data.id));
  if (!contest) {
    res.status(404).json({ error: "Contest not found" });
    return;
  }

  res.json(contestToDto(contest));
});

router.patch("/contests/:id", async (req, res): Promise<void> => {
  const params = UpdateContestParams.safeParse({ ...req.params, id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateContestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: any = { ...parsed.data };
  if (updateData.startTime) updateData.startTime = new Date(updateData.startTime);
  if (updateData.endTime) updateData.endTime = new Date(updateData.endTime);

  const [contest] = await db.update(contestsTable).set(updateData).where(eq(contestsTable.id, params.data.id)).returning();

  if (!contest) {
    res.status(404).json({ error: "Contest not found" });
    return;
  }

  res.json(contestToDto(contest));
});

router.delete("/contests/:id", async (req, res): Promise<void> => {
  const params = DeleteContestParams.safeParse({ ...req.params, id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [contest] = await db.delete(contestsTable).where(eq(contestsTable.id, params.data.id)).returning();
  if (!contest) {
    res.status(404).json({ error: "Contest not found" });
    return;
  }

  res.sendStatus(204);
});

router.post("/contests/:id/register", async (req, res): Promise<void> => {
  const params = RegisterForContestParams.safeParse({ ...req.params, id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = RegisterForContestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [reg] = await db.insert(registrationsTable).values({
    contestId: params.data.id,
    userId: parsed.data.userId,
    teamId: (parsed.data as any).teamId ?? null,
  }).returning();

  await db.update(contestsTable)
    .set({ participantCount: db.$count(registrationsTable, eq(registrationsTable.contestId, params.data.id)) } as any)
    .where(eq(contestsTable.id, params.data.id));

  res.json({
    id: reg.id,
    contestId: reg.contestId,
    userId: reg.userId,
    teamId: reg.teamId,
    registeredAt: reg.registeredAt.toISOString(),
  });
});

router.post("/contests/:id/virtual", async (req, res): Promise<void> => {
  const params = StartVirtualParticipationParams.safeParse({ ...req.params, id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = StartVirtualParticipationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [contest] = await db.select().from(contestsTable).where(eq(contestsTable.id, params.data.id));
  if (!contest) {
    res.status(404).json({ error: "Contest not found" });
    return;
  }

  const startedAt = new Date();
  const endsAt = new Date(startedAt.getTime() + contest.duration * 60 * 1000);

  const [vp] = await db.insert(virtualParticipationsTable).values({
    contestId: params.data.id,
    userId: parsed.data.userId,
    startedAt,
    endsAt,
  }).returning();

  res.json({
    id: vp.id,
    contestId: vp.contestId,
    userId: vp.userId,
    startedAt: vp.startedAt.toISOString(),
    endsAt: vp.endsAt.toISOString(),
  });
});

router.get("/contests/:id/leaderboard", async (req, res): Promise<void> => {
  const params = GetContestLeaderboardParams.safeParse({ ...req.params, id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const submissions = await db.select().from(submissionsTable)
    .where(eq(submissionsTable.contestId, params.data.id));

  const contestProbs = await db.select().from(contestProblemsTable)
    .where(eq(contestProblemsTable.contestId, params.data.id));

  const userIds = [...new Set(submissions.map((s) => s.userId))];

  const leaderboard = await Promise.all(userIds.map(async (userId) => {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    const userSubs = submissions.filter((s) => s.userId === userId);

    const problemResults = contestProbs.map((cp) => {
      const probSubs = userSubs.filter((s) => s.problemId === cp.problemId);
      const accepted = probSubs.find((s) => s.status === "accepted");
      return {
        problemId: cp.problemId,
        solved: !!accepted,
        attempts: probSubs.length,
        solvedAt: accepted ? accepted.createdAt.toISOString() : null,
        score: accepted ? cp.points : 0,
      };
    });

    const score = problemResults.reduce((sum, pr) => sum + pr.score, 0);
    const solvedCount = problemResults.filter((pr) => pr.solved).length;
    const penalty = problemResults.reduce((sum, pr) => sum + (pr.solved ? pr.attempts - 1 : 0) * 20, 0);

    return {
      userId,
      username: user?.username ?? `user_${userId}`,
      teamId: null,
      teamName: null,
      score,
      penalty,
      solvedCount,
      tier: user?.tier ?? "newbie",
      isVirtual: false,
      problemResults,
    };
  }));

  const ranked = leaderboard
    .sort((a, b) => b.score - a.score || a.penalty - b.penalty)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  res.json(ranked);
});

router.get("/contests/:id/problems", async (req, res): Promise<void> => {
  const params = GetContestProblemsParams.safeParse({ ...req.params, id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const cps = await db.select({
    cp: contestProblemsTable,
    p: problemsTable,
  }).from(contestProblemsTable)
    .innerJoin(problemsTable, eq(contestProblemsTable.problemId, problemsTable.id))
    .where(eq(contestProblemsTable.contestId, params.data.id));

  const problems = cps.map(({ cp, p }) => ({
    ...p,
    contestOrder: cp.contestOrder,
    points: cp.points,
  }));

  res.json(problems.map(problemToDto));
});

router.post("/contests/:id/problems", async (req, res): Promise<void> => {
  const params = AddProblemToContestParams.safeParse({ ...req.params, id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = AddProblemToContestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await db.insert(contestProblemsTable).values({
    contestId: params.data.id,
    problemId: parsed.data.problemId,
    contestOrder: parsed.data.contestOrder,
    points: parsed.data.points,
  });

  const [problem] = await db.select().from(problemsTable).where(eq(problemsTable.id, parsed.data.problemId));
  if (!problem) {
    res.status(404).json({ error: "Problem not found" });
    return;
  }

  res.status(201).json(problemToDto({ ...problem, contestOrder: parsed.data.contestOrder, points: parsed.data.points }));
});

router.get("/contests/:id/violations", async (req, res): Promise<void> => {
  const params = GetContestViolationsParams.safeParse({ ...req.params, id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const violations = await db.select({
    v: violationsTable,
    u: usersTable,
  }).from(violationsTable)
    .leftJoin(usersTable, eq(violationsTable.userId, usersTable.id))
    .where(eq(violationsTable.contestId, params.data.id));

  res.json(violations.map(({ v, u }) => ({
    id: v.id,
    contestId: v.contestId,
    userId: v.userId,
    username: u?.username ?? `user_${v.userId}`,
    type: v.type,
    severity: v.severity,
    description: v.description,
    status: v.status,
    detectedAt: v.detectedAt.toISOString(),
  })));
});

router.post("/contests/:id/violations", async (req, res): Promise<void> => {
  const params = ReportViolationParams.safeParse({ ...req.params, id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = ReportViolationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [violation] = await db.insert(violationsTable).values({
    contestId: params.data.id,
    userId: parsed.data.userId,
    type: parsed.data.type as any,
    severity: parsed.data.severity as any,
    description: (parsed.data as any).description ?? null,
    status: "pending",
  }).returning();

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, parsed.data.userId));

  res.status(201).json({
    id: violation.id,
    contestId: violation.contestId,
    userId: violation.userId,
    username: user?.username ?? `user_${violation.userId}`,
    type: violation.type,
    severity: violation.severity,
    description: violation.description,
    status: violation.status,
    detectedAt: violation.detectedAt.toISOString(),
  });
});

function contestToDto(c: any) {
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    status: c.status,
    type: c.type,
    startTime: c.startTime instanceof Date ? c.startTime.toISOString() : c.startTime,
    endTime: c.endTime instanceof Date ? c.endTime.toISOString() : c.endTime,
    duration: c.duration,
    participantCount: c.participantCount,
    maxParticipants: c.maxParticipants,
    problemCount: c.problemCount,
    difficulty: c.difficulty,
    tags: c.tags ?? [],
    virtualAllowed: c.virtualAllowed,
    isRegistered: false,
    teamId: c.teamId ?? null,
    createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
  };
}

function problemToDto(p: any) {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    difficulty: p.difficulty,
    acceptanceRate: p.acceptanceRate,
    totalSubmissions: p.totalSubmissions,
    timeLimit: p.timeLimit,
    memoryLimit: p.memoryLimit,
    tags: p.tags ?? [],
    contestOrder: p.contestOrder ?? null,
    points: p.points,
  };
}

export default router;
