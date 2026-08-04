import { NodePgDatabase } from "drizzle-orm/node-postgres";
import {
  SummaryCategoriesQuery,
  SummaryCategoriesQueryOutput,
  TCategories,
} from "./summary-categories.query";
import { endOfMonth, parse, startOfMonth, subMonths } from "date-fns";
import { and, eq, gte, inArray, lt, sql } from "drizzle-orm";
import { movements } from "@/infrastructure/database/schemas/movements";
import { categories } from "@/infrastructure/database/schemas/categories";
import { wallets } from "@/infrastructure/database/schemas/wallets";

export class SummaryCategoriesQueryHandler {
  private constructor(private readonly db: NodePgDatabase) {}

  public static create(db: NodePgDatabase) {
    return new SummaryCategoriesQueryHandler(db);
  }

  public async execute({
    referenceMonth,
    userId,
  }: SummaryCategoriesQuery): Promise<SummaryCategoriesQueryOutput> {
    const monthDate = parse(referenceMonth, "yyyy-MM", new Date());

    const interval = {
      start: startOfMonth(monthDate),
      end: endOfMonth(monthDate),
    };

    const walletsIdsQuery = await this.db
      .select({ id: wallets.id })
      .from(wallets)
      .where(eq(wallets.ownerId, userId));

    const walletsIds = walletsIdsQuery.map((w) => w.id);

    const [ctgCurrentResult, ctgLastMonthResult] = await Promise.all([
      this.db
        .select({
          id: categories.id,
          amount: sql`SUM(${movements.amount})`.mapWith(Number),
          type: categories.type,
          label: categories.label,
        })
        .from(movements)
        .rightJoin(categories, eq(movements.categoryId, categories.id))
        .where(
          and(
            gte(movements.executedAt, interval.start),
            lt(movements.executedAt, interval.end),
            inArray(movements.walletId, walletsIds),
          ),
        )
        .groupBy(categories.id),
      this.db
        .select({
          id: categories.id,
          amount: sql`SUM(${movements.amount})`.mapWith(Number),
        })
        .from(movements)
        .innerJoin(categories, eq(movements.categoryId, categories.id))
        .where(
          and(
            gte(movements.executedAt, subMonths(interval.start, 1)),
            lt(movements.executedAt, subMonths(interval.end, 1)),
            inArray(movements.walletId, walletsIds),
          ),
        )
        .groupBy(categories.id),
    ]);

    const MapCtgLastMonth = new Map<string, { id: string; amount: number }>();

    ctgLastMonthResult.forEach((ctg) => MapCtgLastMonth.set(ctg.id, ctg));

    const categoriesObj = ctgCurrentResult.map((qCtg) => {
      return {
        amount: qCtg.amount,
        amountLastMonth: MapCtgLastMonth.get(qCtg.id)?.amount ?? 0,
        label: qCtg.label,
        type: qCtg.type,
      };
    });

    return this.parseOutput(categoriesObj);
  }

  public parseOutput(
    ObjectCategories: TCategories[],
  ): SummaryCategoriesQueryOutput {
    const { categoriesExpenses, categoriesIncomes } = ObjectCategories.reduce(
      (result, ctg) => {
        if (ctg.type === "credito") {
          result.categoriesIncomes.push({
            ...ctg,
            amount: ctg.amount / 100,
            amountLastMonth: ctg.amountLastMonth / 100,
          });
        } else {
          result.categoriesExpenses.push({
            ...ctg,
            amount: ctg.amount / 100,
            amountLastMonth: ctg.amountLastMonth / 100,
          });
        }

        return result;
      },
      {
        categoriesIncomes: [] as TCategories[],
        categoriesExpenses: [] as TCategories[],
      },
    );

    return {
      incomes: {
        categories: categoriesIncomes.sort((a, b) => b.amount - a.amount),
      },
      expenses: {
        categories: categoriesExpenses.sort((a, b) => b.amount - a.amount),
      },
    };
  }
}
