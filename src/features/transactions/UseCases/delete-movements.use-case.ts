import { IMovementGateway } from "@/domain/movements/movements.gateway";

export class DeleteMovementsUseCase {
  private constructor(private readonly MovementsRepository: IMovementGateway) {}

  public static create(MovementsRepository: IMovementGateway) {
    return new DeleteMovementsUseCase(MovementsRepository);
  }

  public async execute(walletId: string): Promise<boolean> {
    return await this.MovementsRepository.deleteById(walletId);
  }
}
