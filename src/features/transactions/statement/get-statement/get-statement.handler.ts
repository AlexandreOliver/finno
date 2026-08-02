import { IStatementRepository } from "@/features/transactions/statement/get-statement/statement.interface";
import { IMovementGateway } from "@/domain/repositories/movements.gateway";
import { GetStatementQuery } from "./get-statement.query";
import { cache } from "react";
import {
  FrequenciesReccurrent,
  StatusTransaction,
  TypesTransaction,
} from "@/domain/enums";
import { FinanceSummaryQueryService } from "@/features/Services/finance-summary.service-query";
import { addHours } from "date-fns";

export interface StatementOutput {
  totalMovementsFromDb: number;
  page: number;
  limit: number;
  payload: TransactionDTO | null;
  summaryPerDays: {
    day: string;
    incomes: number;
    expenses: number;
    balanceAcc: number;
  }[];
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
    private readonly financeSummaryService: FinanceSummaryQueryService,
  ) {}

  public static create(
    transactionRepository: IStatementRepository,
    movementsRepository: IMovementGateway,
    financeSummaryService: FinanceSummaryQueryService,
  ) {
    return new GetStatementHandler(
      transactionRepository,
      movementsRepository,
      financeSummaryService,
    );
  }

  public execute = cache(
    async (props: GetStatementQuery): Promise<StatementOutput> => {
      const { walletId, pagination, filters } = props;

      const date = {
        start: new Date(filters?.date.start + "T00:00:00.000"),
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

      const query = await this.financeSummaryService.summaryPerDaysAtMonth({
        walletId: walletId as string[],
        referenceMonth: addHours(date.start, 3),
        excludeRefundedFromTotals: true,
      });

      const summaryPerDays = query.summaryPerDays.map((sum) => {
        return {
          day: sum.day,
          incomes: sum.incomes / 100,
          expenses: sum.expenses / 100,
          balanceAcc: sum.balanceAcc / 100,
        };
      });

      const result = {
        totalMovementsFromDb: count,
        page: pagination.page,
        limit: pagination.limit,
        payload: this.formatedOutput(transactions),
        summaryPerDays,
      };

      return result;
    },
  );

  private formatedOutput(transactions: TransactionDTO): TransactionDTO {
    return {
      movements: transactions.movements.map((mov) => {
        return {
          ...mov,
          amount: mov.amount / 100,
        };
      }),
      reccurrents: transactions.reccurrents.map((rec) => {
        return {
          ...rec,
          amount: rec.amount / 100,
        };
      }),
    };
  }
}
