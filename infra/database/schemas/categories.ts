import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";
import { typesEnum } from "./Enums";

export const categories = pgTable("categories", {
  id: uuid().primaryKey(),
  label: varchar({ length: 30 }).notNull(),
  description: varchar({ length: 100 }).notNull(),
  type: typesEnum().notNull(),
  userId: uuid().references(() => users.id),
});
