import { resultCreateSession, Session } from "@/domain/entity/session.entity";
import { resultCreate, User } from "@/domain/entity/user.entity";
import { ISessionGateway } from "@/domain/repositories/session.gateway";
import { IUserGateway } from "@/domain/repositories/user.gateway";
import {
  LoginHandler,
  LoginHandlerOutput,
} from "@/features/authorization/login/login.handler";
import { describe, beforeEach, test, jest, expect } from "@jest/globals";

describe("Caso de uso - Login", () => {
  let mockUserRepository: jest.Mocked<IUserGateway>;
  let mockSessionRepository: jest.Mocked<ISessionGateway>;

  const getUseCase = () => {
    return LoginHandler.create(mockSessionRepository, mockUserRepository);
  };

  beforeEach(() => {
    mockUserRepository = {
      save: jest.fn(),
      getByEmail: jest.fn(),
      getById: jest.fn(),
      list: jest.fn(),
      deleteById: jest.fn(),
    };

    mockSessionRepository = {
      findActiveByUserId: jest.fn(),
      findActiveByToken: jest.fn(),
      isActive: jest.fn(),
      saveOrUpdate: jest.fn(),
    };
  });

  test("Não faz login quando o email nao esta no banco", async () => {
    const LoginHandler = getUseCase();

    mockUserRepository.getByEmail.mockResolvedValue(null);

    const credentials = {
      email: "email-nao-existe@gmail.com",
      password: "123456",
    };

    const result = (await LoginHandler.execute(
      credentials,
    )) as LoginHandlerOutput & {
      success: false;
    };

    expect(result.success).toBe(false);
    expect(result.message).not.toBeNull();

    expect(mockUserRepository.getByEmail).toHaveBeenCalledWith({
      email: credentials.email,
    });

    expect(mockSessionRepository.saveOrUpdate).not.toHaveBeenCalled();
  });

  test("Não faz login quando a senha esta errada", async () => {
    const LoginHandler = getUseCase();

    const userTest = (await User.create({
      email: "email-nao-existe@gmail.com",
      password: "123456",
      firstName: "TesteUser",
      lastName: "Jest",
    })) as resultCreate & { success: true };

    mockUserRepository.getByEmail.mockResolvedValue(userTest.user);

    const credentials = {
      email: userTest.user.email,
      password: "senhaErrada",
    };

    const result = (await LoginHandler.execute(
      credentials,
    )) as LoginHandlerOutput & {
      success: false;
    };

    expect(result.success).toBe(false);
    expect(result.message).not.toBeNull();

    expect(mockUserRepository.getByEmail).toHaveBeenCalledWith({
      email: credentials.email,
    });

    expect(mockSessionRepository.saveOrUpdate).not.toHaveBeenCalled();
  });

  test("Recebe as credenciais corretas, cria a sessão e retorna o token de sessão", async () => {
    const LoginHandler = getUseCase();

    const userTest = (await User.create({
      email: "email-nao-existe@gmail.com",
      password: "123456",
      firstName: "TesteUser",
      lastName: "Jest",
    })) as resultCreate & { success: true };

    mockUserRepository.getByEmail.mockResolvedValue(userTest.user);

    const credentials = {
      email: userTest.user.email,
      password: "123456",
    };

    const result = (await LoginHandler.execute(
      credentials,
    )) as LoginHandlerOutput & {
      success: true;
    };

    expect(result.success).toBe(true);
    expect(result.sessionToken).toHaveLength(Session.sizeTokenBytes * 2);

    expect(mockUserRepository.getByEmail).toHaveBeenCalledWith({
      email: credentials.email,
    });

    const sessionOwnedUser =
      mockSessionRepository.saveOrUpdate.mock.calls[0][0];

    expect(sessionOwnedUser.userId).toBe(userTest.user.id);
  });

  test("Verifica se ja existe uma sessao ativa, renova e retorna o token, sem criar outra", async () => {
    const LoginHandler = getUseCase();

    const userTest = (await User.create({
      email: "email-nao-existe@gmail.com",
      password: "123456",
      firstName: "TesteUser",
      lastName: "Jest",
    })) as resultCreate & { success: true };

    const sessionTest = (await Session.create({
      userId: userTest.user.id,
    })) as resultCreateSession & { success: true };

    mockUserRepository.getByEmail.mockResolvedValue(userTest.user);
    mockSessionRepository.findActiveByUserId.mockResolvedValue(
      sessionTest.data,
    );

    const credentials = {
      email: userTest.user.email,
      password: "123456",
    };

    const result = (await LoginHandler.execute(
      credentials,
    )) as LoginHandlerOutput & {
      success: true;
    };

    expect(result.success).toBe(true);
    expect(result.sessionToken).toHaveLength(Session.sizeTokenBytes * 2);

    expect(mockUserRepository.getByEmail).toHaveBeenCalledWith({
      email: credentials.email,
    });

    expect(mockSessionRepository.findActiveByUserId).toHaveBeenCalled();

    const sessionRenew = mockSessionRepository.saveOrUpdate.mock.calls[0][0];

    const diffExpiresAt =
      sessionRenew.expiresAt.getTime() - sessionRenew.createdAt.getTime();

    expect(diffExpiresAt).toBe(Session.defaultExpireInMs * 2);
  });
});
