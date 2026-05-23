import "server-only";
import db from "@/infra/database";
import { categories } from "@/infra/database/schemas/categories";
import { createInsertSchema } from "drizzle-zod";
import zod from "zod";
import { eq, isNull, or } from "drizzle-orm";

export const categorySchema = createInsertSchema(categories);

type TypeCategoryCreate = Omit<
  zod.infer<typeof categorySchema>,
  "id" | "dueDate"
>;

async function create(movObject: TypeCategoryCreate) {
  const newCategory = categorySchema.parse(movObject);

  await db.insert(categories).values(newCategory);
}

type ColumnsTypes = typeof categories.$inferSelect;

export type FunctionFindAll = <K extends keyof ColumnsTypes>({
  userId,
  returnFields,
}: {
  userId?: string;
  returnFields: readonly K[];
}) => Promise<Pick<ColumnsTypes, K>[]>;

const findAll: FunctionFindAll = async ({ userId, returnFields }) => {
  if (returnFields.length === 0) {
    return [];
  }

  const selectCollumns = returnFields.reduce(
    (acc, column) => {
      acc[column] = categories[column];
      return acc;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    {} as any,
  );

  const categoriesList = await db
    .select(selectCollumns)
    .from(categories)
    .where(or(isNull(categories.userId), eq(categories.userId, userId ?? "")));

  return categoriesList as unknown as Pick<
    ColumnsTypes,
    (typeof returnFields)[number]
  >[];
};

export type FunctionFindId = <K extends keyof ColumnsTypes>({
  id,
  returnFields,
}: {
  id: string;
  returnFields: readonly K[];
}) => Promise<Pick<ColumnsTypes, K> | null>;

const findById: FunctionFindId = async ({ id, returnFields }) => {
  if (!id || returnFields.length === 0) return null;

  const selectCollumns = returnFields.reduce(
    (acc, column) => {
      acc[column] = categories[column];
      return acc;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    {} as any,
  );

  const category = await db
    .select(selectCollumns)
    .from(categories)
    .where(eq(categories.id, id));

  return category[0] as unknown as Pick<
    ColumnsTypes,
    (typeof returnFields)[number]
  >;
};

const categoriesModel = {
  create,
  findAll,
  findById,
};

export default categoriesModel;
