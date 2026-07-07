import { pgTable, text, serial, timestamp, integer, real, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
export const userTierEnum = pgEnum("user_tier", [
  "newbie","pupil","specialist","expert","candidate_master","master","grandmaster","legendary"
]);
export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  displayName: text("display_name"),
  email: text("email"),
  rating: integer("rating").notNull().default(800),
  maxRating: integer("max_rating").notNull().default(800),
  rank: integer("rank").notNull().default(0),
  tier: userTierEnum("tier").notNull().default("newbie"),
  contestsParticipated: integer("contests_participated").notNull().default(0),
  problemsSolved: integer("problems_solved").notNull().default(0),
  totalSubmissions: integer("total_submissions").notNull().default(0),
  acceptanceRate: real("acceptance_rate").notNull().default(0),
  country: text("country"),
  teamId: integer("team_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
