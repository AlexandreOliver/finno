import { ISessionGateway } from "@/domain/repositories/session.gateway";
import { LogoutCommand } from "./logout.command";
import { Session } from "@/domain/entity/session.entity";

export class LogoutHandler {
  private constructor(private SessionRepository: ISessionGateway) {}

  public static create(SessionRepository: ISessionGateway) {
    return new LogoutHandler(SessionRepository);
  }

  public async execute(props: LogoutCommand): Promise<boolean> {
    const session = (await this.SessionRepository.findActive(
      props,
    )) as Session[];

    session[0].invalidate();

    const result = await this.SessionRepository.saveOrUpdate(session[0]);

    return result;
  }
}
