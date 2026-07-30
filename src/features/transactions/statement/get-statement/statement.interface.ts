import { Pagination, QueryParams } from "@/domain/entity/types";
import { TransactionDTO } from "./get-statement.handler";

export interface IStatementRepository {
  getStatement: FunctionStatement;
}

export type FunctionStatement = (args: {
  walletId: string[];
  query: QueryParams;
  pagination: Pagination;
}) => Promise<TransactionDTO>;
