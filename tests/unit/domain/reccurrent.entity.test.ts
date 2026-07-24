import { describe, test, beforeEach, expect, jest } from "@jest/globals";
import {
  returnCreateReccurrent,
  Reccurrent,
} from "@/domain/entity/reccurrent.entity";
import { v7 as uuidv7 } from "uuid";

import { addDays, addMonths, addWeeks, set, subMonths } from "date-fns";
import { ReccurrentProps } from "@/domain/schemas/reccurrent.schema";
import {
  Wallet,
  resultCreateWallet,
  returnMovementFromreccurrent,
} from "@/domain/entity/wallets.entity";
import { Movement } from "@/domain/entity/movements.entity";

describe("Entidade Reccurrent", () => {
  //   let testReccurrent: Reccurrent;
  let testWallet: Wallet;

  beforeEach(() => {
    testWallet = (
      Wallet.create({
        labelName: "Princial",
        ownerId: uuidv7(),
      }) as resultCreateWallet & { success: true }
    ).data;
  });

  //   afterEach(() => {
  //   })

  const getReccurrent = (props: Partial<ReccurrentProps>): Reccurrent => {
    const dataBase =
      props.startDate ??
      new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate(),
        6,
      );

    const DTO = {
      id: uuidv7(),
      type: props.type ?? ("debito" as const),
      amount: props.amount?.toString() ?? "271.54",
      description: props.description ?? "Conserto",
      status: props.status ?? ("ativo" as const),
      categoryId: props.categoryId ?? uuidv7(),
      walletId: props.walletId ?? testWallet.id,
      frequency: props.frequency ?? ("monthly" as const),
      payOnStartDate: props.payOnStartDate ?? false,
      interval: props.interval ?? 1,
      installments: props.installments ?? 5,
      countPaid: props.countPaid ?? 0,
      startDate: props.startDate ?? dataBase,
      endDate:
        props.endDate ??
        new Date(
          dataBase.getFullYear(),
          dataBase.getMonth() + 5,
          dataBase.getDate(),
          6,
        ),
      nextDueDate:
        props.nextDueDate ??
        new Date(
          dataBase.getFullYear(),
          dataBase.getMonth() + 1,
          dataBase.getDate(),
          6,
        ),
    };

    return Reccurrent.with(DTO);
  };

  function getNextMonthInMS() {
    const date1 = new Date();
    const date2 = new Date(date1);

    date2.setMonth(date1.getMonth() + 1);

    return date2.getTime() - date1.getTime();
  }

  test("#1 Create - Cria uma recorrência com inicio imediato", async () => {
    const input = {
      type: "debito" as const,
      amount: 201.31,
      description: "Teste-Recorrencia",
      walletId: uuidv7(),
      categoryId: uuidv7(),
      frequency: "daily" as const,
      interval: 15,
      installments: 5,
      startDate: new Date(),
      payOnStartDate: false,
    };

    const startDateParsed = set(input.startDate, {
      hours: 6,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });

    const Expect_dataRecorencia = {
      countPaid: 0,
      endDate: addDays(startDateParsed, input.interval * input.installments),
      nextDueDate: addDays(startDateParsed, input.interval),
      status: "ativo" as const,
    };

    const resultCreateV1 = Reccurrent.create(
      input,
    ) as returnCreateReccurrent & {
      success: true;
    };

    expect(resultCreateV1.success).toBe(true);
    expect(resultCreateV1.data.toJson()).toStrictEqual({
      ...input,
      ...Expect_dataRecorencia,
      startDate: startDateParsed,
      id: resultCreateV1.data.id,
    });
  });

  test("#2 Create - Cria uma recorrência díaria com execução imediata", async () => {
    const input = {
      type: "debito" as const,
      amount: 201.31,
      description: "Teste-Recorrencia",
      walletId: uuidv7(),
      categoryId: uuidv7(),
      frequency: "daily" as const,
      interval: 2,
      installments: 5,
      startDate: new Date(),
      payOnStartDate: true,
    };

    const startDateParsed = new Date(
      input.startDate.getFullYear(),
      input.startDate.getMonth(),
      input.startDate.getDate(),
      6,
    );

    const Expect_dataRecorencia = {
      countPaid: 0,
      endDate: new Date(
        startDateParsed.getFullYear(),
        startDateParsed.getMonth(),
        startDateParsed.getDate() + (input.installments - 1) * input.interval,
        startDateParsed.getHours(),
      ),
      nextDueDate: startDateParsed,
      status: "ativo" as const,
    };

    const resultCreateV1 = Reccurrent.create(
      input,
    ) as returnCreateReccurrent & {
      success: true;
    };

    expect(resultCreateV1.success).toBe(true);
    expect(resultCreateV1.data.toJson()).toStrictEqual({
      ...input,
      ...Expect_dataRecorencia,
      startDate: startDateParsed,
      id: resultCreateV1.data.id,
    });
  });

  test("#3 Create - Cria uma recorrência sem parcelas definidas", async () => {
    const input = {
      type: "debito" as const,
      amount: 201.31,
      description: "Teste-Recorrencia",
      walletId: uuidv7(),
      categoryId: uuidv7(),
      frequency: "monthly" as const,
      interval: 1,
      startDate: new Date(),
      installments: null,
      payOnStartDate: false,
    };

    const startDateParsed = new Date(
      input.startDate.getFullYear(),
      input.startDate.getMonth(),
      input.startDate.getDate(),
      6,
    );

    const Expect_dataRecorencia = {
      countPaid: 0,
      nextDueDate: new Date(
        startDateParsed.getFullYear(),
        startDateParsed.getMonth() + input.interval,
        startDateParsed.getDate(),
        startDateParsed.getHours(),
      ),
      status: "ativo" as const,
      endDate: null,
    };

    const resultCreate = Reccurrent.create(input) as returnCreateReccurrent & {
      success: true;
    };

    expect(resultCreate.success).toBe(true);
    expect(resultCreate.data.toJson()).toStrictEqual({
      ...input,
      ...Expect_dataRecorencia,
      startDate: startDateParsed,
      id: resultCreate.data.id,
    });
  });

  test("#4 Create - Cria uma recorrência com inicio futuro", async () => {
    const input = {
      type: "debito" as const,
      amount: 201.31,
      description: "Teste-Recorrencia",
      walletId: uuidv7(),
      categoryId: uuidv7(),
      frequency: "monthly" as const,
      interval: 1,
      installments: 5,
      payOnStartDate: false,
      startDate: new Date(2029, 6, 1),
    };

    const startDateParsed = new Date(
      input.startDate.getFullYear(),
      input.startDate.getMonth(),
      input.startDate.getDate(),
      6,
    );

    const Expect_dataRecorenciaV3 = {
      status: "esperando" as const,
      countPaid: 0,
      endDate: new Date(
        startDateParsed.getFullYear(),
        startDateParsed.getMonth() + input.installments,
        startDateParsed.getDate(),
        startDateParsed.getHours(),
      ),
      nextDueDate: new Date(
        startDateParsed.getFullYear(),
        startDateParsed.getMonth() + input.interval,
        startDateParsed.getDate(),
        startDateParsed.getHours(),
      ),
    };

    const resultCreateV3 = Reccurrent.create(
      input,
    ) as returnCreateReccurrent & {
      success: true;
    };

    expect(resultCreateV3.success).toBe(true);
    expect(resultCreateV3.data.toJson()).toStrictEqual({
      ...input,
      ...Expect_dataRecorenciaV3,
      startDate: startDateParsed,
      id: resultCreateV3.data.id,
    });
  });

  test("#5 Create - Cria uma recorrência semanal com inicio futuro e execução na data de inicio", async () => {
    const input = {
      type: "debito" as const,
      amount: 201.31,
      description: "Teste-Recorrencia",
      walletId: uuidv7(),
      categoryId: uuidv7(),
      frequency: "monthly" as const,
      interval: 3,
      installments: 5,
      payOnStartDate: true,
      startDate: new Date(2029, 6, 1),
    };

    const startDateParsed = new Date(
      input.startDate.getFullYear(),
      input.startDate.getMonth(),
      input.startDate.getDate(),
      6,
    );

    const Expect_dataRecorenciaV3 = {
      status: "esperando" as const,
      countPaid: 0,
      endDate: new Date(
        startDateParsed.getFullYear(),
        startDateParsed.getMonth() + (input.installments - 1) * input.interval,
        startDateParsed.getDate(),
        startDateParsed.getHours(),
      ),
      nextDueDate: startDateParsed,
    };

    const resultCreateV3 = Reccurrent.create(
      input,
    ) as returnCreateReccurrent & {
      success: true;
    };

    expect(resultCreateV3.success).toBe(true);
    expect(resultCreateV3.data.toJson()).toStrictEqual({
      ...input,
      ...Expect_dataRecorenciaV3,
      startDate: startDateParsed,
      id: resultCreateV3.data.id,
    });
  });

  test("#1 mutateCountPaid - Muda o estado da recorrência quando recebe movimentacoes validas", async () => {
    const input = {
      type: "debito" as const,
      amount: 201.31,
      description: "Teste-Recorrencia",
      walletId: testWallet.id,
      categoryId: uuidv7(),
      frequency: "monthly" as const,
      interval: 1,
      installments: 4,
      payOnStartDate: false,
      startDate: new Date(),
    };

    const ReccurrentTest = (
      Reccurrent.create(input) as returnCreateReccurrent & {
        success: true;
      }
    ).data;

    jest.useFakeTimers();
    const installments = ReccurrentTest.installments as number;

    let countSuccess = 0;

    for (let i = 0; i < installments; i++) {
      jest.advanceTimersByTime(getNextMonthInMS());
      const movementTest = testWallet.generateMovementFromReccurrent(
        ReccurrentTest,
      ) as returnMovementFromreccurrent & { success: true };

      const isSuccess = ReccurrentTest.mutateCountPaid(movementTest.data);

      if (isSuccess) countSuccess++;
    }

    expect(countSuccess).toBe(input.installments);
    expect(ReccurrentTest.countPaid).toBe(input.installments);
    jest.useRealTimers();
  });

  test("#2 mutateCountPaid - Muda o estado de recorrências com o campo payOnStartDate true", async () => {
    const input = {
      type: "debito" as const,
      amount: 201.31,
      description: "Teste-Recorrencia",
      walletId: testWallet.id,
      categoryId: uuidv7(),
      frequency: "daily" as const,
      interval: 15,
      installments: 4,
      payOnStartDate: true,
      startDate: new Date(),
    };

    const ReccurrentTest = (
      Reccurrent.create(input) as returnCreateReccurrent & {
        success: true;
      }
    ).data;

    const movementTest = testWallet.generateMovementFromReccurrent(
      ReccurrentTest,
    ) as returnMovementFromreccurrent & { success: true };

    ReccurrentTest.mutateCountPaid(movementTest.data);

    jest.useFakeTimers();
    const installments = ReccurrentTest.installments as number;

    let countSuccess = 0;

    for (let i = 0; i < installments - 1; i++) {
      jest.advanceTimersByTime(15 * 24 * 60 * 60 * 1000);
      const movementTest = testWallet.generateMovementFromReccurrent(
        ReccurrentTest,
      ) as returnMovementFromreccurrent & { success: true };

      const isSuccess = ReccurrentTest.mutateCountPaid(movementTest.data);

      if (isSuccess) countSuccess++;
    }

    expect(countSuccess).toBe(input.installments - 1);
    expect(ReccurrentTest.countPaid).toBe(input.installments);
    jest.useRealTimers();
  });

  test("#3 mutateCountPaid - Falha ao receber uma movimentação que nao corresponde a recorrência", async () => {
    const input = {
      type: "debito" as const,
      amount: 201.31,
      description: "Teste-Recorrencia",
      walletId: testWallet.id,
      categoryId: uuidv7(),
      frequency: "daily" as const,
      interval: 15,
      installments: 4,
      payOnStartDate: true,
      startDate: new Date(),
    };

    const ReccurrentTest = (
      Reccurrent.create(input) as returnCreateReccurrent & {
        success: true;
      }
    ).data;

    const movementTest = testWallet.generateMovementFromReccurrent(
      ReccurrentTest,
    ) as returnMovementFromreccurrent & { success: true };

    const movementFake1 = Movement.with({
      ...movementTest.data.toJson(),
      amount: "5363.63",
    });

    const result = ReccurrentTest.mutateCountPaid(movementFake1);

    expect(result).toBeFalsy();

    const movementFake2 = Movement.with({
      ...movementTest.data.toJson({ omit: ["amount", "executedAt"] }),
      amount: String(movementTest.data.amount),
      executedAt: new Date(new Date().setFullYear(2025)),
    });

    const result2 = ReccurrentTest.mutateCountPaid(movementFake2);

    expect(result2).toBeFalsy();

    expect(ReccurrentTest.countPaid).toBe(0);
  });
});
