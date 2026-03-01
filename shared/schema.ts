import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Export chat models from integration
export * from "./models/chat";

// --- USERS TABLE ---
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  points: integer("points").notNull().default(0), // XP for rank progression
  rank: text("rank").notNull().default("Recruit"), // e.g. Recruit, Commander, Space Marine
  currentStreak: integer("current_streak").notNull().default(0),
  highestStreak: integer("highest_streak").notNull().default(0),
  cosmetics: jsonb("cosmetics").notNull().default([]), // array of cosmetic IDs
  focusGoal: text("focus_goal"),
  lastCheckIn: timestamp("last_check_in").defaultNow(),
});

// --- QUESTIONS TABLE (Enhanced for AI) ---
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  topic: text("topic").notNull(), // Math, English, Science, etc.
  type: text("type").notNull(), // 'mcq', 'conceptual'
  content: text("content").notNull(),
  options: jsonb("options").$type<string[]>(), // Array of strings for MCQ
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation").notNull(),
  difficulty: text("difficulty"), // Added to track AI scaling (Basic, Advanced, etc.)
});

// --- NEW: ITEMS TABLE (The Armory) ---
export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  cost: integer("cost").notNull(), // Points required to purchase
  category: text("category").notNull(), // 'helmet', 'armor', 'aura', 'weapon'
  imageUrl: text("image_url"),
});

// --- NEW: USER INVENTORY (Owned Gear) ---
export const userInventory = pgTable("user_inventory", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  itemId: integer("item_id").notNull().references(() => items.id),
  isEquipped: boolean("is_equipped").default(false),
  purchasedAt: timestamp("purchased_at").defaultNow().notNull(),
});

// --- PROGRESS TRACKING ---
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  questionId: integer("question_id").notNull().references(() => questions.id),
  isCorrect: boolean("is_correct").notNull(),
  answeredAt: timestamp("answered_at").defaultNow().notNull(),
});

// --- ZOD SCHEMAS ---
export const insertUserSchema = createInsertSchema(users).omit({ id: true, lastCheckIn: true });
export const insertQuestionSchema = createInsertSchema(questions).omit({ id: true });
export const insertUserProgressSchema = createInsertSchema(userProgress).omit({ id: true, answeredAt: true });
export const insertItemSchema = createInsertSchema(items).omit({ id: true });

// --- TYPES ---
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type Item = typeof items.$inferSelect;
export type UserInventory = typeof userInventory.$inferSelect;