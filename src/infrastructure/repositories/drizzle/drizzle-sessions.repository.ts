import { ISessionGateway } from "@/domain/repositories/session.gateway";
import { sessions } from "@/infrastructure/database/schemas/sessions";
import db from "@/infrastructure/database";
import { eq, gt, and, sql } from "drizzle-orm";
import { Session } from "@/domain/entity/session.entity";

export class SessionsRepositoryDrizzle implements ISessionGateway {
  private constructor(private readonly dbInstance: typeof db) {}

  public static create(dbInstance: typeof db) {
    return new SessionsRepositoryDrizzle(dbInstance);
  }

  public saveOrUpdate: ISessionGateway["saveOrUpdate"] = async (session) => {
    const sessionDto = session.toJson();

    const result = await this.dbInstance
      .insert(sessions)
      .values(sessionDto)
      .onConflictDoUpdate({
        target: sessions.id,
        set: { expiresAt: sql`excluded.expires_at` },
      })
      .returning();

    return result.length > 0;
  };

  public findActiveByToken: ISessionGateway["findActiveByToken"] = async (
    token,
  ) => {
    const result = await this.dbInstance
      .select()
      .from(sessions)
      .where(eq(sessions.token, token));

    const session = Session.with(result[0]);

    return session;
  };

  public findActiveByUserId: ISessionGateway["findActiveByUserId"] = async (
    userId,
  ) => {
    const result = await this.dbInstance
      .select()
      .from(sessions)
      .where(
        and(eq(sessions.userId, userId), gt(sessions.expiresAt, new Date())),
      );

    const session = result.length > 0 ? Session.with(result[0]) : null;

    return session;
  };

  public isActive: ISessionGateway["isActive"] = async () => {
    throw new Error("Nao implementado");
  };
}
