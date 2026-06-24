import { Movement } from "@/domain/movements/movements.entity";
import { IMovementGateway } from "@/domain/movements/movements.gateway";

export type MovementInputDTO = {
  description: string;
  type: string;
  amount: string;
  categoryId: string;
  walletId: string;
  reccurentId?: string;
  executedAt?: string;
  dueDate?: string;
};

export type MovementOutputDTO = {
  errors?: {
    type?: string[] | null;
    description?: string[] | null;
    amount?: string[] | null;
    categoryId?: string[] | null;
    walletId?: string[] | null;
  };
  message: string;
  movement?: { id: string };
  sucess: boolean;
};

export class CreateMovementsUseCase {
  private constructor(private readonly movementsRepository: IMovementGateway) {}

  public static create(movementsRepository: IMovementGateway) {
    return new CreateMovementsUseCase(movementsRepository);
  }

  public async execute(
    dataInput: MovementInputDTO,
  ): Promise<MovementOutputDTO> {
    const data = {
      ...dataInput,
      reccurentId: dataInput.reccurentId ?? null,
      executedAt: new Date(),
      dueDate: dataInput.dueDate ?? null,
    };

    const result = Movement.create(data);

    if (!result.sucess) {
      return {
        sucess: false,
        message: "Há campos com erros",
        errors: result.errors,
      };
    }

    const isSucess = await this.movementsRepository.save(
      result.movement as Movement,
    );

    if (!isSucess) {
      return {
        sucess: false,
        message: "Um erro aconteceu ao salvar a transação, tente novamente",
      };
    }

    return {
      sucess: true,
      message: "Transação Salva com sucesso",
      movement: { id: result.movement?.id as string },
    };
  }
}
