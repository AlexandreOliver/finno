import "server-only";
import db from "@/infra/database";
import { movements } from "@/infra/database/schemas/movements";
import { createInsertSchema } from "drizzle-zod";
import zod from "zod";
import { and, between, eq, SQL, desc, or, inArray } from "drizzle-orm";
import { categories } from "@/infra/database/schemas/categories";
import { PgColumn, PgSelect } from "drizzle-orm/pg-core";
import { cache } from "react";

export const movementsSchema = createInsertSchema(movements, {
  amount: (schema) =>
    zod
      .preprocess((val) => {
        if (typeof val !== "string") return val;
        const valor = val.trim();
        if (valor.includes(",")) {
          return valor.replace(/\./g, "").replace(",", ".");
        }
        return valor;
      }, schema)
      .refine((value) => !Number.isNaN(Number.parseFloat(value)), {
        error: "O Valor precisa ser um Número",
        abort: true,
      })
      .refine((value) => Number.parseFloat(value) > 0, {
        error: "O Valor Precisa ser maior do que 0",
      }),
  description: (schema) => schema.min(2, { error: "Descrição curta demais" }),
});

export type ColumnsTypes = typeof movements.$inferSelect;

type TypeMovementsCreate = Omit<
  zod.infer<typeof movementsSchema>,
  "id" | "dueDate"
>;

const create = cache(async (movObject: TypeMovementsCreate) => {
  const newMovement = movementsSchema.parse(movObject);

  await db.insert(movements).values(newMovement);
});

export type QueryParamsMovements = {
  limit?: number;
  page?: number;
  month?: number;
  year?: number;
};

export type ArgsFindAllMovements<K extends keyof ColumnsTypes> = {
  walletId: string | string[];
  returnFields: readonly K[];
  query?: QueryParamsMovements;
  include?: {
    category?: true;
  };
};

export type FunctionFindAllMoviments = <K extends keyof ColumnsTypes>(
  args: ArgsFindAllMovements<K>,
) => Promise<Pick<ColumnsTypes, K>[]>;

/**
 * Pesquisa todas as movimentações de uma ou mais wallets
 *
 * @param walletId - Uma UUIDv7 valida ou uma array delas.
 * @param returnFields - Especifica quais campos devem retornar de cada movimentação, se vazia nao retornará nada.
 * @param query - Especifica alguns filtros para pesquisar as movimentações
 * @param include - Inclui dados de tabelas relacionadas em cada movimentação
 *
 * @returns Uma array com varios objetos de movimentação, com campos iguais ao returnFields
 *
 * @example
 * findByWalletIdForQuery({
 *  walletId: '019e1dcf-f7dd-7c41-86c9-8da67aee78ee',
 *  returnFields: ['amount'],
 *  include: {
 *    category: true
 *  }
 * })
 * result = [
 *    {
 *     amount: '121.34',
 *     labelCategory: 'Energia',
 *     categoryId: '019frfcf-f7dd-7c41-86c9-8da67ahj78rr'
 *     }
 * ]
 */
const findByWalletIdForQuery: FunctionFindAllMoviments = cache(
  async ({ walletId, returnFields, query, include }) => {
    if (returnFields.length === 0) return [];
    if ((Array.isArray(walletId) && walletId.length === 0) || !walletId)
      return [];

    const selectCollumns = returnFields.reduce(
      (acc, column) => {
        acc[column] = movements[column];
        return acc;
      },
      collmnsInclude() as Record<string, PgColumn>,
    );

    const filters: SQL[] = [];

    if (Array.isArray(walletId)) {
      filters.push(inArray(movements.walletId, walletId));
    } else {
      filters.push(eq(movements.walletId, walletId));
    }

    if (query?.month) {
      const startDate = new Date(new Date().getFullYear(), query.month - 1, 1);
      const endDate = new Date(new Date().getFullYear(), query.month, 0);
      filters.push(between(movements.executedAt, startDate, endDate));
    }
    if (query?.year) {
      const startDate = new Date(query.year, new Date().getMonth());
      const endDate = new Date(query.year + 1, new Date().getMonth());
      filters.push(between(movements.executedAt, startDate, endDate));
    }

    let consulta;

    if (query?.limit) {
      consulta = db
        .select(selectCollumns)
        .from(movements)
        .where(and(...filters))
        .orderBy(movements.executedAt, desc(movements.amount))
        .offset(((query?.page ?? 1) - 1) * query.limit)
        .limit(query.limit)
        .$dynamic();
    } else {
      consulta = db
        .select(selectCollumns)
        .from(movements)
        .where(and(...filters))
        .orderBy(movements.executedAt, desc(movements.amount))
        .$dynamic();
    }

    let movementsResult = {};
    if (include?.category) {
      movementsResult = await withCategory(consulta);
    } else {
      movementsResult = await execute(consulta);
    }

    return movementsResult as unknown as Pick<
      ColumnsTypes,
      (typeof returnFields)[number]
    >[];

    async function withCategory<T extends PgSelect>(qb: T) {
      return qb.leftJoin(categories, eq(categories.id, movements.categoryId));
    }

    async function execute<T extends PgSelect>(qb: T) {
      return qb;
    }

    function collmnsInclude() {
      if (!include) {
        return {};
      }

      if (include.category) {
        return { labelCategory: categories.label, categoryId: categories.id };
      }

      return {};
    }
  },
);

