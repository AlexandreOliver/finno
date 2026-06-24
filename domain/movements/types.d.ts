export type FunctionSave<T, R> = (entity: T) => Promise<R>;

export type FunctionList<R> = (args: {
  walletId: string | string[];
  query: Pick<QueryParams, "date">;
  pagination?: Pagination;
}) => Promise<R[]>;

export type FunctionDelete<R> = (id: string) => Promise<R>;

export type FunctionCount = (args: {
  query?: Pick<QueryParams, "date">;
  walletId?: string | string[];
}) => Promise<number>;

export type ArgsFindAll = {
  walletId: string | string[];
  query: Pick<QueryParams, "date">;
  pagination?: Pagination;
};

// export type FunctionFindAll<T> = <K extends readonly (keyof T)[]>(
//   args: ArgsFindAll,
// ) => Promise<TReturnFindAll<T, K[number]>>;

export type TReturnFindAll<T, K extends keyof T> = Pick<T, K>[];

export type QueryParams = {
  date?: {
    start?: Date;
    end?: Date;
  };
  status?: "ativo" | "pausado" | "terminado";
};

export type Pagination = {
  limit: number;
  page: number;
};
