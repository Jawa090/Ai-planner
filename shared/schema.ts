import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  initials: text("initials").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  displayName: true,
  initials: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const taskCategories = pgTable("task_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  userId: integer("user_id").notNull(),
});

export const insertTaskCategorySchema = createInsertSchema(taskCategories).pick({
  name: true,
  color: true,
  userId: true,
});

export type InsertTaskCategory = z.infer<typeof insertTaskCategorySchema>;
export type TaskCategory = typeof taskCategories.$inferSelect;

export const priorities = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
} as const;

export type Priority = typeof priorities[keyof typeof priorities];

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time", { mode: "date" }),
  endTime: timestamp("end_time", { mode: "date" }),
  isCompleted: boolean("is_completed").default(false).notNull(),
  priority: text("priority").notNull().$type<Priority>(),
  categoryId: integer("category_id"),
  userId: integer("user_id").notNull(),
  date: timestamp("date", { mode: "date" }).notNull(),
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  title: true,
  description: true,
  startTime: true,
  endTime: true,
  isCompleted: true,
  priority: true,
  categoryId: true,
  userId: true,
  date: true,
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export const aiSuggestions = pgTable("ai_suggestions", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  isApplied: boolean("is_applied").default(false).notNull(),
  isDismissed: boolean("is_dismissed").default(false).notNull(),
  userId: integer("user_id").notNull(),
  suggestionData: jsonb("suggestion_data"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const insertAiSuggestionSchema = createInsertSchema(aiSuggestions).pick({
  message: true,
  isApplied: true,
  isDismissed: true,
  userId: true,
  suggestionData: true,
});

export type InsertAiSuggestion = z.infer<typeof insertAiSuggestionSchema>;
export type AiSuggestion = typeof aiSuggestions.$inferSelect;
