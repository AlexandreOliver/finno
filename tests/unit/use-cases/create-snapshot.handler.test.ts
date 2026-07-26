import { describe, expect, test } from "@jest/globals";
import setupTestDb from "../../db-test";
import { SnapshotWalletsCommandHanlder } from "@/features/Routines/create-snapshot-wallet/snapshot-wallet.command-handler";
import { FinanceSummaryQueryService } from "@/features/Services/finance-sumary.service-query";
import { snapshotsWallet } from "@/infrastructure/database/schemas/snapshotsWallet";
import { eq } from "drizzle-orm";
import { startOfMonth } from "date-fns";
import { seed_wallets } from "@/infrastructure/defaultData";

const testDb = setupTestDb();

describe("SnapShot Wallet", () => {
  const startUseCase = () =>
    new SnapshotWalletsCommandHanlder(
      testDb.db,
      new FinanceSummaryQueryService(testDb.db),
    );

  test("gera novos snapshots", async () => {
    const genSnapshot = startUseCase();

    const result = await genSnapshot.execute();

    expect(result).toBe(true);

    const snap = await testDb.db
      .select()
      .from(snapshotsWallet)
      .where(eq(snapshotsWallet.yearMonth, startOfMonth(new Date())));

    expect(snap[0]).toStrictEqual({
      id: snap[0].id,
      walletId: seed_wallets[0].id,
      yearMonth: startOfMonth(new Date()),
      openingBalance: 711091,
      totalIncomes: 18323,
      totalExpenses: 0,
      closingBalance: 729414,
    });

    expect(snap[1]).toStrictEqual({
      id: snap[1].id,
      walletId: seed_wallets[1].id,
      yearMonth: startOfMonth(new Date()),
      openingBalance: 396286,
      totalIncomes: 390646,
      totalExpenses: 73591,
      closingBalance: 713341,
    });
  });
});
