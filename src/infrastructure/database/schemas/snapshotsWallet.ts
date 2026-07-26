import {
  decimal,
  snakeCase,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { wallets } from "./wallets";
import { v7 as uuidv7 } from "uuid";

export const snapshotsWallet = snakeCase.table(
  "snapshots_wallet",
  {
    id: uuid()
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    walletId: uuid()
      .references(() => wallets.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
    yearMonth: timestamp({ withTimezone: true }).notNull(),
    openingBalance: decimal({ scale: 2, precision: 12 }).notNull(),
    totalIncomes: decimal({ scale: 2, precision: 12 }).notNull(),
    totalExpenses: decimal({ scale: 2, precision: 12 }).notNull(),
    closingBalance: decimal({ scale: 2, precision: 12 }).notNull(),
  },
  (table) => [
    unique("unique_snapshot_WalletPerMonth").on(
      table.walletId,
      table.yearMonth,
    ),
  ],
);
