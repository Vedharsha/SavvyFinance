import pkg from "pg";
const { Pool } = pkg; // Use default import for Pool
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";
import { users } from "@shared/schema";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set.");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

// Debug query to test database connection
(async () => {
  try {
    const testQuery = await db.select().from(users).limit(1);
    console.log("✅ Database connection successful:", testQuery);
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
})();
