import { IStatementRepository } from "@/features/transactions/statement/get-statement/statement.interface";
import { IMovementGateway } from "@/domain/repositories/movements.gateway";
import { GetStatementQuery } from "./get-statement.query";
import { cache } from "react";
import {
  FrequenciesReccurrent,
  StatusTransaction,
  TypesTransaction,
} from "@/domain/enums";

export interface StatementOutput {
  totalMovementsFromDb: number;
  page: number;
  limit: number;
  payload: TransactionDTO | null;
}

export interface TransactionDTO {
  movements: {
    id: string;
    type: TypesTransaction;
    description: string;
    amount: number;
    category: {
      id: string;
      label: string;
    } | null;
    isReversal: boolean;
    isRefunded: boolean;
    reversalOfId: string | null;
    walletId: string;
    executedAt: Date;
    reccurrent: string | null;
  }[];
  reccurrents: {
    id: string;
    type: TypesTransaction;
    status: StatusTransaction;
    description: string;
    amount: number;
    frequency: FrequenciesReccurrent;
    interval: number;
    installments: number | null;
    countPaid: number;
    categoryId: string;
    walletId: string;
    startDate: Date;
    endDate: Date | null;
    nextDueDate: Date | null;
  }[];
}

export class GetStatementHandler {
  private constructor(
    private readonly transactionRepository: IStatementRepository,
    private readonly movementsRepository: IMovementGateway,
  ) {}

  public static create(
    transactionRepository: IStatementRepository,
    movementsRepository: IMovementGateway,
  ) {
    return new GetStatementHandler(transactionRepository, movementsRepository);
  }

  public execute = cache(
    async (props: GetStatementQuery): Promise<StatementOutput> => {
      const { walletId, pagination, filters } = props;

      const date = {
        start: new Date(filters?.date.start),
        end: new Date(filters?.date.end + "T23:59:59.999"),
      };

      const transactions = await this.transactionRepository.getStatement({
        walletId,
        pagination,
        query: { date },
      });

      const count = await this.movementsRepository.count({
        walletId,
        query: {
          date,
          includeReversal: false,
        },
      });

      const result = {
        totalMovementsFromDb: count,
        page: pagination.page,
        limit: pagination.limit,
        payload: transactions,
      };

      return result;
    },
  );
}
