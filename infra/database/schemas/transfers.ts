import { check, decimal, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { wallets } from "./wallets";
import { sql } from "drizzle-orm";

export const transfers = pgTable(
  "transfers",
  {
    id: uuid().primaryKey(),
    debited_wallet: uuid()
      .references(() => wallets.id, {
        onDelete: "cascade",
      })
      .notNull(),
    credited_wallet: uuid()
      .references(() => wallets.id)
      .notNull(),
    amount: decimal({ scale: 2, precision: 12 }).notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow(),
  },
  (table) => [
    check(
      "chck_contas_diferentes",
      sql`${table.credited_wallet} != ${table.debited_wallet}`,
    ),
    check("chck_amount_maior_q_0", sql`${table.amount} > 0`),
  ],
);
