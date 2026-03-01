import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Use the environment variable if it exists, otherwise use your Neon URL directly
const connectionString = (process.env.DATABASE_URL || "postgresql://neondb_owner:npg_1bglIuh3qHcm@ep-crimson-wildflower-ailool5c-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require").replace(/['"]+/g, '').trim();
export const pool = new Pool({ 
  connectionString: connectionString 
});

export const db = drizzle(pool, { schema });