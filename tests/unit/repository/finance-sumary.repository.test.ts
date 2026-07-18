import { beforeAll, describe, expect, test } from "@jest/globals";
import setupTestDb from "../../db-test";

import { startOfMonth } from "date-fns";

import { DrizzleFinanceSumaryRepsitory } from "@/infrastructure/repositories/queries/drizzle-finance-suamary.repository";

import { seed_movements, seed_wallets } from "@/infrastructure/defaultData";
import { FinanceSumaryDTO } from "@/features/dashboard/get-finance-sumary/get-finance-sumary.query";

const testdb = setupTestDb();

describe("Finance Sumary Repository", () => {
  const getFinanceSumary = DrizzleFinanceSumaryRepsitory.create(testdb.db);

  test("Dado uma entrada adquire os dados financeiros", async () => {
    const input = {
      walletsQuery: seed_wallets.map((w) => {
        return { id: w.id, label: w.labelName };
      }),
      interval: {
        start: startOfMonth(new Date()),
        end: new Date(),
      },
    };

    const result = (await getFinanceSumary.getSumary(input)) as {
      success: true;
      data: FinanceSumaryDTO;
    };

    const entradaMensalExpected = seed_movements.reduce((entradas, mov) => {
      if (
        mov.executedAt >= input.interval.start &&
        mov.executedAt < input.interval.end &&
        mov.type === "credito" &&
        mov.walletId === input.walletsQuery[1].id
      ) {
        return (entradas += Number(mov.amount));
      }

      return entradas;
    }, 0);

    const saidaMensalExpected = seed_movements.reduce((entradas, mov) => {
      if (
        mov.executedAt >= input.interval.start &&
        mov.executedAt < input.interval.end &&
        mov.type === "debito"
      ) {
        return (entradas += Number(mov.amount));
      }

      return entradas;
    }, 0);

    const saldoGeral = seed_wallets.reduce(
      (soma, w) => (soma += Number.parseFloat(w.balance)),
      0.0,
    );

    expect(result.success).toBe(true);

    expect(result.data.entradaMensal).toBe(entradaMensalExpected);
    expect(result.data.gastoMensal).toBe(saidaMensalExpected);
    expect(result.data.saldoMensal).toBe(
      entradaMensalExpected - saidaMensalExpected,
    );
    expect(result.data.saldoGeral.toFixed(2)).toBe(saldoGeral.toFixed(2));
  });
});
