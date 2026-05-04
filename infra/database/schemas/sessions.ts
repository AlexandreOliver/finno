import { pgTable, text, varchar, timestamp, index } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";
import { users } from "./users";

export const sessions = pgTable(
  "sessions",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => uuidv7()),

    token: varchar({ length: 96 }).notNull().unique(),
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
);
