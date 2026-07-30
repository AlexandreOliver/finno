import { movements } from "@/infrastructure/database/schemas/movements";
import { wallets } from "@/infrastructure/database/schemas/wallets";
import { endOfMonth, startOfMonth } from "date-fns";
import { inArray, sql, eq, and, gte, lt, asc } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

export class FinanceSummaryQueryService {
  constructor(private readonly db: NodePgDatabase) {}

  public summaryOfWalletsAtInverval: FunctionSummaryOfWalletsAtInterval =
    async (props) => {
      const { interval, walletIds, excludeRefundedFromTotals } = props;
      if (excludeRefundedFromTotals === undefined) {
        throw new Error(
          "O campo excludeRefundedFromTotals precisa ser fornecido",
        );
      }

      const summaryFinance = await this.db
        .select({
          wallet: wallets.id,
          incomes:
            sql`SUM(CASE WHEN type = 'credito' THEN amount ELSE 0 END)`.mapWith(
              Number,
            ),
          expenses:
            sql`SUM(CASE WHEN type = 'debito' THEN amount ELSE 0 END)`.mapWith(
              Number,
            ),
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

      return {
        interval,
        summaryOfWallets: summaryFinance,
      };
    };

  public summaryPerDaysAtMonth: FunctionSummaryPerDaysAtMonth = async (
    props,
  ) => {
    const { referenceMonth, walletId, excludeRefundedFromTotals } = props;

    if (excludeRefundedFromTotals === undefined) {
      throw new Error(
        "O campo excludeRefundedFromTotals precisa ser fornecido",
      );
    }

    const date = startOfMonth(referenceMonth);

    const subquery = this.db
      .select({
        day: sql`CAST(${movements.executedAt} AS DATE) `.as("date"),
        amount: movements.amount,
        type: movements.type,
      })
      .from(movements)
      .where(
        and(
          inArray(movements.walletId, walletId),
          gte(movements.executedAt, date),
          lt(movements.executedAt, endOfMonth(date)),
          excludeRefundedFromTotals
            ? eq(movements.isReversal, false)
            : undefined,
          excludeRefundedFromTotals
            ? eq(movements.isRefunded, false)
            : undefined,
        ),
      )
      .as("subquery");

    const summaryFinance = await this.db
      .select({
        day: sql`${subquery.day}`.mapWith({
          mapFromDriverValue: (value) => {
            return `${value}T03:00:00.000Z`;
          },
        }),
        incomes:
          sql<number>`SUM(CASE WHEN ${subquery.type} = 'credito' THEN amount ELSE 0 END)`.mapWith(
            Number,
          ),
        expenses:
          sql<number>`SUM(CASE WHEN ${subquery.type} = 'debito' THEN amount ELSE 0 END)`.mapWith(
            Number,
          ),
      })
      .from(subquery)
      .groupBy(subquery.day)
      .orderBy(asc(subquery.day));

    let accExpenses = 0;
    let accIncomes = 0;
    const sum = summaryFinance.map((s) => {
      accExpenses += s.expenses;
      accIncomes += s.incomes;

      return {
        ...s,
        balanceAcc: accIncomes - accExpenses,
      };
    });

    return {
      month: referenceMonth.toLocaleDateString("pt-BR", { month: "long" }),
      summaryPerDays: sum,
    };
  };
}

type FunctionSummaryPerDaysAtMonth = (props: {
  walletId: string[];
  referenceMonth: Date;
  excludeRefundedFromTotals: boolean;
}) => Promise<{
  month: string;
  summaryPerDays: TSummaryPerDays[];
}>;

export type ReturnSummaryDaysAtMonth = Awaited<
  ReturnType<FunctionSummaryPerDaysAtMonth>
>;

export type TSummaryPerDays = {
  day: string;
  incomes: number;
  expenses: number;
  balanceAcc: number;
};

type FunctionSummaryOfWalletsAtInterval = (props: {
  walletIds: string[];
  interval: { start: Date; end: Date };
  excludeRefundedFromTotals: boolean;
}) => Promise<{
  interval: {
    start: Date;
    end: Date;
  };
  summaryOfWallets: TSummaryOfWallet[];
}>;

export type TSummaryOfWallet = {
  wallet: string;
  incomes: number;
  expenses: number;
};
