import { IMovementGateway } from "@/domain/repositories/movements.gateway";
import { CreateMovementCommand } from "./create-movements.command";
import { IUnitOfWork } from "@/infrastructure/repositories/unitOfWork.interface";
import { IWalletsGateway } from "@/domain/repositories/wallets.gateway";
import { FunctionNewMovement } from "@/domain/entity/wallets.entity";

export type MovementOutputDTO =
  | {
      success: false;
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
    newMovementDTO: CreateMovementCommand,
  ): Promise<MovementOutputDTO> {
    const wallet = await this.walletRepository.findById(
      newMovementDTO.walletId,
    );

    if (!wallet) {
      return {
        success: false,
        message: "A Carteira associada não existe",
      };
    }

    let movementOrError: ReturnType<FunctionNewMovement>;
    switch (newMovementDTO.type) {
      case "credito":
        movementOrError = wallet.credito({
          amount: newMovementDTO.amount,
          movConfig: {
            ...newMovementDTO,
          },
        });
        break;
      case "debito":
        movementOrError = wallet.debito({
          amount: newMovementDTO.amount,
          movConfig: {
            ...newMovementDTO,
          },
        });
        break;
    }

    if (!movementOrError.success) {
      return {
        success: false,
        message: movementOrError.message,
      };
    }

    try {
      await this.transactionService.runInTransaction(async () => {
        await this.movementsRepository.saveOrUpdate(movementOrError.data);
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
