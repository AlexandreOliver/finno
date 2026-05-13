import {
  decimal,
  index,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { v7 as uuid7 } from "uuid";
import { users } from "./users";

export const wallets = pgTable(
  "wallets",
  {
    id: uuid()
      .primaryKey()
      .$defaultFn(() => uuid7()),
    labelName: varchar({ length: 20 }).notNull(),
    ownerId: uuid()
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    balance: decimal({ precision: 12, scale: 2 }).default("0"),
    updatedAt: timestamp({ withTimezone: true }).defaultNow(),
    createdAt: timestamp({ withTimezone: true }).defaultNow(),
  },
  (table) => [index("idx_labelName").on(table.labelName)],
);
