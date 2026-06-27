import { Reccurent } from "@/domain/entity/reccurent.entity";
import { IReccurentGateway } from "@/domain/repositories/reccurent.gateway";

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
  start_date: string;
  end_date?: string | null;
  next_due_date?: string | null;
};

export type outputDTO = {
  errors?: {
    type?: string[] | null;
    description?: string[] | null;
    amount?: string[] | null;
    categoryId?: string[] | null;
    walletId?: string[] | null;
    isReccurent?: string[] | null;
    status?: string[] | null;
    frequencie?: string[] | null;
    interval?: string[] | null;
    installments?: string[] | null;
    start_date?: string[] | null;
    end_date?: string[] | null;
  };
  message: string;
  movement?: { id: string };
  success: boolean;
};

export class CreateReccurentUseCase {
  private constructor(
    private readonly ReccurentRepository: IReccurentGateway,
  ) {}

  public static create(ReccurentRepository: IReccurentGateway) {
    return new CreateReccurentUseCase(ReccurentRepository);
  }

  public async execute(input: inputDTO): Promise<outputDTO> {
    const response = Reccurent.create({ ...input, countPaid: 0 });

    if (!response.sucess) {
      return {
        success: false,
        errors: response.errors,
        message: "Ha Campos com erros",
      };
    }

    const result = await this.ReccurentRepository.save(
      response.reccurent as Reccurent,
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
