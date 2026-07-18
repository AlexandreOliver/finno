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
    // await db.execute(sql`DROP TABLE __drizzle_migrations`);
    await db.execute(sql`TRUNCATE TABLE users CASCADE`);
    await db.execute(sql`TRUNCATE TABLE template_reccurent CASCADE`);
    await db.execute(sql`TRUNCATE TABLE movements CASCADE`);
    await db.execute(sql`TRUNCATE TABLE sessions CASCADE`);
    await db.execute(sql`TRUNCATE TABLE categories CASCADE`);
    await db.execute(sql`TRUNCATE TABLE transfers CASCADE`);
    await db.execute(sql`TRUNCATE TABLE wallets CASCADE`);
    // await db.execute(sql`DROP TYPE IF EXISTS frequency CASCADE`);
    // await db.execute(sql`DROP TYPE IF EXISTS status CASCADE`);
    // await db.execute(sql`DROP TYPE IF EXISTS types CASCADE`);

    // await db.execute(sql`DROP SCHEMA IF EXISTS public CASCADE`);
  };

  // Retorna uma função que dá acesso ao DB atualizado
  return {
    db,
    seeding,
    runMigrations,
    clearDatabase,
  };
}
