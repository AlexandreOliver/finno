import {
  decimal,
  index,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { v7 as uuid7 } from "uuid";
import { users } from "./users";

export const accounts = pgTable(
  "accounts",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => uuid7()),
    labelName: varchar({ length: 20 }).notNull(),
    ownerId: text()
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    balance: decimal({ precision: 12, scale: 2 }).default("0"),
    updatedAt: timestamp({ withTimezone: true }).defaultNow(),
    createdAt: timestamp({ withTimezone: true }).defaultNow(),
  },
  (table) => [index("idx_labelName").on(table.labelName)],
);
