import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  out: "src/infrastructure/database/migrations",
  schema: "src/infrastructure/database/schemas",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    ssl: process.env.NODE_ENV === "production",
  },
  casing: "snake_case",
  migrations: { schema: "public" },
});
