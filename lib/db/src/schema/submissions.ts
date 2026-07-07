import { pgTable, text, serial, timestamp, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
export const submissionStatusEnum = pgEnum("submission_status", [
  "pending","accepted","wrong_answer","time_limit_exceeded","memory_limit_exceeded","runtime_error","compilation_error"
]);
export const submissionsTable = pgTable("submissions", {
  id: serial("id").primaryKey(),
  problemId: integer("problem_id").notNull(),
  contestId: integer("contest_id"),
  userId: integer("user_id").notNull(),
  language: text("language").notNull(),
  code: text("code").notNull(),
  status: submissionStatusEnum("status").notNull().default("pending"),
  executionTime: integer("execution_time"),
  memoryUsed: integer("memory_used"),
  score: integer("score"),
  isVirtual: boolean("is_virtual").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
export const insertSubmissionSchema = createInsertSchema(submissionsTable).omit({ id: true, createdAt: true });
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Submission = typeof submissionsTable.$inferSelect;
