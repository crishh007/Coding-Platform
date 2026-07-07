import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { problemsTable } from "@workspace/db";
import {
  ListProblemsQueryParams,
  CreateProblemBody,
  GetProblemParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/problems", async (req, res): Promise<void> => {
  const parsed = ListProblemsQueryParams.safeParse(req.query);
  const difficulty = parsed.success ? parsed.data.difficulty : undefined;
  const tag = parsed.success ? parsed.data.tag : undefined;

  let problems = await db.select().from(problemsTable);

  if (difficulty && difficulty !== "all") {
    problems = problems.filter((p) => p.difficulty === difficulty);
  }
  if (tag) {
    problems = problems.filter((p) => p.tags.includes(tag));
  }

  res.json(problems.map(problemToDto));
});

router.post("/problems", async (req, res): Promise<void> => {
  const parsed = CreateProblemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { tags, ...rest } = parsed.data as any;
  const [problem] = await db.insert(problemsTable).values({
    ...rest,
    tags: tags ?? [],
  }).returning();

  res.status(201).json(problemToDto(problem));
});

router.get("/problems/:id", async (req, res): Promise<void> => {
  const params = GetProblemParams.safeParse({ ...req.params, id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [problem] = await db.select().from(problemsTable).where(eq(problemsTable.id, params.data.id));
  if (!problem) {
    res.status(404).json({ error: "Problem not found" });
    return;
  }

  res.json(problemToDto(problem));
});

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
    contestOrder: null,
    points: p.points,
  };
}

export default router;
