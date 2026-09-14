import { createInsertSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";
import { date, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const pmMembersTable = pgTable("pm_members", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  initials: text("initials").notNull(),
  color: text("color").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const pmProjectsTable = pgTable("pm_projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  status: text("status").notNull().default("planning"),
  priority: text("priority").notNull().default("medium"),
  startDate: date("start_date", { mode: "string" }).notNull(),
  dueDate: date("due_date", { mode: "string" }),
  memberIds: text("member_ids").array().notNull().default(sql`ARRAY[]::text[]`),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const pmTasksTable = pgTable("pm_tasks", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  status: text("status").notNull().default("todo"),
  priority: text("priority").notNull().default("medium"),
  assigneeId: text("assignee_id"),
  deadline: date("deadline", { mode: "string" }),
  progress: integer("progress").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const pmActivityTable = pgTable("pm_activity", {
  id: text("id").primaryKey(),
  kind: text("kind").notNull(),
  message: text("message").notNull(),
  projectId: text("project_id").notNull(),
  taskId: text("task_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPmMemberSchema = createInsertSchema(pmMembersTable).omit({ createdAt: true });
export const insertPmProjectSchema = createInsertSchema(pmProjectsTable).omit({ createdAt: true, updatedAt: true });
export const insertPmTaskSchema = createInsertSchema(pmTasksTable).omit({ createdAt: true, updatedAt: true });
export const insertPmActivitySchema = createInsertSchema(pmActivityTable).omit({ createdAt: true });

export type InsertPmMember = z.infer<typeof insertPmMemberSchema>;
export type InsertPmProject = z.infer<typeof insertPmProjectSchema>;
export type InsertPmTask = z.infer<typeof insertPmTaskSchema>;
export type InsertPmActivity = z.infer<typeof insertPmActivitySchema>;
export type PmMember = typeof pmMembersTable.$inferSelect;
export type PmProject = typeof pmProjectsTable.$inferSelect;
export type PmTask = typeof pmTasksTable.$inferSelect;
export type PmActivity = typeof pmActivityTable.$inferSelect;