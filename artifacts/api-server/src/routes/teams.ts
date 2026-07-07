import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { teamsTable, teamMembersTable, usersTable } from "@workspace/db";
import {
  GetTeamParams,
  AddTeamMemberParams,
  AddTeamMemberBody,
} from "@workspace/api-zod";
import { z } from "zod";

const router: IRouter = Router();

router.get("/teams", async (req, res): Promise<void> => {
  const teams = await db.select().from(teamsTable).orderBy(teamsTable.rating);

  const result = await Promise.all(teams.map(async (team) => {
    const members = await getTeamMembersDto(team.id);
    return teamToDto(team, members);
  }));

  res.json(result.sort((a, b) => b.rating - a.rating));
});

router.post("/teams", async (req, res): Promise<void> => {
  const CreateTeamSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional().nullable(),
    maxMembers: z.number().optional().default(4),
  });

  const parsed = CreateTeamSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data as any;
  const [team] = await db.insert(teamsTable).values({
    name: data.name,
    description: data.description ?? null,
    maxMembers: data.maxMembers ?? 4,
  }).returning();

  res.status(201).json(teamToDto(team, []));
});

router.get("/teams/:id", async (req, res): Promise<void> => {
  const params = GetTeamParams.safeParse({ ...req.params, id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [team] = await db.select().from(teamsTable).where(eq(teamsTable.id, params.data.id));
  if (!team) {
    res.status(404).json({ error: "Team not found" });
    return;
  }

  const members = await getTeamMembersDto(team.id);
  res.json(teamToDto(team, members));
});

router.post("/teams/:id/members", async (req, res): Promise<void> => {
  const params = AddTeamMemberParams.safeParse({ ...req.params, id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = AddTeamMemberBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data as any;
  await db.insert(teamMembersTable).values({
    teamId: params.data.id,
    userId: data.userId,
    role: data.role ?? "member",
  });

  const memberCount = await db.select().from(teamMembersTable).where(eq(teamMembersTable.teamId, params.data.id));
  await db.update(teamsTable).set({ memberCount: memberCount.length }).where(eq(teamsTable.id, params.data.id));

  const [team] = await db.select().from(teamsTable).where(eq(teamsTable.id, params.data.id));
  const members = await getTeamMembersDto(params.data.id);
  res.json(teamToDto(team, members));
});

async function getTeamMembersDto(teamId: number) {
  const rows = await db.select({
    tm: teamMembersTable,
    u: usersTable,
  }).from(teamMembersTable)
    .leftJoin(usersTable, eq(teamMembersTable.userId, usersTable.id))
    .where(eq(teamMembersTable.teamId, teamId));

  return rows.map(({ tm, u }) => ({
    userId: tm.userId,
    username: u?.username ?? `user_${tm.userId}`,
    role: tm.role as "leader" | "member",
    rating: u?.rating ?? 0,
  }));
}

function teamToDto(team: any, members: any[]) {
  return {
    id: team.id,
    name: team.name,
    description: team.description,
    memberCount: team.memberCount,
    maxMembers: team.maxMembers,
    rating: team.rating,
    rank: team.rank,
    contestsWon: team.contestsWon,
    totalContests: team.totalContests,
    members,
    createdAt: team.createdAt instanceof Date ? team.createdAt.toISOString() : team.createdAt,
  };
}

export default router;
