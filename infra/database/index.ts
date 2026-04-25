import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { schemas } from "./schemas";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: process.env.NODE_ENV === "production",
});

const database = drizzle({
  client: pool,
  casing: "snake_case",
  schema: schemas,
});

export default database;
