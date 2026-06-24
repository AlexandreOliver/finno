import { Pagination, QueryParams } from "../movements/types";

import { ReccurentProps } from "../reccurents/reccurent.entity";

export type Transaction = {
  id: string;
  type: "debito" | "credito" | "investimento";
  description: string;
  amount: number;
  category: {
    id: string;
    label: string;
  } | null;
  walletId: string;
  reccurent: Omit<
    Required<ReccurentProps>,
    "type" | "description" | "amount" | "categoryId" | "walletId"
  > | null;
  executedAt: Date;
};

export interface ITransactionGateway {
  getStatement: FunctionStatement;
}

export type FunctionStatement = (args: {
  walletId: string | string[];
  query: QueryParams;
  pagination: Pagination;
}) => Promise<Transaction[]>;
