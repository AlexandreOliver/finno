import { describe, test, beforeEach, expect, jest } from "@jest/globals";
import {
  resultCreateWallet,
  returnMovementFromreccurrent,
  Wallet,
} from "@/domain/entity/wallets.entity";
import { Reccurrent } from "@/domain/entity/reccurrent.entity";
import { v7 as uuidv7 } from "uuid";

import { addDays, addMonths, set, subMonths } from "date-fns";
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
    const dateBase =
      props.startDate ??
      set(new Date(), {
        hours: 6,
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
      });

    const DTO = {
      id: uuidv7(),
      amount: props.amount?.toString() ?? "200",
      categoryId: props.categoryId ?? uuidv7(),
      description: props.description ?? "Conserto",
      frequency: props.frequency ?? "monthly",
      interval: props.interval ?? 1,
      status: props.status ?? ("ativo" as const),
      type: props.type ?? "debito",
      walletId: props.walletId ?? testWallet.id,
      countPaid: props.countPaid ?? 0,
      payOnStartDate: props.payOnStartDate ?? false,
      installments: props.installments ?? 5,
      startDate: props.startDate ?? dateBase,
      endDate: props.endDate ?? addMonths(dateBase, 5),
      nextDueDate: props.nextDueDate ?? addMonths(dateBase, 1),
    };

    return Reccurrent.with(DTO);
  };

  function getMonthInMS(countMonth: number = 1) {
    const date1 = new Date();
    const date2 = new Date(date1);

    date2.setMonth(date1.getMonth() + countMonth);

    return date2.getTime() - date1.getTime();
  }

  test("#1 generateMovementReccurrent - Gera uma nova movimentação apartir de uma recorrência de debito valida", async () => {
    const reccurrentTest = getReccurrent({});

    jest.useFakeTimers();
    jest.advanceTimersByTime(getMonthInMS());

    const result = testWallet.generateMovementFromReccurrent(
      reccurrentTest,
    ) as returnMovementFromreccurrent & { success: true };

    expect(result.success).toBeTruthy();
    expect(reccurrentTest.mutateCountPaid(result.data)).toBeTruthy();

    expect(testWallet.balance).toBe(-reccurrentTest.amount);
    jest.useRealTimers();
  });

  test("#2 generateMovementReccurrent - Gera uma nova movimentação apartir de uma recorrência de credito valida", async () => {
    const reccurrentTest = getReccurrent({
      type: "credito",
    });

    jest.useFakeTimers();
    jest.advanceTimersByTime(getMonthInMS());

    const result = testWallet.generateMovementFromReccurrent(
      reccurrentTest,
    ) as returnMovementFromreccurrent & { success: true };

    expect(result.success).toBeTruthy();
    expect(reccurrentTest.mutateCountPaid(result.data)).toBeTruthy();

    expect(testWallet.balance).toBe(reccurrentTest.amount);
    jest.useRealTimers();
  });

  test("#3 generateMovementReccurrent - Recebe uma recorrência com startDate no futuro e nao gera movimentação", async () => {
    const reccurrentTest = getReccurrent({});

    // jest.useFakeTimers().setSystemTime(new Date("2020-01-01"));
    const result = testWallet.generateMovementFromReccurrent(
      reccurrentTest,
    ) as returnMovementFromreccurrent & { success: false };

    expect(result.success).toBeFalsy();
    expect(result.message).toBeDefined();
    // jest.useRealTimers();
  });

  test("#4 generateMovementReccurrent - Recebe uma recorrência ja chegou ao fim e nao gera movimentação", async () => {
    const reccurrentTest = getReccurrent({
      countPaid: 5,
      installments: 5,
    });

    const result = testWallet.generateMovementFromReccurrent(
      reccurrentTest,
    ) as returnMovementFromreccurrent & { success: false };

    expect(result.success).toBeFalsy();
    expect(result.message).toBeDefined();
  });

  test("#5 generateMovementReccurrent - Recebe uma recorrência de outra carteira e nao gera movimentação", async () => {
    const reccurrentTest = getReccurrent({
      walletId: uuidv7(),
    });

    const result = testWallet.generateMovementFromReccurrent(
      reccurrentTest,
    ) as returnMovementFromreccurrent & { success: false };

    expect(result.success).toBeFalsy();
    expect(result.message).toBeDefined();
  });
});
