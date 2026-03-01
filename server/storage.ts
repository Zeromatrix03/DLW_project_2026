import { db } from "./db";
import {
  users,
  questions,
  userProgress,
  items,
  userInventory,
  type User,
  type Question,
  type UserProgress,
  type Item,
  type UserInventory,
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

// Updated Interface to include AI and Store logic
export interface IStorage {
  // User Management
  getUser(id: number): Promise<User | undefined>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  
  // AI Question Generation
  createQuestion(data: Partial<Question>): Promise<Question>;
  getQuestions(topic?: string, type?: string): Promise<Question[]>;
  getQuestion(id: number): Promise<Question | undefined>;
  recordProgress(userId: number, questionId: number, isCorrect: boolean): Promise<UserProgress>;
  
  // Store & Inventory
  getAllItems(): Promise<Item[]>;
  getUserInventory(userId: number): Promise<(UserInventory & { item: Item })[]>;
  purchaseItem(userId: number, itemId: number): Promise<{ success: boolean; message: string }>;
}

export class DatabaseStorage implements IStorage {
  // --- USER METHODS ---
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [updated] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  // --- AI & QUESTION METHODS ---
  // This allows the AI route to save a generated question to the DB
  async createQuestion(data: any): Promise<Question> {
    const [newQuestion] = await db.insert(questions).values(data).returning();
    return newQuestion;
  }

  async getQuestions(topic?: string, type?: string): Promise<Question[]> {
    const allQuestions = await db.select().from(questions);
    return allQuestions.filter(q => {
      let match = true;
      if (topic && q.topic.toLowerCase() !== topic.toLowerCase()) match = false;
      if (type && q.type !== type) match = false;
      return match;
    });
  }

  async getQuestion(id: number): Promise<Question | undefined> {
    const [question] = await db.select().from(questions).where(eq(questions.id, id));
    return question;
  }

  async recordProgress(userId: number, questionId: number, isCorrect: boolean): Promise<UserProgress> {
    const [progress] = await db.insert(userProgress).values({
      userId,
      questionId,
      isCorrect,
    }).returning();
    return progress;
  }

  // --- STORE & INVENTORY METHODS ---
  async getAllItems(): Promise<Item[]> {
    return await db.select().from(items);
  }

  async getUserInventory(userId: number) {
    // Join inventory with items to get full descriptions/names for the UI
    const results = await db
      .select()
      .from(userInventory)
      .innerJoin(items, eq(userInventory.itemId, items.id))
      .where(eq(userInventory.userId, userId));
    
    return results.map(r => ({ ...r.user_inventory, item: r.items }));
  }

  async purchaseItem(userId: number, itemId: number): Promise<{ success: boolean; message: string }> {
    const user = await this.getUser(userId);
    const [item] = await db.select().from(items).where(eq(items.id, itemId));

    if (!user || !item) return { success: false, message: "User or Item not found." };
    if (user.points < item.cost) return { success: false, message: "Not enough points (XP)!" };

    // Check if user already owns it
    const [existing] = await db.select().from(userInventory).where(
      and(eq(userInventory.userId, userId), eq(userInventory.itemId, itemId))
    );
    if (existing) return { success: false, message: "You already own this item!" };

    // Transaction: Deduct points and Add to Inventory
    await this.updateUser(userId, { points: user.points - item.cost });
    await db.insert(userInventory).values({ userId, itemId });

    return { success: true, message: `Successfully purchased ${item.name}!` };
  }
}

export const storage = new DatabaseStorage();