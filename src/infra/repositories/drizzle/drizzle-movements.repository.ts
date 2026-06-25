import { IMovementGateway } from "@/domain/movements/movements.gateway";
import { movements } from "@/infra/database/schemas/movements";

import { and, eq, SQL, desc, inArray, gte, lt, or } from "drizzle-orm";
import { PgSelect } from "drizzle-orm/pg-core";

// import { cache } from "react";

import { categories } from "@/infra/database/schemas/categories";
import db from "@/infra/database";
import { Movement } from "@/domain/movements/movements.entity";

export class MovementsRepositoryDrizzle implements IMovementGateway {
  private constructor(private readonly dbInstance: typeof db) {}

  public static create(dbInstance: typeof db) {
    return new MovementsRepositoryDrizzle(dbInstance);
  }

  public list: IMovementGateway["list"] = async ({
    walletId,
    pagination,
    query,
  }) => {
    //if (returnFields.length === 0) return [];
    if ((Array.isArray(walletId) && walletId.length === 0) || !walletId)
      return [];

    const filters: SQL[] = [];

    if (Array.isArray(walletId)) {
      filters.push(inArray(movements.walletId, walletId));
    } else {
      filters.push(eq(movements.walletId, walletId));
    }

    if (query && query.date) {
      filters.push(gte(movements.executedAt, query.date.start));
      if (query.date.end)
        filters.push(lt(movements.executedAt, query.date.end));
    }

    let resultDb: (typeof movements.$inferSelect)[];

    if (pagination) {
      resultDb = await this.dbInstance
        .select()
        .from(movements)
        .where(and(...filters))
        .orderBy(desc(movements.executedAt), desc(movements.amount))
        .offset(((pagination.page ?? 1) - 1) * pagination.limit)
        .limit(pagination.limit);
    } else {
      resultDb = await this.dbInstance
        .select()
        .from(movements)
        .where(and(...filters))
        .orderBy(desc(movements.executedAt), desc(movements.amount));
    }

    const movementList = resultDb.map((mov) => Movement.with(mov));

    return movementList;
  };

  public count: IMovementGateway["count"] = async ({ query, walletId }) => {
    let count;

    const filtersQuery: SQL[] = [];
    if (query?.date && query.date.start && query.date.end) {
      filtersQuery.push(gte(movements.executedAt, query.date.start));
      filtersQuery.push(lt(movements.executedAt, query.date.end));
    }

    if (Array.isArray(walletId)) {
      if (walletId.length === 0) return 0;

      const filters: SQL[] = [];

      walletId.forEach((w) => filters.push(eq(movements.walletId, w)));

      count = await this.dbInstance.$count(
        movements,
        and(
          or(...filters),
          filtersQuery.length > 0 ? and(...filtersQuery) : undefined,
        ),
      );
      return count;
    }

    if (walletId) {
      count = await this.dbInstance.$count(
        movements,
        eq(movements.walletId, walletId),
      );
      return count;
    }

    count = await this.dbInstance.$count(movements);

    return count;
  };

  public deleteById: IMovementGateway["deleteById"] = async (id) => {
    const result = await this.dbInstance
      .delete(movements)
      .where(eq(movements.id, id))
      .returning();

    return result.length > 0;
  };

  public save: IMovementGateway["save"] = async (movement) => {
    const valuesObject = movement.toJson();

    const result = await this.dbInstance
      .insert(movements)
      .values({ ...valuesObject, amount: movement.amount.toString() })
      .returning();

    return !!result[0].id;
  };

  //#region Metodos Privados
  async #whithCategory<T extends PgSelect>(query: T) {
    return query.leftJoin(categories, eq(categories.id, movements.categoryId));
  }

  async #execute<T extends PgSelect>(qb: T) {
    return qb;
  }

  #collmnsInclude(include?: { category?: true | undefined }) {
    if (!include) {
      return {};
    }

    if (include.category) {
      return { labelCategory: categories.label, categoryId: categories.id };
    }

    return {};
  }
  //#endregion
}
