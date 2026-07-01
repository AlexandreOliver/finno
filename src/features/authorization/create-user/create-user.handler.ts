import { User } from "@/domain/entity/user.entity";
import { Wallet } from "@/domain/entity/wallets.entity";
import { Session } from "@/domain/entity/session.entity";

import { IUserGateway } from "@/domain/repositories/user.gateway";
import { IWalletsGateway } from "@/domain/repositories/wallets.gateway";
import { IUnitOfWork } from "@/infrastructure/repositories/unitOfWork.interface";
import { CreateUserCommand } from "./create-user.command";

export type CreateUserOutput =
  | {
      success: false;
      message: string;
      errors?: {
        firstName?: string[];
        lastName?: string[];
        email?: string[];
        password?: string[];
      };
    }
  | {
      success: true;
      message: string;
    };

export class CreateUserHandler {
  private constructor(
    private readonly UserRepository: IUserGateway,
    private readonly WalletRepository: IWalletsGateway,
    private readonly execTransaction: IUnitOfWork,
  ) {}

  public static create(
    userRepository: IUserGateway,
    walletRepository: IWalletsGateway,
    execTransaction: IUnitOfWork,
  ) {
    return new CreateUserHandler(
      userRepository,
      walletRepository,
      execTransaction,
    );
  }

  public async execute(
    dataInput: CreateUserCommand,
  ): Promise<CreateUserOutput> {
    const userOrError = await User.create(dataInput);

    if (!userOrError.success) {
      return {
        success: false,
        message: "Erro de validação",
        errors: userOrError.errors,
      };
    }

    const userFromDb = await this.UserRepository.getByEmail({
      email: userOrError.user.email,
    });

    if (userFromDb) {
      return {
        success: false,
        message: "Usuario ja cadastrado",
      };
    }

    const WalletOrError = Wallet.create({
      ownerId: userOrError.user.id,
      labelName: "Principal",
    });

    if (!WalletOrError.success) {
      return {
        success: false,
        message: "Erro ao criar uma conta",
      };
    }

    const sessionOrError = Session.create({ userId: userOrError.user.id });

    if (!sessionOrError.success) {
      return {
        success: false,
        message: "Erro ao criar uma sessão",
      };
    }

    await this.execTransaction.runInTransaction(async () => {
      await this.UserRepository.save(userOrError.user);
      await this.WalletRepository.saveOrUpdate(WalletOrError.data);
    });

    return {
      success: true,
      message: "Usuario cadastrado com sucesso",
    };
  }
}
