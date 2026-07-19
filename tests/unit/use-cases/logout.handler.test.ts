import { resultCreateSession, Session } from "@/domain/entity/session.entity";
import { ISessionGateway } from "@/domain/repositories/session.gateway";
import { LogoutHandler } from "@/features/authorization/logout/logout.handler";
import { describe, jest, test, beforeEach, expect } from "@jest/globals";
import { v7 as uuid7 } from "uuid";

describe("Lougout Hanlder", () => {
  let SessionRepository: jest.Mocked<ISessionGateway>;

  beforeEach(() => {
    SessionRepository = {
      saveOrUpdate: jest.fn(),
      isActive: jest.fn(),
      findActiveByToken: jest.fn(),
      findActive: jest.fn(),
    };
  });

  const startUseCase = () => LogoutHandler.create(SessionRepository);

  test("Faz logout e muda o estado da sessao", async () => {
    const logoutHandler = startUseCase();

    const sessionTest = (
      Session.create({ userId: uuid7() }) as resultCreateSession & {
        success: true;
      }
    ).data;

    SessionRepository.findActive.mockResolvedValue([sessionTest]);
    SessionRepository.saveOrUpdate.mockResolvedValue(true);

    const result = await logoutHandler.execute({
      userId: sessionTest.userId,
      sessionToken: sessionTest.token,
    });

    expect(result).toBe(true);

    expect(SessionRepository.findActive).toHaveBeenCalled();

    const inputDataFindActiveByUserId =
      SessionRepository.findActive.mock.calls[0][0];
    expect(inputDataFindActiveByUserId).toStrictEqual({
      userId: sessionTest.userId,
      sessionToken: sessionTest.token,
    });

    expect(sessionTest.isActive()).toBe(false);

    expect(SessionRepository.saveOrUpdate).toHaveBeenCalled();

    const inputDataSaveOrUpdate =
      SessionRepository.saveOrUpdate.mock.calls[0][0];
    expect(inputDataSaveOrUpdate.toJson()).toStrictEqual(sessionTest.toJson());

    expect(sessionTest.updatedAt.toISOString().slice(0, 10)).toBe(
      new Date().toISOString().slice(0, 10),
    );
  });
});
