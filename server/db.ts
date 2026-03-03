import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from "@shared/schema";
import 'dotenv/config'; // <--- This loads your .env file

neonConfig.webSocketConstructor = ws;

/**
 * We strictly read from process.env.
 * If DATABASE_URL is missing, we throw an error immediately.
 */
const connectionString = process.env.DATABASE_URL?.replace(/['"]+/g, '').trim();

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is missing! Ensure you have a .env file with DATABASE_URL=..."
  );
}

export const pool = new Pool({ 
  connectionString: connectionString 
});

export const db = drizzle(pool, { schema });