import { IStatementRepository } from "@/features/transactions/statement/get-statement/statement.interface";

import db from "@/infrastructure/database";
import { movements } from "@/infrastructure/database/schemas/movements";
import { categories } from "@/infrastructure/database/schemas/categories";

import {
  eq,
  inArray,
  SQL,
  and,
  gte,
  lt,
  sql,
  desc,
  lte,
  getTableColumns,
} from "drizzle-orm";
import { templateReccurent } from "@/infrastructure/database/schemas/templateReccurent";

export class StatementRepositoryDrizzle implements IStatementRepository {
  private constructor(private readonly dbInstance: typeof db) {}

  public static create(dbInstance: typeof db) {
    return new StatementRepositoryDrizzle(dbInstance);
  }

  public getStatement: IStatementRepository["getStatement"] = async ({
    walletId,
    pagination,
    query,
  }) => {
    const filtersMov: SQL[] = [];
    const filtersRec: SQL[] = [];

    if (Array.isArray(walletId)) {
      filtersMov.push(inArray(movements.walletId, walletId));

      filtersRec.push(inArray(templateReccurent.walletId, walletId));
    } else {
      filtersMov.push(eq(movements.walletId, walletId));

      filtersRec.push(eq(templateReccurent.walletId, walletId));
    }

    if (query?.date && query.date.start && query.date.end) {
      filtersMov.push(gte(movements.executedAt, query.date.start));
      filtersMov.push(lt(movements.executedAt, query.date.end));

      filtersRec.push(lte(templateReccurent.start_date, query.date.start));
      filtersRec.push(gte(templateReccurent.end_date, query.date.start));
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { categoryId, reccurentId, ...selectTableMovements } =
      getTableColumns(movements);

    const [movementsFromDb, movReccurentFromDb] = await Promise.all([
      this.dbInstance
        .select({
          ...selectTableMovements,
          amount: sql<number>`${movements.amount}`,
          category: {
            id: categories.id,
            label: categories.label,
          },
          reccurent: movements.reccurentId,
        })
        .from(movements)
        .leftJoin(categories, eq(categories.id, movements.categoryId))
        .where(and(...filtersMov, eq(movements.isReversal, false)))
        .offset((pagination.page - 1) * pagination.limit)
        .limit(pagination.limit)
        .orderBy(desc(movements.executedAt), desc(movements.amount)),

      this.dbInstance
        .select({
          ...getTableColumns(templateReccurent),
          amount: sql<number>`${templateReccurent.amount}`,
        })
        .from(templateReccurent)
        .where(and(...filtersRec))
        .orderBy(desc(templateReccurent.start_date)),
    ]);

    return {
      movements: movementsFromDb,
      reccurents: movReccurentFromDb,
    };
  };
}
