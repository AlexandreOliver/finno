import { startOfMonth, endOfMonth } from "date-fns";
import { GetFinanceSumaryRepository } from "./get-finance-sumary.interface";
import {
  FinanceSumaryDTO,
  GetFinanceSumaryQuery,
} from "./get-finance-sumary.query";

export class GetFinanceSumaryHandler {
  private constructor(
    private readonly financeSumaryRepository: GetFinanceSumaryRepository,
  ) {}

  public static create(financeSumaryRepository: GetFinanceSumaryRepository) {
    return new GetFinanceSumaryHandler(financeSumaryRepository);
  }

  public async execute(
    props: GetFinanceSumaryQuery,
  ): Promise<FinanceSumaryDTO | null> {
    const { currentDate, wallets } = props;

    const interval = {
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate),
    };

    const result = await this.financeSumaryRepository.getSumary({
      walletsQuery: wallets,
      interval,
    });

    return result.success ? result.data : null;
  }
}
