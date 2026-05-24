import { describe, expect, test } from "@jest/globals";
import movementsModel from "@/features/models/movementsModel";
import { seed_movements } from "@/infra/defaultData";

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
  });
  describe("Método findByWalletWithCategory()", () => {
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
});
