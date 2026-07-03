import {
  check,
  decimal,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { typesEnum, statusEnum, frequencyEnum } from "./Enums";
import { categories } from "./categories";
import { wallets } from "./wallets";
import { sql } from "drizzle-orm";

export const templateReccurent = pgTable(
  "template_reccurent",
  {
    id: uuid().primaryKey(),
    type: typesEnum().notNull(),
    status: statusEnum().notNull(),
    description: text().notNull(),
    amount: decimal({ scale: 2, precision: 12 }).notNull(),
    frequency: frequencyEnum().notNull(),
    interval: integer().notNull(),
    installments: integer(),
    countPaid: integer().notNull().default(0),
    categoryId: uuid()
      .references(() => categories.id)
      .notNull(),
    walletId: uuid()
      .references(() => wallets.id)
      .notNull(),
    start_date: timestamp({ withTimezone: true }).notNull(),
    end_date: timestamp({ withTimezone: true }),
    next_due_date: timestamp({ withTimezone: true }),
  },
  (table) => [
    check("chck_amount_gt0", sql`${table.amount} > 0`),
    check("chck_interval_gt0", sql`${table.interval} > 0`),
    check(
      "chck_start_before_end",
      sql`${table.end_date} > ${table.start_date}`,
    ),
    check(
      "chck_start_before_nextdue",
      sql`${table.next_due_date} > ${table.start_date}`,
    ),
    check(
      "chck_end_afterOrEqual_nextdue",
      sql`${table.end_date} >= ${table.next_due_date}`,
    ),
  ],
);
