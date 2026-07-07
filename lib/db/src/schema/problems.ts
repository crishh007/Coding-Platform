import { pgTable, text, serial, integer, real, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
export const problemDifficultyEnum = pgEnum("problem_difficulty", ["easy","medium","hard"]);
export const problemsTable = pgTable("problems", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  difficulty: problemDifficultyEnum("difficulty").notNull().default("medium"),
  acceptanceRate: real("acceptance_rate").notNull().default(0),
  totalSubmissions: integer("total_submissions").notNull().default(0),
  timeLimit: integer("time_limit").notNull().default(2000),
  memoryLimit: integer("memory_limit").notNull().default(256),
  tags: text("tags").array().notNull().default([]),
  points: integer("points").notNull().default(100),
});
export const contestProblemsTable = pgTable("contest_problems", {
  id: serial("id").primaryKey(),
  contestId: integer("contest_id").notNull(),
  problemId: integer("problem_id").notNull(),
  contestOrder: integer("contest_order").notNull(),
  points: integer("points").notNull().default(100),
});
export const insertProblemSchema = createInsertSchema(problemsTable).omit({ id: true });
export type InsertProblem = z.infer<typeof insertProblemSchema>;
export type Problem = typeof problemsTable.$inferSelect;
export type ContestProblem = typeof contestProblemsTable.$inferSelect;
