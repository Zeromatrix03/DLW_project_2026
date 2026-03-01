import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";

// Initialize OpenAI with the key provided in your environment
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Logic to determine the user's rank based on their total XP/Points.
 * This drives the gamification aspect for the student.
 */
function determineRank(points: number): string {
  if (points >= 1000) return "Space Marine";
  if (points >= 500) return "Commander";
  return "Recruit";
}

/**
 * Difficulty scaling for AI prompt generation.
 * Difficulty increases as the student gains more points.
 */
function getDifficulty(points: number): string {
  if (points < 200) return "Basic (Grade 1-3)";
  if (points < 500) return "Intermediate (Grade 4-6)";
  if (points < 1000) return "Advanced (High School)";
  return "Expert (University Level)";
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // 1. Register integration routes for Chat and Image generation
  registerChatRoutes(app);
  registerImageRoutes(app);

  // --- USER PROFILE ROUTES ---
  app.get(api.users.get.path, async (req, res) => {
    const user = await storage.getUser(Number(req.params.id));
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  });

  app.put(api.users.update.path, async (req, res) => {
    try {
      const input = api.users.update.input.parse(req.body);
      const user = await storage.updateUser(Number(req.params.id), input);
      res.json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // --- AI QUESTION GENERATOR ---
  app.post("/api/questions/generate", async (req, res) => {
    try {
      const { userId, topic } = req.body;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const difficulty = getDifficulty(user.points);

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a Space Marine Battle-Tutor. Generate a 'drag_drop' interactive sorting mission.
            Subject: ${topic}. Difficulty: ${difficulty}.

            Return ONLY a raw JSON object:
            {
              "type": "drag_drop",
              "content": "Sort the following data into the correct tactical sectors.",
              "metadata": {
                "items": ["Item 1", "Item 2", "Item 3", "Item 4"],
                "categories": ["Category A", "Category B"]
              },
              "correctAnswer": "Item 1:Category A, Item 2:Category B, Item 3:Category A, Item 4:Category B",
              "explanation": "Clear space-themed explanation."
            }`
          }
        ],
        response_format: { type: "json_object" }
      });

      const aiData = JSON.parse(response.choices[0].message.content || "{}");
      
      // FIX: Changed type from "mcq" to aiData.type to support interactive missions
      const question = await storage.createQuestion({
        ...aiData,
        topic,
        type: aiData.type || "drag_drop", // Ensure this matches the generated type
        difficulty
      });

      res.json(question);
    } catch (err: any) {
      console.error("AI Generation Error:", err);
      res.status(err.status || 500).json({ 
        message: err.message || "AI mission generation failed." 
      });
    }
  });

  // --- GET ALL QUESTIONS (Add this if missing) ---
  app.get(api.questions.list.path, async (req, res) => {
    const { topic, type } = req.query;
    const questions = await storage.getQuestions(topic as string, type as string);
    res.json(questions);
  });

  // --- MISSION ANSWER LOGIC ---
  // Handles streak math, point rewards, and Rank-Up checks
  app.post(api.questions.answer.path, async (req, res) => {
    try {
      const input = api.questions.answer.input.parse(req.body);
      const questionId = Number(req.params.id);
      const question = await storage.getQuestion(questionId);
      const user = await storage.getUser(input.userId);
      
      if (!question || !user) return res.status(404).json({ message: 'Data not found' });

      const isCorrect = input.answer === question.correctAnswer;
      
      // Persist progress to the user_progress table
      await storage.recordProgress(user.id, questionId, isCorrect);

      let { points: newPoints, currentStreak: newStreak } = user;
      
      if (isCorrect) {
        newStreak += 1;
        // Gamified reward: Points increase with the current streak (cap multiplier at 5x)
        const streakMultiplier = Math.min(newStreak, 5); 
        newPoints += 10 * streakMultiplier;
      } else {
        // ADHD-friendly mechanic: Don't lose all progress on one mistake
        newStreak = newStreak > 3 ? Math.floor(newStreak / 2) : 0;
      }

      // Update the user's permanent stats and check for Rank promotion
      const updatedUser = await storage.updateUser(user.id, {
        points: newPoints,
        currentStreak: newStreak,
        highestStreak: Math.max(user.highestStreak, newStreak),
        rank: determineRank(newPoints),
      });

      res.json({ 
        isCorrect, 
        explanation: question.explanation, 
        user: updatedUser 
      });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // --- ARMORY (STORE) ROUTES ---
  // Fetches the catalog of available cosmetic items
  app.get("/api/items", async (_req, res) => {
    const allItems = await storage.getAllItems();
    res.json(allItems);
  });

  // Handles the purchase transaction: deducts XP points and adds item to inventory
  app.post("/api/items/purchase", async (req, res) => {
    const { userId, itemId } = req.body;
    const result = await storage.purchaseItem(userId, itemId);
    
    if (result.success) {
      const updatedUser = await storage.getUser(userId);
      res.json({ message: result.message, user: updatedUser });
    } else {
      res.status(400).json({ message: result.message });
    }
  });

  // Fetches all items currently owned by the user
  app.get("/api/users/:id/inventory", async (req, res) => {
    const inventory = await storage.getUserInventory(Number(req.params.id));
    res.json(inventory);
  });

  // --- ADHD TUTOR BOT CHECK-IN ---
  // Simulates a "Body Double" check-in every 10 minutes from the server
  app.post(api.ai.checkin.path, async (req, res) => {
    try {
      const responses = [
        "Status report, Marine! I've finished the data logs. How's your focus?",
        "Digital systems are green. Ready for the next training mission?",
        "I've optimized your learning path. Keep that streak alive!",
        "Armor check complete. Your focus goal is still the priority."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      res.json({ message: randomResponse });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}