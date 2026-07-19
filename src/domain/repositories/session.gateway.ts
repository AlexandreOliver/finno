import { Session } from "../entity/session.entity";

export interface ISessionGateway {
  saveOrUpdate(session: Session): Promise<boolean>;
  findActiveByToken(token: string): Promise<Session | null>;
  findActive(props: {
    userId: string;
    token?: string;
  }): Promise<Session[] | null>;
  isActive(token: string): Promise<boolean>;
}
