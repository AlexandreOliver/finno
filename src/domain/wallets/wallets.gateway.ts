import { Wallet } from "./wallets.entity";

export interface IWalletsGateway {
  save(wallet: Wallet): Promise<boolean>;
  list(ownerId?: string): Promise<Wallet[]>;
  findById(id: string): Promise<Wallet | null>;
  deleteById(id: string): Promise<boolean>;
}
