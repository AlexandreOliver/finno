import {
  decimal,
  index,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const wallets = pgTable(
  "wallets",
  {
    id: uuid().primaryKey(),
    labelName: varchar({ length: 20 }).notNull(),
    ownerId: uuid()
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    balance: decimal({ precision: 12, scale: 2 }).default("0").notNull(),
    updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("idx_labelName").on(table.labelName)],
);
