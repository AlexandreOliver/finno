import { IMovementGateway } from "@/domain/repositories/movements.gateway";
import {
  CreateMovementCommand,
  CreateMovementCommandSchema,
} from "./create-movements.command";
import z from "zod";
import { IUnitOfWork } from "@/infrastructure/repositories/unitOfWork.interface";
import { IWalletsGateway } from "@/domain/repositories/wallets.gateway";
import { FunctionNewMovement } from "@/domain/entity/wallets.entity";

export type MovementOutputDTO =
  | {
      success: false;
      errors?: {
        type?: string[] | null;
        description?: string[] | null;
        amount?: string[] | null;
        categoryId?: string[] | null;
        walletId?: string[] | null;
      };
      message: string;
    }
  | {
      success: true;
      message: string;
      movement?: { id: string };
    };

export class CreateMovementHandler {
  private constructor(
    private readonly movementsRepository: IMovementGateway,
    private readonly walletRepository: IWalletsGateway,
    private readonly transactionService: IUnitOfWork,
  ) {}

  public static create(
    movementsRepository: IMovementGateway,
    walletRepository: IWalletsGateway,
    transactionService: IUnitOfWork,
  ) {
    return new CreateMovementHandler(
      movementsRepository,
      walletRepository,
      transactionService,
    );
  }

  public async execute(
    dataInput: CreateMovementCommand,
  ): Promise<MovementOutputDTO> {
    const dataReceived = CreateMovementCommandSchema.safeParse(dataInput);

    if (!dataReceived.success) {
      return {
        success: false,
        message: "Há campos com erros",
        errors: z.flattenError(dataReceived.error).fieldErrors,
      };
    }

    // const movementOrError = Movement.create(dataReceived.data);

    const wallet = await this.walletRepository.findById(
      dataReceived.data.walletId,
    );

    if (!wallet) {
      return {
        success: false,
        message: "A Carteira associada nao existe",
      };
    }

    let movementOrError: ReturnType<FunctionNewMovement>;
    switch (dataReceived.data.type) {
      case "credito":
        movementOrError = wallet.credito({
          amount: dataReceived.data.amount,
          movConfig: {
            ...dataReceived.data,
          },
        });
        break;
      case "debito":
        movementOrError = wallet.debito({
          amount: dataReceived.data.amount,
          movConfig: {
            ...dataReceived.data,
          },
        });
        break;
    }

    if (!movementOrError.success) {
      return {
        success: false,
        message: movementOrError.message,
        errors: movementOrError.errors,
      };
    }

    try {
      await this.transactionService.runInTransaction(async () => {
        await this.movementsRepository.save(movementOrError.data);
        await this.walletRepository.saveOrUpdate(wallet);
      });
    } catch {
      return {
        success: false,
        message: "Um erro aconteceu ao salvar a transação, tente novamente",
      };
    }

    return {
      success: true,
      message: "Transação Salva com sucesso",
      movement: { id: movementOrError.data.id },
    };
  }
}
