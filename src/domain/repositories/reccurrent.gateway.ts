import { Reccurrent } from "../entity/reccurrent.entity";
import {
  FunctionDelete,
  FunctionSave,
  Pagination,
  QueryParams,
} from "../entity/types";

export interface IReccurrentGateway {
  save: FunctionSave<Reccurrent, { id: string }>;
  getById: FunctionGet<string, Reccurrent | null>;
  list: FunctionList<Reccurrent>;
  deleteById: FunctionDelete<boolean>;
  count: FunctionCount;
}

export type FunctionGet<T, R> = (id: T | T[]) => Promise<R | R[]>;

export type FunctionList<R> = (args: {
  walletId: string | string[];
  query?: Pick<QueryParams, "status">;
  pagination?: Pagination;
}) => Promise<R[]>;

export type FunctionCount = (args: {
  query?: Pick<QueryParams, "status">;
  walletId?: string | string[];
}) => Promise<number>;
