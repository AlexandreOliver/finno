import { pgEnum, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { v7 as uuid7 } from "uuid";
import { users } from "./users";

export const typesEnum = pgEnum("types", ["debito", "credito", "investimento"]);

export const categories = pgTable("categories", {
  id: uuid()
    .$defaultFn(() => uuid7())
    .primaryKey(),
  label: varchar({ length: 30 }).notNull(),
  description: varchar({ length: 100 }).notNull(),
  type: typesEnum().notNull(),
  userId: uuid().references(() => users.id),
});
