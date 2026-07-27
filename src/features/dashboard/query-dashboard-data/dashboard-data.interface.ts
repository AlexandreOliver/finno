import { SumaryWalletsDTO } from "./dashboard-data.query";

export interface DashboardDataRepository {
  getSumary: GetSumaryFunction;
  getNetWorth: ({
    walletsQuery,
  }: {
    walletsQuery: { id: string; label: string }[];
  }) => Promise<{ amount: string }>;
}

type GetSumaryFunction = (props: {
  walletsQuery: {
    label: string;
    id: string;
  }[];
  interval: { start: Date; end: Date };
}) => Promise<
  | { success: true; data: SumaryWalletsDTO[] }
  | { success: false; message: string }
>;
