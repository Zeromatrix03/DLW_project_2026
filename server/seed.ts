import { db } from "./db";
import { users, questions, items } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function seedDatabase() {
  // 1. Seed Initial User (if empty)
  const existingUsers = await db.select().from(users);
  if (existingUsers.length === 0) {
    await db.insert(users).values({
      username: "student_1",
      displayName: "Adrian", //
      points: 100,
      rank: "Recruit",
      currentStreak: 2,
      highestStreak: 5,
      focusGoal: "Complete Space Marine Training",
    });
  }

  // 2. Seed Initial Questions (Fallback data)
  const existingQuestions = await db.select().from(questions);
  if (existingQuestions.length === 0) {
    await db.insert(questions).values([
      {
        topic: "Math",
        type: "mcq",
        content: "What is 15% of 200?",
        options: ["20", "25", "30", "35"],
        correctAnswer: "30",
        explanation: "200 * 0.15 = 30.",
        difficulty: "Basic",
      },
      {
        topic: "English",
        type: "mcq",
        content: "Which word is a synonym for 'Abundant'?",
        options: ["Scarce", "Plentiful", "Rare", "Empty"],
        correctAnswer: "Plentiful",
        explanation: "'Abundant' and 'Plentiful' both mean having a large amount of something.",
        difficulty: "Basic",
      },
      {
        topic: "Science",
        type: "mcq",
        content: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correctAnswer: "Mars",
        explanation: "Mars appears red due to iron oxide on its surface.",
        difficulty: "Basic",
      }
    ]);
  }

  // 3. Seed the Armory Store Items
  const existingItems = await db.select().from(items);
  if (existingItems.length === 0) {
    await db.insert(items).values([
      {
        name: "Recruit Helmet",
        description: "Standard issue protection for new initiates.",
        cost: 50,
        category: "helmet",
        imageUrl: "https://placehold.co/100x100?text=Helmet"
      },
      {
        name: "Titanium Pauldrons",
        description: "Heavy shoulder armor that displays your rank.",
        cost: 200,
        category: "armor",
        imageUrl: "https://placehold.co/100x100?text=Armor"
      },
      {
        name: "Plasma Aura",
        description: "A shimmering blue glow of pure mental focus.",
        cost: 500,
        category: "aura",
        imageUrl: "https://placehold.co/100x100?text=Aura"
      },
      {
        name: "Commander's Cape",
        description: "Only worn by the most disciplined leaders.",
        cost: 1000,
        category: "aura",
        imageUrl: "https://placehold.co/100x100?text=Cape"
      }
    ]);
  }
}