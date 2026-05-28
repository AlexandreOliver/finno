import { afterAll, describe, expect, test } from "@jest/globals";
import movementsModel from "@/features/models/movementsModel";
import { seed_movements } from "@/infra/defaultData";
import db from "@/infra/database";

afterAll(async () => {
  await db.$client.end();
});

describe("Model Movements", () => {
  describe("Método count()", () => {
    test("Recebe uma UUID de wallet e retorna valores corretos", async () => {
      const result = await movementsModel.count(
        "019e1dcf-f7dd-7c41-86c9-8da67aee78ee",
      );

      const countMov = seed_movements.reduce((acc, m) => {
        if (m.walletId === "019e1dcf-f7dd-7c41-86c9-8da67aee78ee") {
          return (acc += 1);
        } else return acc;
      }, 0);

      expect(result).toBe(countMov);
    });

    test("Recebe uma lista de UUID de wallets e retorna o total de movimentos respectivos", async () => {
      const result = await movementsModel.count([
        "019e1dcf-f7dd-7c41-86c9-8da67aee78ee",
        "019e1dc7-df44-7810-afb6-5e56ac7becf1",
      ]);

      const countMov = seed_movements.reduce((acc, m) => {
        if (
          [
            "019e1dcf-f7dd-7c41-86c9-8da67aee78ee",
            "019e1dc7-df44-7810-afb6-5e56ac7becf1",
          ].includes(m.walletId)
        ) {
          return (acc += 1);
        } else return acc;
      }, 0);

      expect(result).toBe(countMov);
    });

    test("Não recebe nada e retorna a quantidade de todos os movimentos", async () => {
      const result = await movementsModel.count();

      const countMov = seed_movements.length;

      expect(result).toBe(countMov);
    });

    test("Recebe uma lista vazia e retorna 0", async () => {
      const result = await movementsModel.count([]);

      expect(result).toBe(0);
    });

    test("Recebe uma lista de UUID de wallets e uma query e retorna o total de movimentos respectivos", async () => {
      const result = await movementsModel.count(
        [
          "019e1dcf-f7dd-7c41-86c9-8da67aee78ee",
          "019e1dc7-df44-7810-afb6-5e56ac7becf1",
        ],
        {
          date: {
            start: new Date(2026, 3, 1, 0, 0),
            end: new Date(2026, 4, 0, 23, 59, 59),
          },
        },
      );

      const countMov = seed_movements.reduce((acc, m) => {
        if (
          [
            "019e1dcf-f7dd-7c41-86c9-8da67aee78ee",
            "019e1dc7-df44-7810-afb6-5e56ac7becf1",
          ].includes(m.walletId) &&
          m.executedAt.getMonth() + 1 === 4
        ) {
          return (acc += 1);
        } else return acc;
      }, 0);

      expect(result).toBe(countMov);
    });
  });
  describe("Método findByWalletIdWithCategory()", () => {
    test("Recebe uma UUID e retorna valores corretos", async () => {
      const result = await movementsModel.findByWalletIdWithCategory({
        walletId: "019e1dcf-f7dd-7c41-86c9-8da67aee78ee",
        returnFields: ["description"],
      });

      expect(result[0]).toHaveProperty("description");
      expect(result[0]).toHaveProperty("labelCategory");
      expect(result[0]).toHaveProperty("categoryId");
    });

    test("Recebe uma lista de UUID e retorna valores corretos", async () => {
      const result = await movementsModel.findByWalletIdWithCategory({
        walletId: [
          "019e1dcf-f7dd-7c41-86c9-8da67aee78ee",
          "019e1dc7-df44-7810-afb6-5e56ac7becf1",
        ],
        returnFields: ["amount"],
      });

      expect(result[0]).toHaveProperty("amount");
      expect(result[0]).toHaveProperty("labelCategory");
      expect(result[0]).toHaveProperty("categoryId");
    });

    test("Recebe uma lista vazia e retorna vazio", async () => {
      const result = await movementsModel.findByWalletIdWithCategory({
        walletId: [],
        returnFields: ["description"],
      });

      expect(result.length).toBe(0);
    });

    test("Recebe uma string vazia e retorna vazio", async () => {
      const result = await movementsModel.findByWalletIdWithCategory({
        walletId: [],
        returnFields: ["description"],
      });

      expect(result.length).toBe(0);
    });
  });

  describe("Método findByWalleIdForQuery()", () => {
    test("Recebe uma UUID e retorna os movimentos junto com as categorias", async () => {
      const result = await movementsModel.findByWalletIdForQuery({
        walletId: "019e1dcf-f7dd-7c41-86c9-8da67aee78ee",
        returnFields: ["description"],
        include: {
          category: true,
        },
      });

      expect(result[0]).toHaveProperty("description");
      expect(result[0]).toHaveProperty("labelCategory");
      expect(result[0]).toHaveProperty("categoryId");
    });

    test("Recebe uma UUID e retorna apenas os movimentos", async () => {
      const result = await movementsModel.findByWalletIdForQuery({
        walletId: "019e1dc7-df44-7810-afb6-5e56ac7becf1",
        returnFields: ["amount"],
      });

      expect(result[0]).toHaveProperty("amount");
      expect(result[0]).not.toHaveProperty("labelCategory");
      expect(result[0]).not.toHaveProperty("categoryId");
    });

    test("Recebe uma UUID e retorna apenas um movimento", async () => {
      const result = await movementsModel.findByWalletIdForQuery({
        walletId: "019e1dc7-df44-7810-afb6-5e56ac7becf1",
        returnFields: ["description"],
        pagination: {
          limit: 1,
          page: 1,
        },
      });

      expect(result[0]).toHaveProperty("description");
      expect(result[0]).not.toHaveProperty("labelCategory");
      expect(result[0]).not.toHaveProperty("categoryId");
      expect(result.length).toBe(1);
    });

    test("Recebe uma UUID e retorna apenas um movimento com a categoria", async () => {
      const result = await movementsModel.findByWalletIdForQuery({
        walletId: "019e1dc7-df44-7810-afb6-5e56ac7becf1",
        returnFields: ["description"],
        pagination: {
          limit: 1,
          page: 1,
        },
        include: {
          category: true,
        },
      });

      expect(result[0]).toHaveProperty("description");
      expect(result[0]).toHaveProperty("labelCategory");
      expect(result[0]).toHaveProperty("categoryId");
      expect(result.length).toBe(1);
    });

    test("Recebe uma UUID e retorna apenas um movimento junto a categoria com paginação correta ", async () => {
      const page1 = await movementsModel.findByWalletIdForQuery({
        walletId: "019e1dcf-f7dd-7c41-86c9-8da67aee78ee",
        returnFields: ["description"],
        pagination: {
          limit: 1,
          page: 1,
        },
        include: {
          category: true,
        },
      });

      const page2 = await movementsModel.findByWalletIdForQuery({
        walletId: "019e1dcf-f7dd-7c41-86c9-8da67aee78ee",
        returnFields: ["description"],
        pagination: {
          limit: 1,
          page: 2,
        },
        include: {
          category: true,
        },
      });

      expect(page2[0]).toHaveProperty("description");
      expect(page2[0]).toHaveProperty("labelCategory");
      expect(page2[0]).toHaveProperty("categoryId");
      expect(page2.length).toBe(1);

      expect(page2[0].description).not.toBe(page1[0].description);
    });

    test("Recebe uma lista de UUID e retorna os movimentos com a categoria", async () => {
      const result = await movementsModel.findByWalletIdForQuery({
        walletId: [
          "019e1dcf-f7dd-7c41-86c9-8da67aee78ee",
          "019e1dc7-df44-7810-afb6-5e56ac7becf1",
        ],
        returnFields: ["description"],
        include: {
          category: true,
        },
      });

      const movs_count = seed_movements.reduce((acc, mov) => {
        if (
          [
            "019e1dcf-f7dd-7c41-86c9-8da67aee78ee",
            "019e1dc7-df44-7810-afb6-5e56ac7becf1",
          ].includes(mov.walletId)
        ) {
          return (acc += 1);
        }

        return acc;
      }, 0);

      expect(result[0]).toHaveProperty("description");
      expect(result[0]).toHaveProperty("labelCategory");
      expect(result[0]).toHaveProperty("categoryId");
      expect(result.length).toBe(movs_count);
    });

    test("Recebe uma lista de UUID e retorna os movimentos com a categoria + paginação", async () => {
      const page1 = await movementsModel.findByWalletIdForQuery({
        walletId: [
          "019e1dcf-f7dd-7c41-86c9-8da67aee78ee",
          "019e1dc7-df44-7810-afb6-5e56ac7becf1",
        ],
        returnFields: ["description"],
        pagination: {
          limit: 2,
          page: 1,
        },
        include: {
          category: true,
        },
      });

      expect(page1.length).toBeGreaterThan(0);

      const page2 = await movementsModel.findByWalletIdForQuery({
        walletId: [
          "019e1dcf-f7dd-7c41-86c9-8da67aee78ee",
          "019e1dc7-df44-7810-afb6-5e56ac7becf1",
        ],
        returnFields: ["description"],
        pagination: {
          limit: 2,
          page: 2,
        },
        include: {
          category: true,
        },
      });

      expect(page2[0]).toHaveProperty("description");
      expect(page2[0]).toHaveProperty("labelCategory");
      expect(page2[0]).toHaveProperty("categoryId");
      expect(page2.length).toBeGreaterThan(0);

      expect(page2[0].description).not.toBe(page1[0].description);
    });

    test("Recebe uma lista vazia e retorna vazio", async () => {
      const result = await movementsModel.findByWalletIdForQuery({
        walletId: [],
        returnFields: ["description"],
        include: {
          category: true,
        },
      });

      expect(result.length).toBe(0);
    });
  });
});
