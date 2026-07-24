import { Reccurrent } from "@/domain/entity/reccurrent.entity";
import { IReccurrentGateway } from "@/domain/repositories/reccurrent.gateway";
import { CreateReccurentCommand } from "./create-reccurrent.command";
import { IWalletsGateway } from "@/domain/repositories/wallets.gateway";
import { IMovementGateway } from "@/domain/repositories/movements.gateway";
import { IUnitOfWork } from "@/infrastructure/repositories/unitOfWork.interface";

export type CreateReccurentHandlerOutput =
  | {
      message: string;
      success: false;
    }
  | { success: true; reccurrent: { id: string } };

export class CreateReccurrentHandler {
  private constructor(
    private readonly reccurrentRepository: IReccurrentGateway,
    private readonly walletRepository: IWalletsGateway,
    private readonly MovementRepository: IMovementGateway,
    private readonly runInTrasaction: IUnitOfWork,
  ) {}

  public static create(
    reccurrentRepository: IReccurrentGateway,
    walletRepository: IWalletsGateway,
    MovementRepository: IMovementGateway,
    runInTrasaction: IUnitOfWork,
  ) {
    return new CreateReccurrentHandler(
      reccurrentRepository,
      walletRepository,
      MovementRepository,
      runInTrasaction,
    );
  }

  public async execute(
    input: CreateReccurentCommand,
  ): Promise<CreateReccurentHandlerOutput> {
    const resultCreate = Reccurrent.create(input);

    if (!resultCreate.success) {
      console.log(resultCreate.errors);
      return {
        success: false,
        message: "Erro ao gerar a recorrência apartir dos dados enviados",
      };
    }

    const { data: newReccurrent } = resultCreate;

    if (input.payOnStartDate && newReccurrent.isDued()) {
      const walletOwnReccurrent = await this.walletRepository.findById(
        newReccurrent.walletId,
      );

      if (!walletOwnReccurrent) {
        return {
          success: false,
          message: "A wallet associada a recorrência não existe",
        };
      }

      const resultNewMovement =
        walletOwnReccurrent.generateMovementFromReccurrent(newReccurrent);

      if (!resultNewMovement.success) {
        return {
          success: false,
          message: resultNewMovement.message,
        };
      }

      const newMovement = resultNewMovement.data;

      newReccurrent.mutateCountPaid(newMovement);

      try {
        await this.runInTrasaction.runInTransaction(async () => {
          await this.reccurrentRepository.save(newReccurrent);
          await this.MovementRepository.saveOrUpdate(newMovement);
          await this.walletRepository.saveOrUpdate(walletOwnReccurrent);
        });

        return {
          success: true,
          reccurrent: { id: newReccurrent.id },
        };
      } catch (err) {
        console.error(err);
        return {
          success: false,
          message: "Um erro aconteceu ao tentar salvar a recorrência.",
        };
      }
    }

    // console.log(newReccurrent.toJson());

    try {
      const result = await this.reccurrentRepository.save(newReccurrent);

      return { success: true, reccurrent: result };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: "Um erro aconteceu ao tentar salvar a recorrência.",
      };
    }
  }
}
