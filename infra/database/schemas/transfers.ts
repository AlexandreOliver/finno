import { check, decimal, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { v7 as uuid7 } from "uuid";
import { accounts } from "./accounts";
import { sql } from "drizzle-orm";

export const transfers = pgTable(
  "transfers",
  {
    id: uuid()
      .primaryKey()
      .$defaultFn(() => uuid7()),
    debited_account: uuid()
      .references(() => accounts.id, {
        onDelete: "cascade",
      })
      .notNull(),
    credited_account: uuid()
      .references(() => accounts.id)
      .notNull(),
    amount: decimal({ scale: 2, precision: 12 }).notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow(),
  },
  (table) => [
    check(
      "chck_contas_diferentes",
      sql`${table.credited_account} != ${table.debited_account}`,
    ),
    check("chck_amount_maior_q_0", sql`${table.amount} > 0`),
  ],
);
