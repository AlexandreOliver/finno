import { beforeAll, describe, expect, test } from "@jest/globals";

import { StatementRepositoryDrizzle } from "@/infrastructure/repositories/queries/drizzle-statement.repository";
import { GetStatementHandler } from "@/features/transactions/statement/get-statement/get-statement.handler";

import { seed_movements, seed_wallets } from "@/infrastructure/defaultData";

import setupTestDb from "../db-test";

import { MovementsRepositoryDrizzle } from "@/infrastructure/repositories/drizzle/drizzle-movements.repository";

const testDb = setupTestDb();

describe("Statement - Handler", () => {
  let statementRepository: StatementRepositoryDrizzle;
  let movementsRepository: MovementsRepositoryDrizzle;
  let getStatementHanlder: GetStatementHandler;

  beforeAll(async () => {
    statementRepository = StatementRepositoryDrizzle.create(testDb.db);
    movementsRepository = MovementsRepositoryDrizzle.create(testDb.db);
    getStatementHanlder = GetStatementHandler.create(
      statementRepository,
      movementsRepository,
    );
  });

  test("Retorna todos as transacoes de um periodo dado", async () => {
    const input = {
      walletId: [seed_wallets[1].id, seed_wallets[0].id],
      filters: {
        date: {
          start: "2026-07-01",
          end: "2026-07-04",
        },
      },
      pagination: {
        page: 1,
        limit: 10,
      },
    };

    const result = await getStatementHanlder.execute(input);

    const dataExpect = seed_movements.filter(
      (mov) =>
        mov.executedAt >= new Date(input.filters.date.start) &&
        mov.executedAt < new Date(input.filters.date.end + "T23:59:59.999") &&
        input.walletId.includes(mov.walletId),
    );

    expect(result.totalMovementsFromDb).toBe(dataExpect.length);
  });
});
