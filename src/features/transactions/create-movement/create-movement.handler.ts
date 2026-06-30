import { Movement } from "@/domain/entity/movements.entity";
import { IMovementGateway } from "@/domain/repositories/movements.gateway";
import {
  CreateMovementCommand,
  CreateMovementCommandSchema,
} from "./create-movements.command";
import z from "zod";
import { IUnitOfWork } from "@/features/unitOfWork";
import { IWalletsGateway } from "@/domain/repositories/wallets.gateway";

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
    const data = CreateMovementCommandSchema.safeParse(dataInput);

    if (!data.success) {
      return {
        success: false,
        message: "Há campos com erros",
        errors: z.flattenError(data.error).fieldErrors,
      };
    }

    const movementOrError = Movement.create(data.data);

    if (!movementOrError.success) {
      return {
        success: false,
        message: "Há campos com erros",
        errors: movementOrError.errors,
      };
    }

    const wallet = await this.walletRepository.findById(
      movementOrError.movement.walletId,
    );

    if (!wallet) {
      return {
        success: false,
        message: "A Carteira associada nao existe",
      };
    }

    switch (movementOrError.movement.type) {
      case "credito":
        wallet.credito(movementOrError.movement.amount);
        break;
      case "debito":
        wallet.debito(movementOrError.movement.amount);
        break;
    }

    try {
      await this.transactionService.runInTransaction(async () => {
        await this.movementsRepository.save(movementOrError.movement);
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
      movement: { id: movementOrError.movement?.id as string },
    };
  }
}
