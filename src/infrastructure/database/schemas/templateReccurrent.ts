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

export const templateReccurrent = pgTable(
  "template_reccurrent",
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
    startDate: timestamp({ withTimezone: true }).notNull(),
    endDate: timestamp({ withTimezone: true }),
    nextDueDate: timestamp({ withTimezone: true }),
  },
  (table) => [
    check("chck_amount_gt0", sql`${table.amount} > 0`),
    check("chck_interval_gt0", sql`${table.interval} > 0`),
    check("chck_start_before_end", sql`${table.endDate} > ${table.startDate}`),
    check(
      "chck_start_before_nextdue",
      sql`${table.nextDueDate} > ${table.startDate}`,
    ),
    check(
      "chck_end_afterOrEqual_nextdue",
      sql`${table.endDate} >= ${table.nextDueDate}`,
    ),
  ],
);
