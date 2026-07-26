import { afterAll, beforeAll } from "@jest/globals";
import { execSync } from "node:child_process";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export default function setupTestDb() {
  const db = drizzle({
    client: new Pool({ connectionString: process.env.DATABASE_URL! }),
  });

  beforeAll(async () => {
    await seeding();
  });

  afterAll(async () => {
    await clearDatabase();
    await db.$client.end();
  });

  const seeding = async () => {
    execSync("pnpm run db:seed", { stdio: "ignore" });
  };

  const clearDatabase = async () => {
    // await db.execute(sql`DROP TABLE __drizzle_migrations`);
    await db.execute(sql`TRUNCATE TABLE users CASCADE`);
    await db.execute(sql`TRUNCATE TABLE template_reccurrent CASCADE`);
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
    clearDatabase,
  };
}
