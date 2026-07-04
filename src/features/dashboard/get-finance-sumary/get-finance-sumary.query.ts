export interface FinanceSumaryDTO {
  gastoMensal: number;
  entradaMensal: number;
  saldoMensal: number;
  saldoGeral: number;
}

export interface GetFinanceSumaryQuery {
  walletId: string;
  currentDate: Date;
}
