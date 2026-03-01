import { z } from 'zod';
import { insertUserSchema, insertQuestionSchema, insertUserProgressSchema, users, questions, userProgress } from './schema';
import { conversations, messages, insertConversationSchema, insertMessageSchema } from './models/chat';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  users: {
    get: {
      method: 'GET' as const,
      path: '/api/users/:id' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/users/:id' as const,
      input: insertUserSchema.partial(),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        404: errorSchemas.notFound,
        400: errorSchemas.validation,
      },
    },
  },
  questions: {
    list: {
      method: 'GET' as const,
      path: '/api/questions' as const,
      input: z.object({
        topic: z.string().optional(),
        type: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof questions.$inferSelect>()),
      },
    },
    answer: {
      method: 'POST' as const,
      path: '/api/questions/:id/answer' as const,
      input: z.object({
        userId: z.number(),
        answer: z.string(), // Provide actual answer to evaluate
      }),
      responses: {
        200: z.object({
          isCorrect: z.boolean(),
          explanation: z.string(),
          newPoints: z.number(),
          newRank: z.string(),
          newStreak: z.number(),
        }),
        404: errorSchemas.notFound,
        400: errorSchemas.validation,
      },
    }
  },
  ai: {
    checkin: {
      method: 'POST' as const,
      path: '/api/ai/checkin' as const,
      input: z.object({
        userId: z.number(),
        userStatus: z.string(), // How the user is doing
      }),
      responses: {
        200: z.object({
          message: z.string(), // AI's response sharing its own focus goal and encouraging user
        }),
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type UserUpdateInput = z.infer<typeof api.users.update.input>;
export type QuestionResponse = z.infer<typeof api.questions.list.responses[200]>;
export type AnswerSubmitInput = z.infer<typeof api.questions.answer.input>;
export type AnswerResult = z.infer<typeof api.questions.answer.responses[200]>;
export type AICheckinInput = z.infer<typeof api.ai.checkin.input>;
export type AICheckinResponse = z.infer<typeof api.ai.checkin.responses[200]>;
