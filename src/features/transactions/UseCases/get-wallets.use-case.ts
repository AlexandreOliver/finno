import { WalletsProps } from "@/domain/wallets/wallets.entity";
import { IWalletsGateway } from "@/domain/wallets/wallets.gateway";

export type inputDTO = { ownerId: string };

export type outputDTO = WalletsProps[];

export class GetWalletsUseCase {
  private constructor(private readonly walletsRepository: IWalletsGateway) {}

  public static create(walletsRepository: IWalletsGateway) {
    return new GetWalletsUseCase(walletsRepository);
  }

  public async execute({ ownerId }: inputDTO): Promise<outputDTO> {
    const wallet = await this.walletsRepository.list(ownerId);

    return wallet.map((w) => w.toJson());
  }
}
