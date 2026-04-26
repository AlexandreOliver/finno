import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { schemas } from "./schemas";
import "dotenv/config";

const configConnection = {
  connectionString: process.env.DATABASE_URL!,
  ssl: process.env.NODE_ENV === "production",
};

export async function runMigrations() {
  const client = drizzle({ connection: configConnection });

  await migrate(client, {
    migrationsFolder: "infra/database/migrations",
    migrationsSchema: "public",
  });

  client.$client.end();

  return "ok";
}

const pool = new Pool({
  ...configConnection,
  application_name: "finn_web",
  idleTimeoutMillis: 3000,
});

const database = drizzle({
  client: pool,
  casing: "snake_case",
  schema: schemas,
});

export default database;
