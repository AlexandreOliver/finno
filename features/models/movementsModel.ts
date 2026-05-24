import "server-only";
import db from "@/infra/database";
import { movements } from "@/infra/database/schemas/movements";
import { createInsertSchema } from "drizzle-zod";
import zod from "zod";
import { and, between, eq, SQL, desc, or } from "drizzle-orm";
import { categories } from "@/infra/database/schemas/categories";

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

async function create(movObject: TypeMovementsCreate) {
  const newMovement = movementsSchema.parse(movObject);

  await db.insert(movements).values(newMovement);
}

export type QueryParamsMovements = {
  limit?: number;
  page?: number;
  month?: number;
  year?: number;
};

export type ArgsFindAllMovements<K extends keyof ColumnsTypes> = {
  walletId: string;
  returnFields: readonly K[];
  query?: QueryParamsMovements;
};

export type FunctionFindAllMoviments = <K extends keyof ColumnsTypes>(
  args: ArgsFindAllMovements<K>,
) => Promise<Pick<ColumnsTypes, K>[]>;

const findByWalletIdForQuery: FunctionFindAllMoviments = async ({
  walletId,
  returnFields,
  query,
}) => {
  if (!walletId || returnFields.length === 0) return [];

  const selectCollumns = returnFields.reduce(
    (acc, column) => {
      acc[column] = movements[column];
      return acc;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    {} as any,
  );

  const filters: SQL[] = [];

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
    consulta = db.$with("sql").as(
      db
        .select(selectCollumns)
        .from(movements)
        .where(filters.length > 0 ? and(...filters) : undefined)
        .orderBy(movements.executedAt, desc(movements.amount))
        .offset(((query?.page ?? 1) - 1) * query.limit)
        .limit(query.limit),
    );
  } else {
    consulta = db.$with("sql").as(
      db
        .select(selectCollumns)
        .from(movements)
        .where(filters.length > 0 ? and(...filters) : undefined)
        .orderBy(movements.executedAt, desc(movements.amount)),
    );
  }
  const movementsResult = await db.with(consulta).select().from(consulta);

  return movementsResult as unknown as Pick<
    ColumnsTypes,
    (typeof returnFields)[number]
  >[];
};

const deleteById = async (movementId: string) => {
  const returnDb = await db
    .delete(movements)
    .where(eq(movements.id, movementId))
    .returning({ id: movements.id });

  return returnDb[0];
};

/**
 * Conta a quantidade de movimentos.
 *
 * @param walletId - UUIDv7 de uma carteira ou uma lista delas.
 * @returns A quantidade de registros de movimentos. Quando walletId é uma lista, retorna a soma total das movimentacoes de cada carteira
 *
 * @example
 * count("121212-121-1232-111111111111");
 *
 *  @example
 * count(["121212-121-1232-111111111111", 'wwwwwww232-333333-12-333333']);
 */
const count = async (walletId?: string | string[]) => {
  let count;

  if (Array.isArray(walletId)) {
    const filters: SQL[] = [];

    walletId.forEach((w) => filters.push(eq(movements.walletId, w)));

    count = await db.$count(movements, or(...filters));
    return count;
  }

  if (walletId) {
    count = await db.$count(movements, eq(movements.categoryId, walletId));
    return count;
  }

  count = await db.$count(movements);

  return count;
};

const findByIdWithCategory = async <
  K extends keyof Omit<ColumnsTypes, "categoryId">,
>({
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
};

const findByWalletIdWithCategory = async <
  K extends keyof Omit<ColumnsTypes, "categoryId">,
>({
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

    const category = await db
      .select(selectCollumns)
      .from(movements)
      .where(or(...filters))
      .orderBy(movements.executedAt, movements.amount)
      .leftJoin(categories, eq(categories.id, movements.categoryId));

    return category as unknown as Pick<
      ColumnsTypes,
      (typeof returnFields)[number]
    >[] &
      { labelCategory: string; categoryId: string }[];
  }

  const category = await db
    .select(selectCollumns)
    .from(movements)
    .where(eq(movements.walletId, walletId as string))
    .orderBy(movements.executedAt, movements.amount)
    .leftJoin(categories, eq(categories.id, movements.categoryId));

  return category as unknown as Pick<
    ColumnsTypes,
    (typeof returnFields)[number]
  >[] &
    { labelCategory: string; categoryId: string }[];
};

const movementsModel = {
  create,
  findByWalletIdForQuery,
  deleteById,
  count,
  findByIdWithCategory,
  findByWalletIdWithCategory,
};

export default movementsModel;
