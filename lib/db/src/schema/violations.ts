import { pgTable, text, serial, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
export const violationTypeEnum = pgEnum("violation_type", [
  "plagiarism","tab_switch","copy_paste","identical_code","suspicious_timing","multiple_submissions"
]);
export const violationSeverityEnum = pgEnum("violation_severity", ["low","medium","high","critical"]);
export const violationStatusEnum = pgEnum("violation_status", ["pending","reviewed","dismissed","confirmed"]);
export const violationsTable = pgTable("violations", {
  id: serial("id").primaryKey(),
  contestId: integer("contest_id").notNull(),
  userId: integer("user_id").notNull(),
  type: violationTypeEnum("type").notNull(),
  severity: violationSeverityEnum("severity").notNull(),
  description: text("description"),
  status: violationStatusEnum("status").notNull().default("pending"),
  detectedAt: timestamp("detected_at", { withTimezone: true }).notNull().defaultNow(),
});
export const insertViolationSchema = createInsertSchema(violationsTable).omit({ id: true, detectedAt: true });
export type InsertViolation = z.infer<typeof insertViolationSchema>;
export type Violation = typeof violationsTable.$inferSelect;
