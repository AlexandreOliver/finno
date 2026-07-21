import { Reccurrent } from "@/domain/entity/reccurrent.entity";
import { IReccurrentGateway } from "@/domain/repositories/reccurrent.gateway";

export type inputDTO = {
  type: string;
  description: string;
  status: string;
  amount: string;
  frequency: string;
  interval: number | string;
  categoryId: string;
  walletId: string;
  installments: number | string;
  startDate: string;
  endDate?: string | null;
  nextDueDate?: Date | null;
};

export type outputDTO = {
  errors?: {
    type?: string[] | null;
    description?: string[] | null;
    amount?: string[] | null;
    categoryId?: string[] | null;
    walletId?: string[] | null;
    isreccurrent?: string[] | null;
    status?: string[] | null;
    frequencie?: string[] | null;
    interval?: string[] | null;
    installments?: string[] | null;
    startDate?: string[] | null;
    endDate?: string[] | null;
  };
  message: string;
  movement?: { id: string };
  success: boolean;
};

export class CreatereccurrentUseCase {
  private constructor(
    private readonly reccurrentRepository: IReccurrentGateway,
  ) {}

  public static create(reccurrentRepository: IReccurrentGateway) {
    return new CreatereccurrentUseCase(reccurrentRepository);
  }

  public async execute(input: inputDTO): Promise<outputDTO> {
    const response = Reccurrent.create({ ...input, countPaid: 0 });

    if (!response.success) {
      return {
        success: false,
        errors: response.errors,
        message: "Ha Campos com erros",
      };
    }

    const result = await this.reccurrentRepository.save(
      response.data as Reccurrent,
    );

    if (result) {
      return {
        success: true,
        message: "Transação salva com sucesso",
      };
    }

    return { success: false, message: "Um erro aconteceu tente novamente" };
  }
}
