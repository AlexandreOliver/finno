import { Reccurrent } from "@/domain/entity/reccurrent.entity";
import { IReccurrentGateway } from "@/domain/repositories/reccurrent.gateway";
import { templateReccurrent } from "@/infrastructure/database/schemas/templateReccurrent";
import db from "@/infrastructure/database";
import { and, desc, eq, inArray, or, SQL } from "drizzle-orm";

export class reccurrentRepositoryDrizzle implements IReccurrentGateway {
  private constructor(private readonly dbInstance: typeof db) {}

  public static create(dbInstance: typeof db) {
    return new reccurrentRepositoryDrizzle(dbInstance);
  }

  public save: IReccurrentGateway["save"] = async (reccurrent) => {
    const resultDb = await this.dbInstance
      .insert(templateReccurrent)
      .values({ ...reccurrent.toJson(), amount: reccurrent.amount.toString() })
      .returning();

    return !!resultDb[0].id;
  };

  public getById: IReccurrentGateway["getById"] = async (id) => {
    const filters: SQL[] = [];

    if (Array.isArray(id)) {
      filters.push(inArray(templateReccurrent.id, id));
    } else {
      filters.push(eq(templateReccurrent.id, id));
    }

    const resultFromDb = await this.dbInstance
      .select()
      .from(templateReccurrent)
      .where(and(...filters));

    const reccurrentResult = resultFromDb.map((r) => Reccurrent.with(r));

    return reccurrentResult.length === 1
      ? reccurrentResult[0]
      : reccurrentResult;
  };

  public list: IReccurrentGateway["list"] = async (args) => {
    const { walletId, pagination, query } = args;

    if ((Array.isArray(walletId) && walletId.length === 0) || !walletId)
      return [];

    const filters: SQL[] = [];

    if (Array.isArray(walletId)) {
      filters.push(inArray(templateReccurrent.walletId, walletId));
    } else {
      filters.push(eq(templateReccurrent.walletId, walletId));
    }

    if (query?.status) {
      filters.push(eq(templateReccurrent.status, query.status));
    }

    let resultDb: (typeof templateReccurrent.$inferSelect)[];

    if (pagination) {
      resultDb = await this.dbInstance
        .select()
        .from(templateReccurrent)
        .where(and(...filters))
        .orderBy(desc(templateReccurrent.amount))
        .offset(((pagination.page ?? 1) - 1) * pagination.limit)
        .limit(pagination.limit);
    } else {
      resultDb = await this.dbInstance
        .select()
        .from(templateReccurrent)
        .where(and(...filters))
        .orderBy(desc(templateReccurrent.amount));
    }

    const recurentList = resultDb.map((rec) => Reccurrent.with(rec));

    return recurentList;
  };

  public deleteById: IReccurrentGateway["deleteById"] = async (id) => {
    const resultFromDb = await this.dbInstance
      .delete(templateReccurrent)
      .where(eq(templateReccurrent.id, id))
      .returning();

    return resultFromDb.length > 0;
  };

  public count: IReccurrentGateway["count"] = async (args) => {
    const { query, walletId } = args;

    let count;

    const filtersQuery: SQL[] = [];
    // if (query?.date && query.date.start && query.date.end) {
    //   filtersQuery.push(gte(templateReccurrent.executedAt, query.date.start));
    //   filtersQuery.push(lt(templateReccurrent.executedAt, query.date.end));
    // }

    if (Array.isArray(walletId)) {
      if (walletId.length === 0) return 0;

      const filters: SQL[] = [];

      walletId.forEach((w) => filters.push(eq(templateReccurrent.walletId, w)));

      count = await this.dbInstance.$count(
        templateReccurrent,
        and(
          or(...filters),
          filtersQuery.length > 0 ? and(...filtersQuery) : undefined,
        ),
      );
      return count;
    }

    if (walletId) {
      count = await this.dbInstance.$count(
        templateReccurrent,
        eq(templateReccurrent.walletId, walletId),
      );
      return count;
    }

    count = await this.dbInstance.$count(templateReccurrent);

    return count;
  };
}
