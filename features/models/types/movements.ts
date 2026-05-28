import { movements } from "@/infra/database/schemas/movements";
import zod from "zod";
import { movementsSchema } from "../movementsModel";

export type ColumnsTypesMovement = typeof movements.$inferSelect;

export type TypeMovementsCreate = Omit<
  zod.infer<typeof movementsSchema>,
  "id" | "dueDate"
>;

export type QueryParamsMovements = {
  limit?: number;
  page?: number;
  month?: number;
  year?: number;
};

export type Pagination = {
  limit: number;
  page: number;
  pageSize: number;
};

export type TWithCategory = {
  labelCategory: string;
  categoryId: string;
};

export type TReturnFindAllMovements<K extends keyof ColumnsTypesMovement> =
  Pick<ColumnsTypesMovement, K>[];

export type FunctionFindAllMoviments = <
  K extends keyof ColumnsTypesMovement,
>(args: {
  walletId: string | string[];
  returnFields: readonly K[];
  query?: QueryParamsMovements;
  include?: {
    category?: true;
  };
}) => Promise<TReturnFindAllMovements<K>>;

export type FunctionCountMovements = (
  walletId?: string | string[],
  query?: Pick<QueryParamsMovements, "month">,
) => Promise<number>;

export type TReturnFindByIdWithCategory<
  K extends keyof Omit<ColumnsTypesMovement, "categoryId">,
> = (Pick<Omit<ColumnsTypesMovement, "categoryId">, K> & TWithCategory) | null;

export type FunctionFindByIdWithCategory = <
  K extends keyof Omit<ColumnsTypesMovement, "categoryId">,
>(
  id: string,
  returnFields: readonly K[],
) => Promise<TReturnFindByIdWithCategory<K>>;

export type TReturnFindByWalletIdWithCategory<
  K extends keyof Omit<ColumnsTypesMovement, "categoryId">,
> =
  | (Pick<Omit<ColumnsTypesMovement, "categoryId">, K>[] & TWithCategory[])
  | [];

export type FunctionFindByWalletIdWithCategory = <
  K extends keyof Omit<ColumnsTypesMovement, "categoryId">,
>(args: {
  walletId: string | string[];
  returnFields: readonly K[];
}) => Promise<TReturnFindByWalletIdWithCategory<K>>;
