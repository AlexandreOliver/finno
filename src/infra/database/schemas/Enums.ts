import { pgEnum } from "drizzle-orm/pg-core";

export const typesEnum = pgEnum("types", ["debito", "credito", "investimento"]);

export const statusEnum = pgEnum("status", ["ativo", "pausado", "terminado"]);

export const frequencyEnum = pgEnum("frequency", [
  "daily",
  "weekly",
  "monthly",
  "yearly",
]);