const deleteById = cache(async (movementId: string) => {
  const returnDb = await db
    .delete(movements)
    .where(eq(movements.id, movementId))
    .returning({ id: movements.id });

  return returnDb[0];
});

/**
 * Conta a quantidade de movimentos.
 *
 * @param walletId - UUIDv7 de uma carteira ou uma lista delas.
 *
 * @return {number} A quantidade de registros de movimentos. Quando walletId é uma lista, retorna a soma total das movimentacoes de cada carteira
 *
 * @example
 * count("019e1dcf-f7dd-7c41-86c9-8da67aee78ee");
 *
 *  @example
 * count(["019e1dcf-f7dd-7c41-86c9-8da67aee78ee",
 *        "019e1dc7-df44-7810-afb6-5e56ac7becf1"]);
 */
const count = cache(async (walletId?: string | string[]) => {
  let count;

  if (Array.isArray(walletId)) {
    if (walletId.length === 0) return 0;

    const filters: SQL[] = [];

    walletId.forEach((w) => filters.push(eq(movements.walletId, w)));

    count = await db.$count(movements, or(...filters));
    return count;
  }

  if (walletId) {
    count = await db.$count(movements, eq(movements.walletId, walletId));
    return count;
  }

  count = await db.$count(movements);

  return count;
});

const findByIdWithCategory = cache(
  async <K extends keyof Omit<ColumnsTypes, "categoryId">>({
    id,
    returnFields,
  }: {
    id: string;
    returnFields: readonly K[];
  }) => {
    if (!id || returnFields.length === 0) return null;

    const selectCollumns = returnFields.reduce(
      (acc, column) => {
        acc[column] = movements[column];
        return acc;
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { labelCategory: categories.label, categoryId: categories.id } as any,
    );

    const category = await db
      .select(selectCollumns)
      .from(movements)
      .where(eq(movements.id, id))
      .leftJoin(categories, eq(categories.id, movements.categoryId));

    return category[0] as unknown as Pick<
      ColumnsTypes,
      (typeof returnFields)[number]
    >;
  },
);

const findByWalletIdWithCategory = cache(
  async <K extends keyof Omit<ColumnsTypes, "categoryId">>({
    walletId,
    returnFields,
  }: {
    walletId: string | string[];
    returnFields: readonly K[];
  }): Promise<
    | (Pick<ColumnsTypes, (typeof returnFields)[number]>[] &
        { labelCategory: string; categoryId: string }[])
    | []
  > => {
    if (returnFields.length === 0) return [];
    if ((Array.isArray(walletId) && walletId.length === 0) || !walletId)
      return [];

    const selectCollumns = returnFields.reduce(
      (acc, column) => {
        acc[column] = movements[column];
        return acc;
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { labelCategory: categories.label, categoryId: categories.id } as any,
    );

    const filters: SQL[] = [];

    if (Array.isArray(walletId)) {
      walletId.forEach((w) => filters.push(eq(movements.walletId, w)));
    }

    const category = await db
      .select(selectCollumns)
      .from(movements)
      .where(
        Array.isArray(walletId)
          ? or(...filters)
          : eq(movements.walletId, walletId as string),
      )
      .orderBy(movements.executedAt, movements.amount)
      .leftJoin(categories, eq(categories.id, movements.categoryId));

    return category as unknown as Pick<
      ColumnsTypes,
      (typeof returnFields)[number]
    >[] &
      { labelCategory: string; categoryId: string }[];
  },
);

const movementsModel = {
  create,
  findByWalletIdForQuery,
  deleteById,
  count,
  findByIdWithCategory,
  findByWalletIdWithCategory,
};

export default movementsModel;
