import { sql } from "drizzle-orm";
import {
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid().primaryKey(),
    firstName: varchar({ length: 30 }).notNull(),
    lastName: varchar({ length: 50 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    password: varchar({ length: 60 }).notNull(),
    features: text()
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    createdAt: timestamp({ withTimezone: true }).notNull(),
    updatedAt: timestamp({ withTimezone: true }).notNull(),
  },
  (table) => [
    index("name_idx").on(table.firstName, table.lastName),
    index("features_idx").on(table.features),
  ],
);
