import { Reccurent } from "./reccurent.entity";
import {
  FunctionDelete,
  FunctionSave,
  Pagination,
  QueryParams,
} from "../movements/types";

export interface IReccurentGateway {
  save: FunctionSave<Reccurent, boolean>;
  getById: FunctionGet<string, Reccurent>;
  list: FunctionList<Reccurent>;
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
