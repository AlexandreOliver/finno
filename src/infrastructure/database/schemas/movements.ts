import {
  pgTable,
  uuid,
  text,
  decimal,
  timestamp,
  check,
  boolean,
  AnyPgColumn,
  index,
} from "drizzle-orm/pg-core";
import { typesEnum } from "./Enums";
import { categories } from "./categories";
import { wallets } from "./wallets";
import { templateReccurent } from "./templateReccurent";
import { sql } from "drizzle-orm";

export const movements = pgTable(
  "movements",
  {
    id: uuid().primaryKey(),
    type: typesEnum().notNull(),
    description: text().notNull(),
    amount: decimal({ scale: 2, precision: 12 }).notNull(),
    isReversal: boolean().default(false).notNull(),
    reversalOfId: uuid().references((): AnyPgColumn => movements.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    categoryId: uuid()
      .references(() => categories.id)
      .notNull(),
    walletId: uuid()
      .references(() => wallets.id)
      .notNull(),
    reccurentId: uuid().references(() => templateReccurent.id),
    executedAt: timestamp({ withTimezone: true }).notNull(),
    dueDate: timestamp({ withTimezone: true }),
  },
  (table) => [
    check("chck_amount_gt0", sql`${table.amount} > 0`),
    index("idx_movement_reversal").on(table.reversalOfId),
  ],
);
