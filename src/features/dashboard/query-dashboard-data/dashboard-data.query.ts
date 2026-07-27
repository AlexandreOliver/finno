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

export interface DashboardDataQuery {
  userId: string;
  referenceMonth: Date;
}
