import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db } from "@workspace/db";
import { usersTable, contestsTable } from "@workspace/db";
import { GetUserParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/users", async (req, res): Promise<void> => {
  const users = await db.select().from(usersTable).orderBy(desc(usersTable.rating));
  res.json(users.map(userToDto));
});

router.get("/users/:id", async (req, res): Promise<void> => {
  const params = GetUserParams.safeParse({ ...req.params, id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, params.data.id));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(userToDto(user));
});

router.get("/rankings", async (req, res): Promise<void> => {
  let limit = 100;
  if (req.query && typeof req.query.limit === "string") {
    const parsedLimit = parseInt(req.query.limit, 10);
    if (!isNaN(parsedLimit)) limit = parsedLimit;
  }

  const users = await db.select().from(usersTable).orderBy(desc(usersTable.rating)).limit(limit);

  const rankings = users.map((user, idx) => ({
    rank: idx + 1,
    userId: user.id,
    username: user.username,
    rating: user.rating,
    maxRating: user.maxRating,
    tier: user.tier,
    contestsParticipated: user.contestsParticipated,
    problemsSolved: user.problemsSolved,
    country: user.country,
    ratingChange: Math.floor(Math.random() * 100) - 50,
  }));

  res.json(rankings);
});

router.get("/dashboard/stats", async (req, res): Promise<void> => {
  const allUsers = await db.select().from(usersTable);
  const topUsers = allUsers.sort((a, b) => b.rating - a.rating).slice(0, 5);

  const allContests = await db.select().from(contestsTable);
  const activeContests = allContests.filter((c) => c.status === "active").length;
  const upcomingContests = allContests.filter((c) => c.status === "upcoming").length;

  res.json({
    activeContests,
    upcomingContests,
    totalUsers: allUsers.length,
    totalSubmissions: allUsers.reduce((sum, u) => sum + u.totalSubmissions, 0),
    onlineUsers: Math.floor(allUsers.length * 0.3),
    recentSubmissions: [],
    topRankedUsers: topUsers.map((user, idx) => ({
      rank: idx + 1,
      userId: user.id,
      username: user.username,
      rating: user.rating,
      maxRating: user.maxRating,
      tier: user.tier,
      contestsParticipated: user.contestsParticipated,
      problemsSolved: user.problemsSolved,
      country: user.country,
      ratingChange: Math.floor(Math.random() * 50) - 10,
    })),
  });
});

function userToDto(u: any) {
  return {
    id: u.id,
    username: u.username,
    displayName: u.displayName,
    email: u.email,
    rating: u.rating,
    maxRating: u.maxRating,
    rank: u.rank,
    tier: u.tier,
    contestsParticipated: u.contestsParticipated,
    problemsSolved: u.problemsSolved,
    totalSubmissions: u.totalSubmissions,
    acceptanceRate: u.acceptanceRate,
    country: u.country,
    teamId: u.teamId,
    createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt,
  };
}

export default router;
