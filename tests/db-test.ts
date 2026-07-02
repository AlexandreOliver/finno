import { afterAll, beforeAll } from "@jest/globals";
import { execSync } from "node:child_process";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "node:path";
import { sql } from "drizzle-orm";
import db from "@/infrastructure/database";

export default function setupTestDb() {
  beforeAll(async () => {
    await runMigrations();
    await seeding();
  });

  afterAll(async () => {
    await clearDatabase();
    await db.$client.end();
  });

  const seeding = async () => {
    execSync("pnpm run db:seed", { stdio: "ignore" });
  };

  const runMigrations = async () => {
    await migrate(db, {
      migrationsFolder: path.resolve(
        __dirname,
        "..",
        "src/infrastructure/database/migrations",
      ),
      migrationsSchema: "public",
    });
  };

  const clearDatabase = async () => {
    await db.execute(sql`TRUNCATE TABLE users RESTART IDENTITY CASCADE`);
    await db.execute(
      sql`TRUNCATE TABLE template_reccurent RESTART IDENTITY CASCADE`,
    );
    await db.execute(sql`TRUNCATE TABLE movements RESTART IDENTITY CASCADE`);
    await db.execute(sql`TRUNCATE TABLE sessions RESTART IDENTITY CASCADE`);
    await db.execute(sql`TRUNCATE TABLE categories RESTART IDENTITY CASCADE`);
    await db.execute(sql`TRUNCATE TABLE transfers RESTART IDENTITY CASCADE`);
    await db.execute(sql`TRUNCATE TABLE wallets RESTART IDENTITY CASCADE`);
  };

  // Retorna uma função que dá acesso ao DB atualizado
  return {
    db,
    seeding,
    runMigrations,
    clearDatabase,
  };
}
