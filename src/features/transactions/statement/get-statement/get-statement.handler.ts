import { IStatementRepository } from "@/features/transactions/statement/get-statement/statement.interface";
import { IMovementGateway } from "@/domain/repositories/movements.gateway";
import { GetStatementQuery } from "./get-statement.query";

export interface StatementOutput {
  totalMovementsFromDb: number;
  page: number;
  limit: number;
  payload: TransactionDTO[] | [];
}

export interface TransactionDTO {
  id: string;
  type: "debito" | "credito" | "investimento";
  description: string;
  amount: number;
  category: {
    id: string;
    label: string;
  } | null;
  walletId: string;
  reccurent: {
    id: string;
    status: "ativo" | "pausado" | "terminado";
    frequency: "daily" | "weekly" | "monthly" | "yearly";
    interval: number;
    installments: number | null;
    countPaid: number;
    start_date: Date;
    end_date: Date | null;
    next_due_date: Date | null;
  } | null;
  executedAt: Date;
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

  public async execute(props: GetStatementQuery): Promise<StatementOutput> {
    const { walletId, pagination, filters } = props;

    const date = {
      start: new Date(new Date(filters?.date.start).setHours(0)),
      end: new Date(new Date(filters?.date.end).setHours(23, 59, 59, 999)),
    };

    const transactions = await this.transactionRepository.getStatement({
      walletId,
      pagination,
      query: { date },
    });

    const count = await this.movementsRepository.count({
      walletId,
      query: { date },
    });

    const result = {
      totalMovementsFromDb: count,
      page: pagination.page,
      limit: pagination.limit,
      payload: transactions,
    };

    return result;
  }
}
