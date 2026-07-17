import { check, decimal, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { wallets } from "./wallets";
import { sql } from "drizzle-orm";

export const transfers = pgTable(
  "transfers",
  {
    id: uuid().primaryKey(),
    debitedWallet: uuid()
      .references(() => wallets.id, {
        onDelete: "cascade",
      })
      .notNull(),
    creditedWallet: uuid()
      .references(() => wallets.id)
      .notNull(),
    amount: decimal({ scale: 2, precision: 12 }).notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow(),
  },
  (table) => [
    check(
      "chck_contas_diferentes",
      sql`${table.creditedWallet} != ${table.debitedWallet}`,
    ),
    check("chck_amount_maior_q_0", sql`${table.amount} > 0`),
  ],
);
