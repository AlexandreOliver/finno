import { FinanceSumaryDTO } from "./get-finance-sumary.query";

export interface GetFinanceSumaryRepository {
  getSumary: (props: {
    walletsQuery: {
      label: string;
      id: string;
    }[];
    interval: { start: Date; end: Date };
  }) => Promise<
    | { success: true; data: FinanceSumaryDTO }
    | { success: false; message: string }
  >;
}
