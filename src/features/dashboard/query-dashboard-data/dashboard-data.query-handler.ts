import { endOfMonth, subMonths } from "date-fns";
import {
  DasboardDataQueryOutput,
  DashboardDataQuery,
} from "./dashboard-data.query";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { inArray, sql } from "drizzle-orm";
import { FinanceSummaryQueryService } from "@/features/Services/finance-summary.service-query";
import { snapshotsWallet } from "@/infrastructure/database/schemas/snapshotsWallet";

export class DasboardDataQueryHandler {
  private constructor(
    private readonly db: NodePgDatabase,
    private readonly financeSummaryService: FinanceSummaryQueryService,
  ) {}

  public static create(db: NodePgDatabase) {
    const financeSummaryService = new FinanceSummaryQueryService(db);
    return new DasboardDataQueryHandler(db, financeSummaryService);
  }

  public async execute(
    props: DashboardDataQuery,
  ): Promise<DasboardDataQueryOutput> {
    const { referenceMonth, userId } = props;

    const date = new Date(`${referenceMonth}-01T03:00:00.000Z`);

    const interval = {
      start: date,
      end: endOfMonth(date),
    };

    const intervalLastMonth = {
      start: subMonths(interval.start, 1),
      end: subMonths(interval.end, 1),
    };

    const queryWallet = await this.db.execute<{
      id: string;
      balance: string;
    }>(sql`
      SELECT 
        id,
        balance
      FROM 
        wallets 
      WHERE 
        owner_id = ${userId}
      ;
      `);

    if (
      Number.isSafeInteger(queryWallet.rowCount) &&
      queryWallet.rowCount === 0
    ) {
      throw new Error("Não foi encontrada wallet associado ao usuario");
    }

    const wallatsIds = queryWallet.rows.map((w) => w.id as string);

    const [
      SummaryCurrent,
      SummaryLastMonth,
      resultSummaryPerMonth,
      netWorthLastMonthQuery,
    ] = await Promise.all([
      this.financeSummaryService.summaryOfWalletsAtInverval({
        interval,
        walletIds: wallatsIds,
        excludeRefundedFromTotals: true,
      }),
      this.financeSummaryService.summaryOfWalletsAtInverval({
        interval: intervalLastMonth,
        walletIds: wallatsIds,
        excludeRefundedFromTotals: true,
      }),
      this.financeSummaryService.summaryPerMonthAtYear({
        referenceYear: interval.start.getFullYear(),
        walletIds: wallatsIds,
        excludeRefundedFromTotals: true,
      }),
      this.db.execute<{ networthlastmonth: string }>(sql`
          SELECT
            SUM(closing_balance) AS netWorthLastMonth
          FROM
            snapshots_wallet
          WHERE
            ${inArray(snapshotsWallet.walletId, wallatsIds)} AND
            snapshots_wallet.year_month = ${intervalLastMonth.start.toISOString()}
          GROUP BY
            snapshots_wallet.year_month
          `),
    ]);

    const netWorthLastMonth =
      netWorthLastMonthQuery.rowCount! > 0
        ? Number.parseInt(netWorthLastMonthQuery.rows[0].networthlastmonth)
        : 0;

    const summaryFinanceCurrent = SummaryCurrent.summaryOfWallets.reduce(
      (sum, data) => {
        sum.incomes += data.incomes;
        sum.expenses += data.expenses;

        return sum;
      },
      { incomes: 0, expenses: 0 },
    );

    const summaryFinanceLastMonth = SummaryLastMonth.summaryOfWallets.reduce(
      (sum, data) => {
        sum.incomes += data.incomes;
        sum.expenses += data.expenses;

        return sum;
      },
      { incomes: 0, expenses: 0 },
    );

    const SummaryPerMonth = resultSummaryPerMonth.summaryPerMonth.map(
      (sum) => ({
        ...sum,
        incomes: sum.incomes / 100,
        expenses: sum.expenses / 100,
      }),
    );

    const netWorthCurrent =
      netWorthLastMonth +
      summaryFinanceCurrent.incomes -
      summaryFinanceCurrent.expenses;

    return {
      month: interval.start.toLocaleDateString("pt-Br", { month: "long" }),
      data: {
        financeSummary: {
          walletsInQuery: {
            current: {
              expenses: summaryFinanceCurrent.expenses / 100,
              incomes: summaryFinanceCurrent.incomes / 100,
            },
            lastMonth: {
              expenses: summaryFinanceLastMonth.expenses / 100,
              incomes: summaryFinanceLastMonth.incomes / 100,
            },
          },
          netWorth: {
            currentAmount: netWorthCurrent / 100,
            amountLastMoth: netWorthLastMonth / 100,
          },
          summaryPerMonth: {
            referenceYear: resultSummaryPerMonth.referenceYear,
            summaryPerMonth: SummaryPerMonth,
          },
        },
      },
    };
  }
}
