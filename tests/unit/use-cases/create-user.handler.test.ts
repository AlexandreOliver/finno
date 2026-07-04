import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import {
  CreateUserHandler,
  CreateUserOutput,
} from "@/features/authorization/create-user/create-user.handler";
import { IUserGateway } from "@/domain/repositories/user.gateway";
import { User } from "@/domain/entity/user.entity";
import { IWalletsGateway } from "@/domain/repositories/wallets.gateway";
import { IUnitOfWork } from "@/infrastructure/repositories/unitOfWork.interface";

describe("Caso de uso - Criação de um usuario", () => {
  let mockUserRepository: jest.Mocked<IUserGateway>;
  let mockWalletRepository: jest.Mocked<IWalletsGateway>;
  let mockTransaction: jest.Mocked<IUnitOfWork>;

  const getUseCase = () =>
    CreateUserHandler.create(
      mockUserRepository,
      mockWalletRepository,
      mockTransaction,
    );

  beforeEach(async () => {
    mockUserRepository = {
      save: jest.fn(),
      list: jest.fn(),
      getById: jest.fn(),
      getByEmail: jest.fn(),
      deleteById: jest.fn(),
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

  test("Retorna um Erro ao receber dados invalidos", async () => {
    const createUser = getUseCase();

    const dataInvalid = {
      firstName: "Nome correto",
      lastName: "n",
      email: "email-errado",
      password: "s",
    };

    const result = (await createUser.execute(
      dataInvalid,
    )) as CreateUserOutput & {
      success: false;
    };

    expect(result.success).toBe(false);
    expect(result.message).toBe("Erro de validação");

    expect(result.errors?.lastName).toBeDefined();
    expect(result.errors?.email).toBeDefined();
    expect(result.errors?.password).toBeDefined();

    expect(result.errors?.firstName).toBeUndefined();

    expect(mockUserRepository.save).not.toHaveBeenCalled();
    expect(mockWalletRepository.saveOrUpdate).not.toHaveBeenCalled();
    expect(mockTransaction.runInTransaction).not.toHaveBeenCalled();
  });

  test("Retorna um Erro quando o usuario ja existe", async () => {
    const createUser = getUseCase();

    const data = {
      firstName: "Alexa",
      lastName: "Almeida",
      email: "email@duplicado.com",
      password: "s3244242422",
    };

    mockUserRepository.getByEmail.mockImplementation(async () => {
      const list = [];

      const user = (await User.create(data)) as { success: true; user: User };

      list.push(user.user);

      return list[0];
    });

    const result = (await createUser.execute(data)) as CreateUserOutput & {
      success: false;
    };

    expect(result.success).toBe(false);
    expect(result.message).toBe("Usuario ja cadastrado");

    expect(mockUserRepository.getByEmail).toHaveBeenCalledWith({
      email: data.email,
    });

    expect(mockUserRepository.save).not.toHaveBeenCalled();
    expect(mockWalletRepository.saveOrUpdate).not.toHaveBeenCalled();
    expect(mockTransaction.runInTransaction).not.toHaveBeenCalled();
  });

  test("Cria um novo usuario e uma nova carteira", async () => {
    const createUser = getUseCase();

    mockUserRepository.getByEmail.mockImplementation(async () => null);

    const data = {
      firstName: "nome valido",
      lastName: "ferreira",
      email: "email@correto.com",
      password: "s3244242422",
    };

    const result = (await createUser.execute(data)) as CreateUserOutput & {
      success: true;
    };

    expect(result.success).toBe(true);
    expect(result.message).toBe("Usuario cadastrado com sucesso");

    expect(mockTransaction.runInTransaction).toHaveBeenCalled();

    expect(mockUserRepository.save).toHaveBeenCalled();

    const userInstanceJson = mockUserRepository.save.mock.calls[0][0].toJson();
    const userExpectJson = { ...data, password: undefined };

    expect(userInstanceJson).toMatchObject(userExpectJson);

    expect(mockWalletRepository.saveOrUpdate).toHaveBeenCalled();

    const walletInstanceJson =
      mockWalletRepository.saveOrUpdate.mock.calls[0][0].toJson();
    const walletExpectJson = {
      ownerId: userInstanceJson.id,
      balance: 0,
    };

    expect(walletInstanceJson).toMatchObject(walletExpectJson);
  });
});
