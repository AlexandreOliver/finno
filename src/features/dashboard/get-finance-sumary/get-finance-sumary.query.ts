export interface FinanceSumaryDTO {
  gastoMensal: number;
  entradaMensal: number;
  saldoMensal: number;
  saldoGeral: number;
}

export interface GetFinanceSumaryQuery {
  wallets: {
    label: string;
    id: string;
  }[];
  currentDate: Date;
}
