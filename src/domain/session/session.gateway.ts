import { Session } from "./session.entity";

export interface ISessionGateway {
  save(session: Session): Promise<boolean>;
  findActiveByToken(token: string): Promise<Session | null>;
  renew(sessionId: string): Promise<boolean>;
  isActive(token: string): Promise<boolean>;
}
