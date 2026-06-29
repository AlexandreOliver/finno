import { FinanceSumaryDTO } from "./get-finance-sumary.query";

export interface GetFinanceSumaryRepository {
  getSumary: (props: {
    walletId: string;
    interval: { start: Date; end: Date };
  }) => Promise<FinanceSumaryDTO>;
}
