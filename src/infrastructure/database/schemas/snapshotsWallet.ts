import {
  bigint,
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
    openingBalance: bigint({ mode: "number" }).notNull(),
    totalIncomes: bigint({ mode: "number" }).notNull(),
    totalExpenses: bigint({ mode: "number" }).notNull(),
    closingBalance: bigint({ mode: "number" }).notNull(),
  },
  (table) => [
    unique("unique_snapshot_WalletPerMonth").on(
      table.walletId,
      table.yearMonth,
    ),
  ],
);
