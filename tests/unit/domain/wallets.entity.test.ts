import { describe, test, beforeEach, expect } from "@jest/globals";
import {
  resultCreateWallet,
  returnMovementFromreccurrent,
  Wallet,
} from "@/domain/entity/wallets.entity";
import {
  Reccurrent,
  returnCreateReccurrent,
} from "@/domain/entity/reccurrent.entity";
import { v7 as uuidv7 } from "uuid";

import { addDays, subMonths } from "date-fns";
import { ReccurrentProps } from "@/domain/schemas/reccurrent.schema";

describe("Entidade Wallet", () => {
  let testWallet: Wallet;

  beforeEach(() => {
    testWallet = (
      Wallet.create({
        labelName: "Princial",
        ownerId: uuidv7(),
      }) as resultCreateWallet & { success: true }
    ).data;
  });

  const getReccurrent = (props: Partial<ReccurrentProps>): Reccurrent => {
    const DTO = {
      amount: props.amount ?? 200,
      categoryId: props.categoryId ?? uuidv7(),
      description: props.description ?? "Conserto",
      frequency: props.frequency ?? "monthly",
      interval: props.interval ?? 1,
      status: props.status ?? ("ativo" as const),
      type: props.type ?? "debito",
      walletId: props.walletId ?? testWallet.id,
      countPaid: props.countPaid ?? 0,
      installments: props.installments ?? 5,
      startDate: props.startDate ?? subMonths(new Date(), 1),
      endDate: props.endDate ?? null,
      nextDueDate: props.nextDueDate ?? null,
    };

    return (
      Reccurrent.create(DTO) as returnCreateReccurrent & { success: true }
    ).data;
  };

  test("generateMovementreccurrent() - Gera uma nova movimentação apartir de uma recorrência de debito valida", async () => {
    const reccurrentTest = getReccurrent({});

    const result = testWallet.generateMovementFromreccurrent(
      reccurrentTest,
    ) as returnMovementFromreccurrent & { success: true };

    expect(result.success).toBeTruthy();
    expect(reccurrentTest.mutateCountPaid(result.data)).toBeTruthy();

    expect(testWallet.balance).toBe(-reccurrentTest.amount);
  });

  test("generateMovementreccurrent() - Gera uma nova movimentação apartir de uma recorrência de credito valida", async () => {
    const reccurrentTest = getReccurrent({
      type: "credito",
    });

    const result = testWallet.generateMovementFromreccurrent(
      reccurrentTest,
    ) as returnMovementFromreccurrent & { success: true };

    expect(result.success).toBeTruthy();
    expect(reccurrentTest.mutateCountPaid(result.data)).toBeTruthy();

    expect(testWallet.balance).toBe(reccurrentTest.amount);
  });

  test("generateMovementreccurrent() - Recebe uma recorrência com startDate no futuro e nao gera movimentação", async () => {
    const reccurrentTest = getReccurrent({
      startDate: addDays(new Date(), 1),
    });

    const result = testWallet.generateMovementFromreccurrent(
      reccurrentTest,
    ) as returnMovementFromreccurrent & { success: false };

    expect(result.success).toBeFalsy();
    expect(result.message).toBeDefined();
  });

  test("generateMovementreccurrent() - Recebe uma recorrência ja chegou ao fim e nao gera movimentação", async () => {
    const reccurrentTest = getReccurrent({
      countPaid: 5,
      installments: 5,
    });

    const result = testWallet.generateMovementFromreccurrent(
      reccurrentTest,
    ) as returnMovementFromreccurrent & { success: false };

    expect(result.success).toBeFalsy();
    expect(result.message).toBeDefined();
  });

  test("generateMovementreccurrent() - Recebe uma recorrência de outra carteira e nao gera movimentação", async () => {
    const reccurrentTest = getReccurrent({
      walletId: uuidv7(),
    });

    const result = testWallet.generateMovementFromreccurrent(
      reccurrentTest,
    ) as returnMovementFromreccurrent & { success: false };

    expect(result.success).toBeFalsy();
    expect(result.message).toBeDefined();
  });
});
