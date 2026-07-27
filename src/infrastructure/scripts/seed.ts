import { schemas } from "../database/schemas";
import {
  seed_categorias,
  seed_movements,
  seed_templateReccurrent,
  seed_users,
  seed_shapshotsWallet,
  seed_wallets,
  walletsIds,
} from "../defaultData";
import db from "../database/index";
import { inArray, sql } from "drizzle-orm";
// import { SnapshotWalletsCommandHanlder } from "@/features/Routines/create-snapshot-wallet/snapshot-wallet.command-handler";
// import { FinanceSummaryQueryService } from "@/features/Services/finance-sumary.service-query";

async function sedding() {
  console.log("Iniciando seeding...");

  try {
    await db.insert(schemas.users).values(seed_users).onConflictDoNothing();

    await db
      .insert(schemas.categories)
      .values(seed_categorias)
      .onConflictDoNothing();

    await db
      .insert(schemas.wallets)
      .values(seed_wallets)
      .onConflictDoUpdate({
        target: schemas.wallets.id,
        set: {
          createdAt: sql`excluded.created_at`,
          balance: sql`excluded.balance`,
          updatedAt: sql`excluded.updated_at`,
          labelName: sql`excluded.label_name`,
        },
      });

    await db
      .insert(schemas.templateReccurrent)
      .values(seed_templateReccurrent)
      .onConflictDoUpdate({
        target: schemas.templateReccurrent.id,
        set: {
          startDate: sql`excluded.start_date`,
          endDate: sql`excluded.end_date`,
          nextDueDate: sql`excluded.next_due_date`,
        },
      });

    await db
      .insert(schemas.movements)
      .values(seed_movements)
      .onConflictDoUpdate({
        target: schemas.movements.id,
        set: {
          executedAt: sql`excluded.executed_at`,
        },
      });

    await db
      .delete(schemas.snapshotsWallet)
      .where(inArray(schemas.snapshotsWallet.walletId, walletsIds));

    await db
      .insert(schemas.snapshotsWallet)
      .values(seed_shapshotsWallet)
      .onConflictDoUpdate({
        target: schemas.snapshotsWallet.id,
        set: {
          id: sql`excluded.id`,
          walletId: sql`excluded.wallet_id`,
          yearMonth: sql`excluded.year_month`,
          openingBalance: sql`excluded.opening_balance`,
          totalIncomes: sql`excluded.total_incomes`,
          totalExpenses: sql`excluded.total_expenses`,
          closingBalance: sql`excluded.closing_balance`,
        },
      });

    // await db
    //   .insert(schemas.transfers)
    //   .values(seed_transfers)
    //   .onConflictDoNothing();

    // const genSnapshotWallets = new SnapshotWalletsCommandHanlder(
    //   db,
    //   new FinanceSummaryQueryService(db),
    // );

    // await genSnapshotWallets.execute(new Date("2025-10-01T13:00:00"));
    // await genSnapshotWallets.execute(new Date("2025-11-01T13:00:00"));
    // await genSnapshotWallets.execute(new Date("2025-12-01T13:00:00"));
    // await genSnapshotWallets.execute(new Date("2026-01-01T13:00:00"));
    // await genSnapshotWallets.execute(new Date("2026-02-01T13:00:00"));
    // await genSnapshotWallets.execute(new Date("2026-03-01T13:00:00"));
    // await genSnapshotWallets.execute(new Date("2026-04-01T13:00:00"));
    // await genSnapshotWallets.execute(new Date("2026-05-01T13:00:00"));
    // await genSnapshotWallets.execute(new Date("2026-06-01T13:00:00"));
  } catch (err) {
    const erro = err as Error;
    console.error(erro);
    process.exit(1);
  } finally {
    await db.$client.end();
  }

  console.log("Sedding Completa\n");
}

sedding();
