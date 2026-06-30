import { beforeEach, describe, expect, jest, test } from "@jest/globals";

import { IUnitOfWork } from "@/features/unitOfWork";
import { IWalletsGateway } from "@/domain/repositories/wallets.gateway";
import { IMovementGateway } from "@/domain/repositories/movements.gateway";

import { DeleteMovementHandler } from "@/features/transactions/delete-movement/delete-movement.handler";
import { v7 as uuid7 } from "uuid";
import { Wallet } from "@/domain/entity/wallets.entity";
import { Movement } from "@/domain/entity/movements.entity";

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
      save: jest.fn(),
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

  test("Ao apagar uma movimentação de debito o valor é adicionado na carteira", async () => {
    const deleteMovement = startUseCase();

    const walletTest = Wallet.with({
      id: "019f1aa1-d10c-778a-88e3-25a35ddd8960",
      balance: "0.0",
      labelName: "Principal",
      createdAt: new Date(),
      updatedAt: new Date(),
      ownerId: "019f1aa1-d10c-778a-88e3-25a35ddd83430",
    });

    const movementTest = Movement.create({
      description: "Mercado do mes",
      type: "debito",
      amount: 500.0,
      categoryId: uuid7(),
      walletId: "019f1aa1-d10c-778a-88e3-25a35ddd8960",
      reccurentId: null,
      executedAt: new Date(),
      dueDate: null,
    }).movement as Movement;

    mockWalletRepository.findById.mockResolvedValue(walletTest);
    mockMovementRepository.getById.mockResolvedValue(movementTest);

    await deleteMovement.execute({ id: movementTest.id });

    const WalletAfter = walletTest.toJson();

    expect(mockWalletRepository.findById).toHaveBeenCalled();

    expect(WalletAfter.balance).toBe(Number(movementTest.amount));

    expect(mockTransaction.runInTransaction).toHaveBeenCalled();

    const walletSaved_Expected = Wallet.with({
      ...WalletAfter,
      balance: WalletAfter.balance.toString(),
    });

    expect(mockWalletRepository.saveOrUpdate).toHaveBeenCalledWith(
      walletSaved_Expected,
    );

    expect(mockMovementRepository.deleteById).toHaveBeenCalledWith(
      movementTest.id,
    );
  });

  test("Ao apagar uma movimentação de credito o valor é retirado da carteira", async () => {
    const deleteMovement = startUseCase();

    const walletTest = Wallet.with({
      id: "019f1aa1-d10c-778a-88e3-25a35ddd8960",
      balance: "0.0",
      labelName: "Principal",
      createdAt: new Date(),
      updatedAt: new Date(),
      ownerId: "019f1aa1-d10c-778a-88e3-25a35ddd83430",
    });

    const movementTest = Movement.create({
      description: "Mercado do mes",
      type: "debito",
      amount: 500.0,
      categoryId: uuid7(),
      walletId: "019f1aa1-d10c-778a-88e3-25a35ddd8960",
      reccurentId: null,
      executedAt: new Date(),
      dueDate: null,
    }).movement as Movement;

    mockWalletRepository.findById.mockResolvedValue(walletTest);
    mockMovementRepository.getById.mockResolvedValue(movementTest);

    await deleteMovement.execute({ id: movementTest.id });

    const WalletAfter = walletTest.toJson();

    expect(mockWalletRepository.findById).toHaveBeenCalled();

    expect(WalletAfter.balance).toBe(Number(movementTest.amount));

    expect(mockTransaction.runInTransaction).toHaveBeenCalled();

    const walletSaved_Expected = Wallet.with({
      ...WalletAfter,
      balance: WalletAfter.balance.toString(),
    });

    expect(mockWalletRepository.saveOrUpdate).toHaveBeenCalledWith(
      walletSaved_Expected,
    );

    expect(mockMovementRepository.deleteById).toHaveBeenCalledWith(
      movementTest.id,
    );
  });
});
