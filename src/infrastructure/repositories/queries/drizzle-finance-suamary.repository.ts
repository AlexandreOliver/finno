import { GetFinanceSumaryRepository } from "@/features/dashboard/get-finance-sumary/get-finance-sumary.interface";
import { eq, and, sum, sql, gte, lt, inArray } from "drizzle-orm";
import db from "@/infrastructure/database";
import { movements } from "@/infrastructure/database/schemas/movements";
import { wallets } from "@/infrastructure/database/schemas/wallets";

export class DrizzleFinanceSumaryRepsitory implements GetFinanceSumaryRepository {
  private constructor(private readonly dbInstance: typeof db) {}

  public static create(dbInstance: typeof db) {
    return new DrizzleFinanceSumaryRepsitory(dbInstance);
  }

  public getSumary: GetFinanceSumaryRepository["getSumary"] = async ({
    interval,
    walletsQuery,
  }) => {
    const walletPrincipal = walletsQuery.find(
      (w) => w.label === "Principal",
    )?.id;
    if (!walletPrincipal)
      return {
        success: false,
        message: "Wallet Principal nao fornecida",
      };

    const walletIds = walletsQuery.map((w) => w.id);

    const [entradas, saidas, saldoGeral] = await Promise.all([
      db
        .select({
          value: sum(movements.amount).mapWith(Number),
        })
        .from(movements)
        .where(
          and(
            eq(movements.walletId, walletPrincipal),
            gte(movements.executedAt, interval.start),
            lt(movements.executedAt, interval.end),
            eq(movements.type, "credito"),
            eq(movements.isRefunded, false),
            eq(movements.isReversal, false),
          ),
        ),

      db
        .select({
          value: sum(movements.amount).mapWith(Number),
        })
        .from(movements)
        .where(
          and(
            eq(movements.walletId, walletPrincipal),
            gte(movements.executedAt, interval.start),
            lt(movements.executedAt, interval.end),
            eq(movements.type, "debito"),
            eq(movements.isRefunded, false),
            eq(movements.isReversal, false),
          ),
        ),

      db
        .select({
          value: sum(wallets.balance).mapWith(Number),
        })
        .from(wallets)
        .where(inArray(wallets.id, walletIds)),
    ]);

    return {
      success: true,
      data: {
        entradaMensal: entradas[0].value ?? 0,
        gastoMensal: saidas[0].value ?? 0,
        saldoMensal: entradas[0].value - saidas[0].value,
        saldoGeral: saldoGeral[0].value,
      },
    };
  };
}
