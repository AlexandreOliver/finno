import { ISessionGateway } from "@/domain/repositories/session.gateway";
import { sessions } from "@/infrastructure/database/schemas/sessions";
import db from "@/infrastructure/database";

export class SessionsRepositoryDrizzle implements ISessionGateway {
  private constructor(private readonly dbInstance: typeof db) {}

  public static create(dbInstance: typeof db) {
    return new SessionsRepositoryDrizzle(dbInstance);
  }

  public save: ISessionGateway["save"] = async (session) => {
    const sessionDto = session.toJson();

    const result = await this.dbInstance
      .insert(sessions)
      .values(sessionDto)
      .returning();

    return result.length > 0;
  };

  public findActiveByToken: ISessionGateway["findActiveByToken"] = async () => {
    throw new Error("Nao implementado");
  };

  public renew: ISessionGateway["renew"] = async () => {
    throw new Error("Nao implementado");
  };

  public isActive: ISessionGateway["isActive"] = async () => {
    throw new Error("Nao implementado");
  };
}
