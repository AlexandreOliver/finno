import zod from "zod";

export interface SumaryWalletsDTO {
  wallet: string;
  incomes: string;
  expenses: string;
}

export interface DasboardDataQueryOutput {
  month: string;
  data: {
    financeSummary: {
      walletsInQuery: {
        current: {
          incomes: number;
          expenses: number;
        };
        lastMonth: {
          incomes: number;
          expenses: number;
        };
      };
      netWorth: {
        currentAmount: number;
        amountLastMoth: number;
      };
    };
  };
}

export const DashboardDataQuerySchema = zod.object({
  userId: zod.uuidv7({ error: "Forneça uma uuid na versão 7" }),
  referenceMonth: zod.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, {
    error: "O formato deve ser YYYY-MM (ex: 2026-07)",
  }),
});

export interface DashboardDataQuery {
  userId: string;
  referenceMonth: string;
}
