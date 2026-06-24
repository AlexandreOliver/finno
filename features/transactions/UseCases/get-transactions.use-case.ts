import { ITransactionGateway } from "@/domain/transactions/transactions.gateway";
import { IMovementGateway } from "@/domain/movements/movements.gateway";
import { Transaction } from "@/domain/transactions/transactions.gateway";

type TransactionOutput = {
  totalMovementsFromDb: number;
  page: number;
  limit: number;
  payload: Transaction[] | [];
};

export class GetTransactionsUseCase {
  private constructor(
    private readonly transactionRepository: ITransactionGateway,
    private readonly movementsRepository: IMovementGateway,
  ) {}

  public static create(
    transactionRepository: ITransactionGateway,
    movementsRepository: IMovementGateway,
  ) {
    return new GetTransactionsUseCase(
      transactionRepository,
      movementsRepository,
    );
  }

  public async execute({
    walletId,
    pagination,
    query,
  }: {
    walletId: string | string[];
    pagination: { limit: number; page: number };
    query: { date: { start: string; end: string } };
  }): Promise<TransactionOutput> {
    const date = {
      start: new Date(new Date(query?.date.start).setHours(0)),
      end: new Date(new Date(query?.date.end).setHours(23, 59, 59, 999)),
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
