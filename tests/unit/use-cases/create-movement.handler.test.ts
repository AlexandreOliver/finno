import { beforeEach, describe, expect, jest, test } from "@jest/globals";

import { IUnitOfWork } from "@/infrastructure/repositories/unitOfWork.interface";
import { IWalletsGateway } from "@/domain/repositories/wallets.gateway";
import { IMovementGateway } from "@/domain/repositories/movements.gateway";

import {
  CreateMovementHandler,
  MovementOutputDTO,
} from "@/features/transactions/create-movement/create-movement.handler";
import { v7 as uuid7 } from "uuid";
import { Wallet } from "@/domain/entity/wallets.entity";

describe("Caso de Uso - Criar uma movimentação", () => {
  let mockWalletRepository: jest.Mocked<IWalletsGateway>;
  let mockMovementRepository: jest.Mocked<IMovementGateway>;
  let mockTransaction: jest.Mocked<IUnitOfWork>;

  const startUseCase = () =>
    CreateMovementHandler.create(
      mockMovementRepository,
      mockWalletRepository,
      mockTransaction,
    );

  beforeEach(async () => {
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

  test("Ao criar uma movimentação de debito o valor é retirado da carteira", async () => {
    const createMovement = startUseCase();

    const walletTest = (
      Wallet.create({
        labelName: "Principal",
        ownerId: uuid7(),
      }) as { data: Wallet }
    ).data;

    const data = {
      description: "Mercado do mes",
      type: "debito" as const,
      amount: 500.0,
      categoryId: uuid7(),
      walletId: walletTest.id,
      reccurrentId: null,
      isReversal: false,
      isRefunded: false,
      reversalOfId: null,
      executedAt: new Date(),
      dueDate: null,
    };

    mockWalletRepository.findById.mockResolvedValue(walletTest);

    const result = (await createMovement.execute(data)) as MovementOutputDTO & {
      success: true;
    };

    expect(result.success).toBe(true);
    expect(result.movement).toHaveProperty("id");

    expect(mockWalletRepository.findById).toHaveBeenCalled();
    expect(mockTransaction.runInTransaction).toHaveBeenCalled();
    expect(mockWalletRepository.saveOrUpdate).toHaveBeenCalled();
    expect(mockMovementRepository.saveOrUpdate).toHaveBeenCalled();

    const WalletAfter = walletTest.toJson();
    expect(WalletAfter.balance).toBe(-Number(data.amount));

    const walletSaved = mockWalletRepository.saveOrUpdate.mock.calls[0][0];
    const movementSaved = mockMovementRepository.saveOrUpdate.mock.calls[0][0];

    expect(walletSaved.toJson()).toStrictEqual(WalletAfter);
    expect(movementSaved.toJson({ omit: ["id"] })).toStrictEqual({
      ...data,
      amount: Number(data.amount),
      isReversal: false,
      isRefunded: false,
      reversalOfId: null,
    });
  });

  test("Ao criar uma movimentação de credito o valor é adicionado a carteira", async () => {
    const createMovement = startUseCase();

    const walletTest = (
      Wallet.create({
        labelName: "Principal",
        ownerId: uuid7(),
      }) as { data: Wallet }
    ).data;

    mockWalletRepository.findById.mockResolvedValue(walletTest);

    const data = {
      description: "Salario do mes",
      type: "credito" as const,
      amount: 1500.0,
      categoryId: uuid7(),
      walletId: walletTest.id,
      reccurrentId: null,
      isReversal: false,
      isRefunded: false,
      reversalOfId: null,
      executedAt: new Date(),
      dueDate: null,
    };

    const result = (await createMovement.execute(data)) as MovementOutputDTO & {
      success: true;
    };

    expect(result.success).toBe(true);
    expect(result.movement).toHaveProperty("id");

    expect(mockWalletRepository.findById).toHaveBeenCalled();
    expect(mockTransaction.runInTransaction).toHaveBeenCalled();
    expect(mockWalletRepository.saveOrUpdate).toHaveBeenCalled();
    expect(mockMovementRepository.saveOrUpdate).toHaveBeenCalled();

    const WalletAfter = walletTest.toJson();
    expect(WalletAfter.balance).toBe(Number(data.amount));

    const WalletSaved = mockWalletRepository.saveOrUpdate.mock.calls[0][0];
    const movementSaved = mockMovementRepository.saveOrUpdate.mock.calls[0][0];

    expect(WalletSaved.toJson()).toStrictEqual(WalletAfter);
    expect(movementSaved.toJson({ omit: ["id"] })).toStrictEqual({
      ...data,
      amount: Number(data.amount),
      isReversal: false,
      isRefunded: false,
      reversalOfId: null,
    });
  });
});
