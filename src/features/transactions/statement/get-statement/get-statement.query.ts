export interface GetStatementQuery {
  walletId: string | string[];
  pagination: { limit: number; page: number };
  filters: { date: { start: string; end: string } };
}
