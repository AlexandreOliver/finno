import { beforeEach, describe, expect, jest, test } from "@jest/globals";

import { IUnitOfWork } from "@/infrastructure/repositories/unitOfWork.interface";
import { IWalletsGateway } from "@/domain/repositories/wallets.gateway";
import { IMovementGateway } from "@/domain/repositories/movements.gateway";

import { DeleteMovementHandler } from "@/features/transactions/delete-movement/delete-movement.handler";
import { v7 as uuid7 } from "uuid";
import {
  FunctionNewMovement,
  resultCreateWallet,
  Wallet,
} from "@/domain/entity/wallets.entity";

describe("Caso de Uso - Apagar uma movimentação", () => {
  let mockWalletRepository: jest.Mocked<IWalletsGateway>;
  let mockMovementRepository: jest.Mocked<IMovementGateway>;
  let mockTransaction: jest.Mocked<IUnitOfWork>;

  const startUseCase = () =>
    DeleteMovementHandler.create(
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

  test("Ao reverter uma movimentação de debito é gerado o estorno e salvo o novo valor na carteira", async () => {
    const deleteMovement = startUseCase();

    const { data: walletTest } = Wallet.create({
      labelName: "Principal",
      ownerId: uuid7(),
    }) as resultCreateWallet & { success: true };

    const oldBalance = walletTest.balance;

    const { data: movementTest } = walletTest.debito({
      amount: 500.0,
      movConfig: {
        reccurrentId: null,
        description: "Mercado do mes",
        isRefunded: false,
        categoryId: uuid7(),
        dueDate: null,
        executedAt: new Date(),
      },
    }) as ReturnType<FunctionNewMovement> & { success: true };

    mockWalletRepository.findById.mockResolvedValue(walletTest);
    mockMovementRepository.getById.mockResolvedValue(movementTest);

    await deleteMovement.execute({ id: movementTest.id });

    expect(mockWalletRepository.findById).toHaveBeenCalled();
    expect(mockTransaction.runInTransaction).toHaveBeenCalled();
    expect(mockMovementRepository.saveOrUpdate).toHaveBeenCalledTimes(2);
    expect(mockWalletRepository.saveOrUpdate).toHaveBeenCalledWith(walletTest);

    expect(walletTest.balance).toBe(oldBalance);

    const estorno = mockMovementRepository.saveOrUpdate.mock.calls[0][0];
    const movementAlterado =
      mockMovementRepository.saveOrUpdate.mock.calls[1][0];

    expect(movementAlterado.isRefunded).toBe(true);

    expect(estorno.toJson()).toStrictEqual({
      ...movementTest.toJson(),
      id: estorno.id,
      type: "credito",
      isRefunded: false,
      isReversal: true,
      reversalOfId: movementTest.id,
      description: `Estorno - ${movementTest.description}`,
      executedAt: estorno.executedAt,
    });
  });

  test("Ao reverter uma movimentação de credito é gerado o estorno e salvo o novo valor na carteira", async () => {
    const deleteMovement = startUseCase();

    const { data: walletTest } = Wallet.create({
      labelName: "Principal",
      ownerId: uuid7(),
    }) as resultCreateWallet & { success: true };

    const oldBalance = walletTest.balance;

    const { data: movementTest } = walletTest.credito({
      amount: 500.0,
      movConfig: {
        reccurrentId: null,
        description: "Freelancer",
        isRefunded: false,
        categoryId: uuid7(),
        dueDate: null,
        executedAt: new Date(),
      },
    }) as ReturnType<FunctionNewMovement> & { success: true };

    mockWalletRepository.findById.mockResolvedValue(walletTest);
    mockMovementRepository.getById.mockResolvedValue(movementTest);

    await deleteMovement.execute({ id: movementTest.id });

    expect(mockWalletRepository.findById).toHaveBeenCalled();
    expect(mockTransaction.runInTransaction).toHaveBeenCalled();
    expect(mockMovementRepository.saveOrUpdate).toHaveBeenCalled();
    expect(mockWalletRepository.saveOrUpdate).toHaveBeenCalledWith(walletTest);

    const WalletAfter = walletTest.toJson();
    expect(WalletAfter.balance).toBe(oldBalance);

    const estorno = mockMovementRepository.saveOrUpdate.mock.calls[0][0];
    const movementAlterado =
      mockMovementRepository.saveOrUpdate.mock.calls[1][0];

    expect(movementAlterado.isRefunded).toBe(true);

    expect(estorno.toJson()).toStrictEqual({
      ...movementTest.toJson({
        omit: ["type", "executedAt"],
      }),
      id: estorno.id,
      executedAt: estorno.executedAt,
      type: "debito",
      isReversal: true,
      isRefunded: false,
      reversalOfId: movementTest.id,
      description: `Estorno - ${movementTest.description}`,
    });
  });

  test("Falha ao tentar reverter uma movimentação que ja foi estornada", async () => {
    const deleteMovement = startUseCase();

    const { data: walletTest } = Wallet.create({
      labelName: "Principal",
      ownerId: uuid7(),
    }) as resultCreateWallet & { success: true };

    // const oldBalance = walletTest.balance;

    const { data: movementTest } = walletTest.credito({
      amount: 500.0,
      movConfig: {
        reccurrentId: null,
        description: "Freelancer",
        isRefunded: false,
        categoryId: uuid7(),
        dueDate: null,
        executedAt: new Date(),
      },
    }) as ReturnType<FunctionNewMovement> & { success: true };

    movementTest.isRefunded = true;

    mockWalletRepository.findById.mockResolvedValue(walletTest);
    mockMovementRepository.getById.mockResolvedValue(movementTest);

    const result = await deleteMovement.execute({ id: movementTest.id });

    expect(result).toStrictEqual({
      success: false,
      message: "Ja existe um estorno para essa movimentação",
    });
  });
});
