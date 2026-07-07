import { pgTable, text, serial, timestamp, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
export const contestStatusEnum = pgEnum("contest_status", ["upcoming","active","ended"]);
export const contestTypeEnum = pgEnum("contest_type", ["individual","team"]);
export const contestDifficultyEnum = pgEnum("contest_difficulty", ["beginner","intermediate","advanced","expert"]);
export const contestsTable = pgTable("contests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: contestStatusEnum("status").notNull().default("upcoming"),
  type: contestTypeEnum("type").notNull().default("individual"),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }).notNull(),
  duration: integer("duration").notNull(),
  participantCount: integer("participant_count").notNull().default(0),
  maxParticipants: integer("max_participants"),
  problemCount: integer("problem_count").notNull().default(0),
  difficulty: contestDifficultyEnum("difficulty").notNull().default("intermediate"),
  tags: text("tags").array().notNull().default([]),
  virtualAllowed: boolean("virtual_allowed").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
export const registrationsTable = pgTable("registrations", {
  id: serial("id").primaryKey(),
  contestId: integer("contest_id").notNull(),
  userId: integer("user_id").notNull(),
  teamId: integer("team_id"),
  registeredAt: timestamp("registered_at", { withTimezone: true }).notNull().defaultNow(),
});
export const virtualParticipationsTable = pgTable("virtual_participations", {
  id: serial("id").primaryKey(),
  contestId: integer("contest_id").notNull(),
  userId: integer("user_id").notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
});
export const insertContestSchema = createInsertSchema(contestsTable).omit({ id: true, createdAt: true });
export type InsertContest = z.infer<typeof insertContestSchema>;
export type Contest = typeof contestsTable.$inferSelect;
