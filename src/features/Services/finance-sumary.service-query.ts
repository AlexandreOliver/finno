import { movements } from "@/infrastructure/database/schemas/movements";
import { inArray, sql } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";

export class FinanceSummaryQueryService {
  constructor(private readonly db: NodePgDatabase) {}

  public async sumaryOfWalletsAtInverval(props: {
    interval: { start: Date; end: Date };
    walletIds: string[];
  }): Promise<TSumaryOfWallet[]> {
    const { interval, walletIds } = props;

    const queryResult = await this.db.execute<TSumaryOfWallet>(sql`
        SELECT
          wallets.id AS wallet,
          SUM(CASE WHEN type = 'credito' THEN amount ELSE 0 END) AS incomes,
          SUM(CASE WHEN type = 'debito' THEN amount ELSE 0 END) AS expenses
        FROM
          movements
        INNER JOIN 
          wallets ON movements.wallet_id = wallets.id
        WHERE
          ${inArray(movements.walletId, walletIds)} AND
          movements.is_reversal = false AND 
          movements.is_refunded = false AND
          movements.executed_at >= ${interval.start.toISOString()} AND
          movements.executed_at < ${interval.end.toISOString()}
        GROUP BY 
          wallets.id
        ;
        `);

    const { rows: sumaryFinance } = queryResult;

    return sumaryFinance;
  }
}

export type TSumaryOfWallet = {
  wallet: string;
  incomes: string;
  expenses: string;
};
