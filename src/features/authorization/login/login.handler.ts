import { User } from "@/domain/entity/user.entity";
import { ISessionGateway } from "@/domain/repositories/session.gateway";
import { IUserGateway } from "@/domain/repositories/user.gateway";
import { credentialSchema, LoginCommand } from "./login.command";
import z from "zod";
import { Session } from "@/domain/entity/session.entity";

export type LoginHandlerOutput =
  | {
      success: false;
      errors?: {
        email?: string[];
        password?: string[];
      };
      message?: string | null;
    }
  | {
      success: true;
      sessionToken: string;
    };

export class LoginHandler {
  private constructor(
    private readonly SessionRepository: ISessionGateway,
    private readonly UserRepository: IUserGateway,
  ) {}

  public static create(
    SessionRepository: ISessionGateway,
    UserRepository: IUserGateway,
  ) {
    return new LoginHandler(SessionRepository, UserRepository);
  }

  public async execute(props: LoginCommand): Promise<LoginHandlerOutput> {
    const dataFormated = credentialSchema.safeParse(props);

    if (!dataFormated.success) {
      return {
        success: false,
        errors: z.flattenError(dataFormated.error).fieldErrors,
        message: "Há compos com erros",
      };
    }

    const userIndDb = await this.UserRepository.getByEmail({
      email: dataFormated.data.email,
    });

    if (!userIndDb) {
      return {
        success: false,
        message: "Verifique o email e a senha",
      };
    }

    const passwordMatch = await User.compareHash(
      userIndDb.password,
      dataFormated.data.password,
    );

    if (!passwordMatch) {
      return {
        success: false,
        message: "Verifique o email e a senha",
      };
    }

    const sessionExist = await this.SessionRepository.findActiveByUserId(
      userIndDb.id,
    );

    if (sessionExist) {
      sessionExist.renew();

      await this.SessionRepository.saveOrUpdate(sessionExist);

      return {
        success: true,
        sessionToken: sessionExist.token,
      };
    } else {
      const session = Session.create({ userId: userIndDb.id });

      if (!session.success) {
        return {
          success: false,
          message: "Ocorreu algum erro ao criar a sessão. Tente Novamente",
        };
      }
      await this.SessionRepository.saveOrUpdate(session.data);

      return {
        success: true,
        sessionToken: session.data.token,
      };
    }
  }
}
