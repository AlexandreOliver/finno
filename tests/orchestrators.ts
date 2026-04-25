import db from "@/infra/database";
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/node-postgres/migrator";

async function cleanDatabase() {
  await db.execute(sql`drop schema public cascade; create schema public`);
}

async function runMigrations() {
  await migrate(db, { migrationsFolder: "infra/database/migrations" });
}

export const orchestrator = {
  cleanDatabase,
  runMigrations,
};
