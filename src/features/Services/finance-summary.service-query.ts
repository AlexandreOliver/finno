import { movements } from "@/infrastructure/database/schemas/movements";
import { wallets } from "@/infrastructure/database/schemas/wallets";
import { inArray, sql, eq, and, gte, lt } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

export class FinanceSummaryQueryService {
  constructor(private readonly db: NodePgDatabase) {}

  public async sumaryOfWalletsAtInverval(props: {
    interval: { start: Date; end: Date };
    walletIds: string[];
    excludeRefundedFromTotals: boolean;
  }): Promise<TSumaryOfWallet[]> {
    const { interval, walletIds, excludeRefundedFromTotals } = props;
    if (excludeRefundedFromTotals === undefined) {
      throw new Error(
        "O campo excludeRefundedFromTotals precisa ser fornecido",
      );
    }

    const summaryFinance = await this.db
      .select({
        wallet: wallets.id,
        incomes: sql<string>`SUM(CASE WHEN type = 'credito' THEN amount ELSE 0 END)`,
        expenses: sql<string>`SUM(CASE WHEN type = 'debito' THEN amount ELSE 0 END)`,
      })
      .from(movements)
      .innerJoin(wallets, eq(movements.walletId, wallets.id))
      .where(
        and(
          inArray(movements.walletId, walletIds),
          excludeRefundedFromTotals
            ? eq(movements.isReversal, false)
            : undefined,
          excludeRefundedFromTotals
            ? eq(movements.isRefunded, false)
            : undefined,
          gte(movements.executedAt, interval.start),
          lt(movements.executedAt, interval.end),
        ),
      )
      .groupBy(wallets.id);

    return summaryFinance;
  }
}

export type TSumaryOfWallet = {
  wallet: string;
  incomes: string;
  expenses: string;
};
