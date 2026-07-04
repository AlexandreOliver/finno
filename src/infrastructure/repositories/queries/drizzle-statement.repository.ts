import { IStatementRepository } from "@/features/transactions/statement/get-statement/statement.interface";

import db from "@/infrastructure/database";
import { movements } from "@/infrastructure/database/schemas/movements";
import { categories } from "@/infrastructure/database/schemas/categories";

import { eq, inArray, SQL, and, gte, lt, sql, desc } from "drizzle-orm";
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
    const filters: SQL[] = [];

    if (Array.isArray(walletId)) {
      filters.push(inArray(movements.walletId, walletId));
    } else {
      filters.push(eq(movements.walletId, walletId));
    }

    if (query?.date && query.date.start && query.date.end) {
      filters.push(gte(movements.executedAt, query.date.start));
      filters.push(lt(movements.executedAt, query.date.end));
    }

    const resultDb = await this.dbInstance
      .select({
        id: movements.id,
        type: movements.type,
        description: movements.description,
        amount: sql<number>`${movements.amount}`,
        category: {
          id: categories.id,
          label: categories.label,
        },
        walletId: movements.walletId,
        reccurent: {
          id: templateReccurent.id,
          status: templateReccurent.status,
          frequency: templateReccurent.frequency,
          interval: templateReccurent.interval,
          countPaid: templateReccurent.countPaid,
          installments: templateReccurent.installments,
          start_date: templateReccurent.start_date,
          end_date: templateReccurent.end_date,
          next_due_date: templateReccurent.next_due_date,
        },
        executedAt: movements.executedAt,
      })
      .from(movements)
      .leftJoin(categories, eq(categories.id, movements.categoryId))
      .leftJoin(
        templateReccurent,
        eq(templateReccurent.id, movements.reccurentId),
      )
      .where(and(...filters))
      .offset((pagination.page - 1) * pagination.limit)
      .limit(pagination.limit)
      .orderBy(desc(movements.executedAt), desc(movements.amount));

    return resultDb;
  };
}
