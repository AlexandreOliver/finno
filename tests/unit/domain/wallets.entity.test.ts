import { describe, test, beforeEach, expect } from "@jest/globals";
import {
  resultCreateWallet,
  returnMovementFromReccurent,
  Wallet,
} from "@/domain/entity/wallets.entity";
import {
  Reccurent,
  returnCreateReccurent,
} from "@/domain/entity/reccurent.entity";
import { v7 as uuidv7 } from "uuid";

import { addDays, subMonths } from "date-fns";

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

  const getReccurent = (props: {
    amount?: string;
    categoryId?: string;
    description?: string;
    frequency?: string;
    interval?: 1;
    status?: string;
    type?: string;
    walletId?: string;
    countPaid?: number;
    installments?: number;
    start_date?: Date;
  }): Reccurent => {
    const DTO = {
      amount: props.amount ?? "200",
      categoryId: props.categoryId ?? uuidv7(),
      description: props.description ?? "Conserto",
      frequency: props.frequency ?? "monthly",
      interval: props.interval ?? 1,
      status: props.status ?? "ativo",
      type: props.type ?? "debito",
      walletId: props.walletId ?? testWallet.id,
      countPaid: props.countPaid ?? 0,
      installments: props.installments ?? 5,
      start_date: props.start_date ?? subMonths(new Date(), 1),
    };

    return (Reccurent.create(DTO) as returnCreateReccurent & { success: true })
      .data;
  };

  test("generateMovementReccurent() - Gera uma nova movimentação apartir de uma recorrência de debito valida", async () => {
    const reccurentTest = getReccurent({});

    const result = testWallet.generateMovementFromReccurent(
      reccurentTest,
    ) as returnMovementFromReccurent & { success: true };

    expect(result.success).toBeTruthy();
    expect(reccurentTest.mutateCountPaid(result.data)).toBeTruthy();

    expect(testWallet.balance).toBe(-reccurentTest.amount);
  });

  test("generateMovementReccurent() - Gera uma nova movimentação apartir de uma recorrência de credito valida", async () => {
    const reccurentTest = getReccurent({
      type: "credito",
    });

    const result = testWallet.generateMovementFromReccurent(
      reccurentTest,
    ) as returnMovementFromReccurent & { success: true };

    expect(result.success).toBeTruthy();
    expect(reccurentTest.mutateCountPaid(result.data)).toBeTruthy();

    expect(testWallet.balance).toBe(reccurentTest.amount);
  });

  test("generateMovementReccurent() - Recebe uma recorrência com startDate no futuro e nao gera movimentação", async () => {
    const reccurentTest = getReccurent({
      start_date: addDays(new Date(), 1),
    });

    const result = testWallet.generateMovementFromReccurent(
      reccurentTest,
    ) as returnMovementFromReccurent & { success: false };

    expect(result.success).toBeFalsy();
    expect(result.message).toBeDefined();
  });

  test("generateMovementReccurent() - Recebe uma recorrência ja chegou ao fim e nao gera movimentação", async () => {
    const reccurentTest = getReccurent({
      countPaid: 5,
      installments: 5,
    });

    const result = testWallet.generateMovementFromReccurent(
      reccurentTest,
    ) as returnMovementFromReccurent & { success: false };

    expect(result.success).toBeFalsy();
    expect(result.message).toBeDefined();
  });

  test("generateMovementReccurent() - Recebe uma recorrência de outra carteira e nao gera movimentação", async () => {
    const reccurentTest = getReccurent({
      walletId: uuidv7(),
    });

    const result = testWallet.generateMovementFromReccurent(
      reccurentTest,
    ) as returnMovementFromReccurent & { success: false };

    expect(result.success).toBeFalsy();
    expect(result.message).toBeDefined();
  });
});
