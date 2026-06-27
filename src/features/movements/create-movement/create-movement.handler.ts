import { Movement } from "@/domain/entity/movements.entity";
import { IMovementGateway } from "@/domain/repositories/movements.gateway";
import {
  CreateMovementCommand,
  CreateMovementCommandSchema,
} from "./create-movements.command";
import z from "zod";

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
  private constructor(private readonly movementsRepository: IMovementGateway) {}

  public static create(movementsRepository: IMovementGateway) {
    return new CreateMovementHandler(movementsRepository);
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

    const result = Movement.create(data.data);

    if (!result.success) {
      return {
        success: false,
        message: "Há campos com erros",
        errors: result.errors,
      };
    }

    const isSucess = await this.movementsRepository.save(result.movement);

    if (!isSucess) {
      return {
        success: false,
        message: "Um erro aconteceu ao salvar a transação, tente novamente",
      };
    }

    return {
      success: true,
      message: "Transação Salva com sucesso",
      movement: { id: result.movement?.id as string },
    };
  }
}
