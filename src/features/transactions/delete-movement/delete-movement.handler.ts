import { IMovementGateway } from "@/domain/repositories/movements.gateway";
import { IWalletsGateway } from "@/domain/repositories/wallets.gateway";
import { DeleteMovementCommand } from "./delete-movement.command";
import { Wallet } from "@/domain/entity/wallets.entity";
import { IUnitOfWork } from "@/infrastructure/repositories/unitOfWork.interface";

export class DeleteMovementHandler {
  private constructor(
    private readonly MovementsRepository: IMovementGateway,
    private readonly IWalletsRepository: IWalletsGateway,
    private readonly TransactionService: IUnitOfWork,
  ) {}

  public static create(
    MovementsRepository: IMovementGateway,
    IWalletsRepository: IWalletsGateway,
    TransactionService: IUnitOfWork,
  ) {
    return new DeleteMovementHandler(
      MovementsRepository,
      IWalletsRepository,
      TransactionService,
    );
  }

  public async execute(props: DeleteMovementCommand) {
    const movement = await this.MovementsRepository.getById(props.id);

    if (!movement) {
      return {
        message: "Transação inexistente",
      };
    }

    const wallet = await this.IWalletsRepository.findById(movement.walletId);

    switch (movement.type) {
      case "credito":
        wallet?.debito(movement.amount);
        break;
      case "debito":
        wallet?.credito(movement.amount);
        break;
    }

    await this.TransactionService.runInTransaction(async () => {
      await this.IWalletsRepository.saveOrUpdate(wallet as Wallet);
      await this.MovementsRepository.deleteById(props.id);
    });
  }
}
