import { describe, expect, test } from "@jest/globals";
import { reccurentSchema } from "@/features/models/recurentModel";
import zod, { ZodError } from "zod";

describe.only("Model Reccurent", () => {
  describe("Schema", () => {
    test("A data final não pode ser hoje", async () => {
      const result = reccurentSchema.safeParse({
        description: "shgh",
        type: "debito",
        status: "ativo",
        amount: "23,24",
        frequency: "daily",
        installments: 0,
        interval: 3,
        categoryId: "7a1b2c3d-4e5f-7a01-8bcd-00000000001b",
        walletId: "7a1b2c3d-4e5f-7a01-8bcd-00000000001c",
        start_date: "2026-05-29T10:25",
        end_date: new Date(),
      });

      const obj = zod.flattenError(result.error as ZodError).fieldErrors;
      expect(obj).toHaveProperty("end_date", [
        "A data final nao pode ser hoje",
      ]);
    });
  });
});
