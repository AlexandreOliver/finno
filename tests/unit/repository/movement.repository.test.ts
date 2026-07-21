import { beforeAll, describe, expect, test } from "@jest/globals";

import { MovementsRepositoryDrizzle } from "@/infrastructure/repositories/drizzle/drizzle-movements.repository";
import {
  Movement,
  resultCreateMovement,
} from "@/domain/entity/movements.entity";

import { movements } from "@/infrastructure/database/schemas/movements";

import {
  seed_categorias,
  seed_movements,
  seed_wallets,
} from "@/infrastructure/defaultData";

import { eq } from "drizzle-orm";

import setupTestDb from "../../db-test";

import { startOfMonth } from "date-fns";

const testDb = setupTestDb();

describe("Repositorio drizzle Movements", () => {
  let movementsRepository: MovementsRepositoryDrizzle;
  let baseDate: Date;
  beforeAll(async () => {
    movementsRepository = MovementsRepositoryDrizzle.create(testDb.db);
    baseDate = new Date();
  });

  test("list() retorna vazio quando walletId é array vazio", async () => {
    const result = await movementsRepository.list({
      walletId: [],
      query: {},
    });

    expect(result.length).toBe(0);
  });

  test("list() retorna movimentos mapeados para Movement e usa paginação quando informada", async () => {
    const input = {
      walletId: seed_wallets[1].id,
      query: {
        date: {
          start: startOfMonth(baseDate),
          end: baseDate,
        },
      },
      pagination: {
        limit: 2,
        page: 1,
      },
    };

    // Pagina 1
    const p1_movementList = await movementsRepository.list(input);

    expect(p1_movementList.length).toBe(2);
    expect(p1_movementList[0]).toBeInstanceOf(Movement);

    const p1_datas = p1_movementList.map((m) => m.executedAt);

    const p1_isAfterStart = p1_datas.every((d) => d > input.query.date.start);
    const p1_isBeforeEnd = p1_datas.every((d) => d < input.query.date.end);

    expect(p1_isAfterStart).toBe(true);
    expect(p1_isBeforeEnd).toBe(true);

    // Pagina 2
    const p2_movementList = await movementsRepository.list({
      ...input,
      pagination: {
        limit: 2,
        page: 2,
      },
    });

    expect(p2_movementList.length).toBe(2);
    expect(p2_movementList[0]).toBeInstanceOf(Movement);

    const p2_datas = p2_movementList.map((m) => m.executedAt);

    const p2_isAfterStart = p2_datas.every((d) => d > input.query.date.start);
    const p2_isBeforeEnd = p2_datas.every((d) => d < input.query.date.end);

    expect(p2_isAfterStart).toBe(true);
    expect(p2_isBeforeEnd).toBe(true);

    // Verifica se os retornos sao unicos
    const p1_uuids = p1_movementList.map((m) => m.id);
    const p2_uuids = p2_movementList.map((m) => m.id);

    const setUUIDs = new Set([...p1_uuids, ...p2_datas]);
    const total = p1_uuids.length + p2_uuids.length;

    expect(setUUIDs.size).toBe(total);
  });

  test("count() retorna 0 para array de walletId vazio", async () => {
    const result = await movementsRepository.count({
      walletId: [],
    });

    expect(result).toBe(0);
  });

  test("count() retorna total de movimentos para walletId simples", async () => {
    const input = {
      walletId: seed_wallets[1].id,
    };

    const countResult = await movementsRepository.count(input);

    const countExpect = seed_movements.reduce((count, mov) => {
      if (mov.walletId === seed_wallets[1].id) return count + 1;

      return count;
    }, 0);

    expect(countResult).toBe(countExpect);
  });

  test("count() retorna total de movimentos para lista de wallets com filtro de data", async () => {
    const input = {
      walletId: seed_wallets[1].id,
      query: {
        date: {
          start: startOfMonth(baseDate),
          end: baseDate,
        },
        includeReversal: true,
      },
    };

    const countResult = await movementsRepository.count(input);

    const countExpect = seed_movements.reduce((count, mov) => {
      if (
        mov.walletId === input.walletId &&
        mov.executedAt >= input.query.date.start &&
        mov.executedAt < input.query.date.end
      )
        return count + 1;

      return count;
    }, 0);

    expect(countResult).toBe(countExpect);
  });

  test("deleteById() deleta uma movimentacao recebendo seu id", async () => {
    const input = seed_movements[12].id;

    const result = await movementsRepository.deleteById(input);

    expect(result).toBe(true);

    const findMovDeleted = await movementsRepository.getById(input);

    expect(findMovDeleted).toBeNull();
  });

  test("save() insere movimento e retorna true quando ID é gerado", async () => {
    const data = {
      walletId: seed_wallets[1].id,
      type: "debito" as const,
      description: "Teste de save",
      amount: "100.00",
      isRefunded: false,
      isReversal: false,
      reversalOfId: null,
      categoryId: seed_categorias[13].id,
      reccurrentId: null,
      executedAt: new Date(),
      dueDate: null,
    };

    const movementResult = Movement.create({
      ...data,
      amount: Number(data.amount),
    }) as resultCreateMovement & { success: true };

    expect(movementResult.success).toBe(true);
    expect(movementResult.movement).toBeInstanceOf(Movement);

    const movementCreated = movementResult.movement as Movement;

    const result = await movementsRepository.saveOrUpdate(movementCreated);

    expect(result).toBe(true);

    const movementFromDb = await testDb.db
      .select()
      .from(movements)
      .where(eq(movements.id, movementCreated.id));

    const movementExpect = {
      ...movementCreated.toJson({ omit: ["amount"] }),
      amount: data.amount,
    };

    expect(movementFromDb[0]).toStrictEqual(movementExpect);
  });
});
