import {
  pgTable,
  uuid,
  text,
  decimal,
  timestamp,
  check,
} from "drizzle-orm/pg-core";
import { v7 as uuid7 } from "uuid";
import { typesEnum } from "./Enums";
import { categories } from "./categories";
import { accounts } from "./accounts";
import { templateReccurent } from "./templateReccurent";
import { sql } from "drizzle-orm";

export const movements = pgTable(
  "movements",
  {
    id: uuid()
      .primaryKey()
      .$defaultFn(() => uuid7()),
    type: typesEnum().notNull(),
    description: text().notNull(),
    amount: decimal({ scale: 2, precision: 12 }).notNull(),
    categoryId: uuid().references(() => categories.id),
    accountId: uuid().references(() => accounts.id),
    reccurentId: uuid().references(() => templateReccurent.id),
    executedAt: timestamp({ withTimezone: true }).defaultNow(),
    dueDate: timestamp({ withTimezone: true }).defaultNow(),
  },
  (table) => [
    check("chck_amount_gt0", sql`${table.amount} > 0`),
    check(
      "chck_due_afterOrEquals_nextdue",
      sql`${table.dueDate} >= ${table.executedAt}`,
    ),
  ],
);
