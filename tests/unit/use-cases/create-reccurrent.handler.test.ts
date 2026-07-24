import { beforeEach, describe, expect, jest, test } from "@jest/globals";

import { IUnitOfWork } from "@/infrastructure/repositories/unitOfWork.interface";
import { IWalletsGateway } from "@/domain/repositories/wallets.gateway";
import { IMovementGateway } from "@/domain/repositories/movements.gateway";

import {
  CreateReccurrentHandler,
  CreateReccurentHandlerOutput,
} from "@/features/transactions/create-reccurrent/create-reccurrent.handler";
import { v7 as uuid7 } from "uuid";
import { Wallet } from "@/domain/entity/wallets.entity";
import { IReccurrentGateway } from "@/domain/repositories/reccurrent.gateway";

describe("Caso de Uso - Criar uma recorrência", () => {
  let mockWalletRepository: jest.Mocked<IWalletsGateway>;
  let mockMovementRepository: jest.Mocked<IMovementGateway>;
  let mockReccurrentRepository: jest.Mocked<IReccurrentGateway>;
  let mockTransaction: jest.Mocked<IUnitOfWork>;

  const startUseCase = () =>
    CreateReccurrentHandler.create(
      mockReccurrentRepository,
      mockWalletRepository,
      mockMovementRepository,
      mockTransaction,
    );

  beforeEach(async () => {
    mockReccurrentRepository = {
      count: jest.fn(),
      deleteById: jest.fn(),
      getById: jest.fn(),
      list: jest.fn(),
      save: jest.fn(),
    };
    mockMovementRepository = {
      saveOrUpdate: jest.fn(),
      list: jest.fn(),
      getById: jest.fn(),
      deleteById: jest.fn(),
      count: jest.fn(),
    };

    mockWalletRepository = {
      saveOrUpdate: jest.fn(),
      list: jest.fn(),
      findById: jest.fn(),
      deleteById: jest.fn(),
    };

    mockTransaction = {
      runInTransaction: jest.fn().mockImplementation(async (work) => {
        return await (work as () => Promise<unknown>)();
      }),
    } as unknown as jest.Mocked<IUnitOfWork>;
  });

  test("Cria uma recorrência com inicio imediato e execução imediata", async () => {
    const createReccurrent = startUseCase();

    const walletTest = (
      Wallet.create({
        labelName: "Principal",
        ownerId: uuid7(),
      }) as { data: Wallet }
    ).data;

    const input = {
      type: "debito" as const,
      amount: 201.31,
      description: "Teste-Recorrencia",
      walletId: walletTest.id,
      categoryId: uuid7(),
      frequency: "monthly" as const,
      interval: 3,
      installments: 5,
      payOnStartDate: true,
      startDate: new Date(),
    };

    mockWalletRepository.findById.mockResolvedValue(walletTest);
    mockReccurrentRepository.save.mockResolvedValue({ id: "" });

    const result = (await createReccurrent.execute(
      input,
    )) as CreateReccurentHandlerOutput & {
      success: true;
    };

    expect(result.success).toBe(true);
    expect(result.reccurrent).toHaveProperty("id");
    const reccurrentSaved = mockReccurrentRepository.save.mock.calls[0][0];

    expect(mockWalletRepository.findById).toHaveBeenCalled();

    expect(mockTransaction.runInTransaction).toHaveBeenCalled();
    expect(mockWalletRepository.saveOrUpdate).toHaveBeenCalled();
    expect(mockMovementRepository.saveOrUpdate).toHaveBeenCalled();
    expect(mockReccurrentRepository.save).toHaveBeenCalled();

    expect(reccurrentSaved.countPaid).toBe(1);
    expect(reccurrentSaved.status).toBe("ativo");
    expect(reccurrentSaved.isDued()).toBe(false);
    expect(reccurrentSaved.nextDueDate?.getTime()).toBeGreaterThan(
      input.startDate.getTime(),
    );

    const WalletAfter = walletTest.toJson();
    expect(WalletAfter.balance).toBe(-Number(input.amount));
  });

  test("Cria uma recorrência com inicio imediato", async () => {
    const createReccurrent = startUseCase();

    const walletTest = (
      Wallet.create({
        labelName: "Principal",
        ownerId: uuid7(),
      }) as { data: Wallet }
    ).data;

    const input = {
      type: "credito" as const,
      amount: 201.31,
      description: "Teste-Recorrencia",
      walletId: walletTest.id,
      categoryId: uuid7(),
      frequency: "monthly" as const,
      interval: 3,
      installments: 5,
      payOnStartDate: false,
      startDate: new Date(
        `${new Date().toISOString().slice(0, 10)}T14:34:23.535Z`,
      ),
    };

    mockReccurrentRepository.save.mockResolvedValue({ id: "" });

    const result = (await createReccurrent.execute(
      input,
    )) as CreateReccurentHandlerOutput & {
      success: true;
    };

    expect(result.success).toBe(true);
    expect(result.reccurrent).toHaveProperty("id");

    expect(mockReccurrentRepository.save).toHaveBeenCalled();

    expect(mockWalletRepository.findById).not.toHaveBeenCalled();
    expect(mockTransaction.runInTransaction).not.toHaveBeenCalled();
    expect(mockWalletRepository.saveOrUpdate).not.toHaveBeenCalled();
    expect(mockMovementRepository.saveOrUpdate).not.toHaveBeenCalled();
  });

  test("Cria uma recorrência com inicio futuro e a execução na data de inicio", async () => {
    const createReccurrent = startUseCase();

    const walletTest = (
      Wallet.create({
        labelName: "Principal",
        ownerId: uuid7(),
      }) as { data: Wallet }
    ).data;

    const input = {
      type: "credito" as const,
      amount: 201.31,
      description: "Teste-Recorrencia",
      walletId: walletTest.id,
      categoryId: uuid7(),
      frequency: "monthly" as const,
      interval: 3,
      installments: 5,
      payOnStartDate: true,
      startDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    };

    mockReccurrentRepository.save.mockResolvedValue({ id: "" });

    const result = (await createReccurrent.execute(
      input,
    )) as CreateReccurentHandlerOutput & {
      success: true;
    };

    expect(result.success).toBe(true);
    expect(result.reccurrent).toHaveProperty("id");

    expect(mockReccurrentRepository.save).toHaveBeenCalled();

    expect(mockWalletRepository.findById).not.toHaveBeenCalled();
    expect(mockTransaction.runInTransaction).not.toHaveBeenCalled();
    expect(mockWalletRepository.saveOrUpdate).not.toHaveBeenCalled();
    expect(mockMovementRepository.saveOrUpdate).not.toHaveBeenCalled();
  });
});
