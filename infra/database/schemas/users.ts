import { sql } from "drizzle-orm";
import { index, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";

export const users = pgTable(
  "users",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    firstName: varchar({ length: 30 }).notNull(),
    lastName: varchar({ length: 50 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    password: varchar({ length: 60 }).notNull(),
    features: text()
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("name_idx").on(table.firstName, table.lastName),
    index("features_idx").on(table.features),
  ],
);
