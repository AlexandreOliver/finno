import { WalletsProps } from "@/domain/entity/wallets.entity";
import { IWalletsGateway } from "@/domain/repositories/wallets.gateway";

export class GetWalletsHandler {
  private constructor(private readonly WalletsRepository: IWalletsGateway) {}

  public static create(WalletsRepository: IWalletsGateway) {
    return new GetWalletsHandler(WalletsRepository);
  }

  public async execute(props: { ownerId: string }): Promise<WalletsProps[]> {
    const walletList = await this.WalletsRepository.list(props.ownerId);

    const aWallets = walletList.map((w) => w.toJson());

    return aWallets;
  }
}
