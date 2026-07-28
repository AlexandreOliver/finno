import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { wallets } from "@/infrastructure/database/schemas/wallets";
import { snapshotsWallet } from "@/infrastructure/database/schemas/snapshotsWallet";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { eq } from "drizzle-orm";
import { FinanceSummaryQueryService } from "@/features/Services/finance-summary.service-query";

export class SnapshotWalletsCommandHanlder {
  constructor(
    private readonly db: NodePgDatabase,
    private readonly financeSumaryService: FinanceSummaryQueryService,
  ) {}

  public async execute(referenceMonth?: Date): Promise<boolean> {
    const date = referenceMonth ?? new Date();

    if (
      date.toLocaleDateString("pt-BR") !=
      endOfMonth(new Date()).toLocaleDateString("pt-BR")
    ) {
      throw new Error("Um Snapshot só pode ser gerado no fim do mes");
    }

    const all_Wallets = await this.db.select({ id: wallets.id }).from(wallets);

    const walletsIds = all_Wallets.map((w) => w.id);

    const lastMonth = startOfMonth(subMonths(date, 1));

    const intervalSummaryFinance = {
      start: startOfMonth(date),
      end: endOfMonth(date),
    };

    const [all_SummaryFinanceWallets, all_LastSnapshots] = await Promise.all([
      this.financeSumaryService.sumaryOfWalletsAtInverval({
        interval: intervalSummaryFinance,
        walletIds: walletsIds,
        excludeRefundedFromTotals: false,
      }),

      this.db
        .select({
          walletId: snapshotsWallet.walletId,
          lastBalance: snapshotsWallet.closingBalance,
        })
        .from(snapshotsWallet)
        .where(eq(snapshotsWallet.yearMonth, lastMonth)),
    ]);

    // console.log(all_LastSnapshots);
    // console.log(all_SummaryFinanceWallets);

    const Map_LastSnapshots = new Map<string, { openingBalance: number }>();
    const Map_SummaryFincanceWallets = new Map<
      string,
      { incomes: number; expenses: number }
    >();

    all_SummaryFinanceWallets.forEach((sum) =>
      Map_SummaryFincanceWallets.set(sum.wallet, {
        expenses: Number(sum.expenses),
        incomes: Number(sum.incomes),
      }),
    );

    all_LastSnapshots.forEach((snap) =>
      Map_LastSnapshots.set(snap.walletId, {
        openingBalance: Number(snap.lastBalance),
      }),
    );

    const newSnapshots = all_Wallets.map((w) => {
      const openingBalance = Number(
        Map_LastSnapshots.get(w.id)?.openingBalance ?? 0,
      );
      const summary = Map_SummaryFincanceWallets.get(w.id) ?? {
        incomes: 0,
        expenses: 0,
      };

      const closingBalance =
        openingBalance + summary.incomes - summary.expenses;

      return {
        walletId: w.id,
        yearMonth: intervalSummaryFinance.start,
        openingBalance: openingBalance,
        totalIncomes: summary.incomes,
        totalExpenses: summary.expenses,
        closingBalance: closingBalance,
      };
    });

    // console.log(newSnapshots);

    await this.db
      .insert(snapshotsWallet)
      .values(newSnapshots)
      .onConflictDoNothing();

    return true;
  }
}
