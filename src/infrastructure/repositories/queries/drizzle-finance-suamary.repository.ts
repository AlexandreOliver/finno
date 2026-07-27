import { DashboardDataRepository } from "@/features/dashboard/query-dashboard-data/dashboard-data.interface";
import { eq, and, gte, lt, inArray, sql, sum } from "drizzle-orm";
import db from "@/infrastructure/database";
import { movements } from "@/infrastructure/database/schemas/movements";
import { SumaryWalletsDTO } from "@/features/dashboard/query-dashboard-data/dashboard-data.query";
import { wallets } from "@/infrastructure/database/schemas/wallets";

export class DrizzleFinanceSumaryRepsitory implements DashboardDataRepository {
  private constructor(private readonly dbInstance: typeof db) {}

  public static create(dbInstance: typeof db) {
    return new DrizzleFinanceSumaryRepsitory(dbInstance);
  }

  public getSumary: DashboardDataRepository["getSumary"] = async ({
    interval,
    walletsQuery,
  }) => {
    const walletIds = walletsQuery.map((w) => w.id);

    const sumaryWallets = await this.dbInstance
      .select({
        wallet: wallets.labelName,
        incomes: sql`SUM(CASE WHEN type = 'credito' THEN amount ELSE 0 END)`,
        expenses: sql`SUM(CASE WHEN type = 'debito' THEN amount ELSE 0 END)`,
      })
      .from(movements)
      .innerJoin(wallets, eq(movements.walletId, wallets.id))
      .where(
        and(
          inArray(movements.walletId, walletIds),
          gte(movements.executedAt, interval.start),
          lt(movements.executedAt, interval.end),
          eq(movements.isRefunded, false),
          eq(movements.isReversal, false),
        ),
      )
      .groupBy(wallets.labelName);

    return {
      success: true,
      data: sumaryWallets as unknown as SumaryWalletsDTO[],
    };
  };

  public getNetWorth: DashboardDataRepository["getNetWorth"] = async ({
    walletsQuery,
  }) => {
    const walletIds = walletsQuery.map((w) => w.id);

    const netWorth = await this.dbInstance
      .select({
        amount: sum(wallets.balance),
      })
      .from(wallets)
      .where(and(inArray(wallets.id, walletIds)));

    return netWorth[0] as { amount: string };
  };
}
