import { Reccurent } from "@/domain/reccurents/reccurent.entity";
import { IReccurentGateway } from "@/domain/reccurents/reccurent.gateway";
import { templateReccurent } from "@/infra/database/schemas/templateReccurent";
import db from "@/infra/database";
import { and, desc, eq, inArray, or, SQL } from "drizzle-orm";

export class ReccurentRepositoryDrizzle implements IReccurentGateway {
  private constructor(private readonly dbInstance: typeof db) {}

  public static create(dbInstance: typeof db) {
    return new ReccurentRepositoryDrizzle(dbInstance);
  }

  public save: IReccurentGateway["save"] = async (reccurent) => {
    const resultDb = await this.dbInstance
      .insert(templateReccurent)
      .values({ ...reccurent.toJson(), amount: reccurent.amount.toString() })
      .returning();

    return !!resultDb[0].id;
  };

  public getById: IReccurentGateway["getById"] = async (id) => {
    const filters: SQL[] = [];

    if (Array.isArray(id)) {
      filters.push(inArray(templateReccurent.id, id));
    } else {
      filters.push(eq(templateReccurent.id, id));
    }

    const resultFromDb = await this.dbInstance
      .select()
      .from(templateReccurent)
      .where(and(...filters));

    const reccurentResult = resultFromDb.map((r) => Reccurent.with(r));

    return reccurentResult.length === 1 ? reccurentResult[0] : reccurentResult;
  };

  public list: IReccurentGateway["list"] = async (args) => {
    const { walletId, pagination, query } = args;

    if ((Array.isArray(walletId) && walletId.length === 0) || !walletId)
      return [];

    const filters: SQL[] = [];

    if (Array.isArray(walletId)) {
      filters.push(inArray(templateReccurent.walletId, walletId));
    } else {
      filters.push(eq(templateReccurent.walletId, walletId));
    }

    if (query?.status) {
      filters.push(eq(templateReccurent.status, query.status));
    }

    let resultDb: (typeof templateReccurent.$inferSelect)[];

    if (pagination) {
      resultDb = await this.dbInstance
        .select()
        .from(templateReccurent)
        .where(and(...filters))
        .orderBy(desc(templateReccurent.amount))
        .offset(((pagination.page ?? 1) - 1) * pagination.limit)
        .limit(pagination.limit);
    } else {
      resultDb = await this.dbInstance
        .select()
        .from(templateReccurent)
        .where(and(...filters))
        .orderBy(desc(templateReccurent.amount));
    }

    const recurentList = resultDb.map((rec) => Reccurent.with(rec));

    return recurentList;
  };

  public deleteById: IReccurentGateway["deleteById"] = async (id) => {
    const resultFromDb = await this.dbInstance
      .delete(templateReccurent)
      .where(eq(templateReccurent.id, id))
      .returning();

    return resultFromDb.length > 0;
  };

  public count: IReccurentGateway["count"] = async (args) => {
    const { query, walletId } = args;

    let count;

    const filtersQuery: SQL[] = [];
    // if (query?.date && query.date.start && query.date.end) {
    //   filtersQuery.push(gte(templateReccurent.executedAt, query.date.start));
    //   filtersQuery.push(lt(templateReccurent.executedAt, query.date.end));
    // }

    if (Array.isArray(walletId)) {
      if (walletId.length === 0) return 0;

      const filters: SQL[] = [];

      walletId.forEach((w) => filters.push(eq(templateReccurent.walletId, w)));

      count = await this.dbInstance.$count(
        templateReccurent,
        and(
          or(...filters),
          filtersQuery.length > 0 ? and(...filtersQuery) : undefined,
        ),
      );
      return count;
    }

    if (walletId) {
      count = await this.dbInstance.$count(
        templateReccurent,
        eq(templateReccurent.walletId, walletId),
      );
      return count;
    }

    count = await this.dbInstance.$count(templateReccurent);

    return count;
  };
}
