import { IMovementGateway } from "@/domain/repositories/movements.gateway";
import { IWalletsGateway } from "@/domain/repositories/wallets.gateway";
import {
  DeleteMovementCommand,
  DeleteMovementHandlerOutput,
} from "./delete-movement.command";
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

  public async execute(
    props: DeleteMovementCommand,
  ): Promise<DeleteMovementHandlerOutput> {
    const movement = await this.MovementsRepository.getById(props.id);

    if (!movement) {
      return {
        success: false,
        message: "Transação não existe",
      };
    }

    if (movement.isRefunded) {
      return {
        success: false,
        message: "Ja existe um estorno para essa movimentação",
      };
    }

    const wallet = await this.IWalletsRepository.findById(movement.walletId);

    if (!wallet) {
      return {
        success: false,
        message: "Carteira não existe",
      };
    }

    const estorno = wallet.gerarEstorno(movement);

    if (!estorno.success) {
      return {
        success: false,
        message: estorno.message,
      };
    }

    movement.isRefunded = true;

    await this.TransactionService.runInTransaction(async () => {
      await this.IWalletsRepository.saveOrUpdate(wallet);
      await this.MovementsRepository.saveOrUpdate(estorno.data);
      await this.MovementsRepository.saveOrUpdate(movement);
    });

    return {
      success: true,
      message: "O estorno foi gerado com sucesso",
    };
  }
}
