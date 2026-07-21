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
import { templateReccurrent } from "./templateReccurrent";
import { sql } from "drizzle-orm";

export const movements = pgTable(
  "movements",
  {
    id: uuid().primaryKey(),
    type: typesEnum().notNull(),
    description: text().notNull(),
    amount: decimal({ scale: 2, precision: 12 }).notNull(),
    isRefunded: boolean().default(false).notNull(),
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
    reccurrentId: uuid().references(() => templateReccurrent.id),
    executedAt: timestamp({ withTimezone: true }).notNull(),
    dueDate: timestamp({ withTimezone: true }),
  },
  (table) => [
    check("chck_amount_gt0", sql`${table.amount} > 0`),
    check(
      "chck_isRefunded_Or_isReversal",
      sql`NOT(${table.isRefunded} AND ${table.isReversal})`,
    ),
    check(
      "chck_reversal_integrity",
      sql`(${table.isReversal} = TRUE AND ${table.reversalOfId} IS NOT NULL) OR 
          (${table.isReversal} = FALSE AND ${table.reversalOfId} IS NULL)
      
      `,
    ),
    index("idx_movement_reversal").on(table.reversalOfId),
  ],
);
