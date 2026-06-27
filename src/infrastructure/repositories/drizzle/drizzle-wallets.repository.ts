import { IWalletsGateway } from "@/domain/repositories/wallets.gateway";
import { Wallet } from "@/domain/entity/wallets.entity";
import { wallets } from "@/infrastructure/database/schemas/wallets";
import db from "@/infrastructure/database";
import { eq, and, SQL } from "drizzle-orm";

export class WalletsRepositoryDrizzle implements IWalletsGateway {
  private constructor(private readonly dbInstance: typeof db) {}

  public static create(dbInstance: typeof db) {
    return new WalletsRepositoryDrizzle(dbInstance);
  }

  public save: IWalletsGateway["save"] = async (props) => {
    const result = await this.dbInstance
      .insert(wallets)
      .values({
        ...props.toJson({ omit: ["balance"] }),
        balance: props.balance.toString(),
      })
      .returning();

    return !!result[0]?.id;
  };

  public async list(ownerId?: string) {
    const filters: SQL[] = [];

    if (ownerId) {
      filters.push(eq(wallets.ownerId, ownerId));
    }

    const walletsDb = await this.dbInstance
      .select()
      .from(wallets)
      .where(and(...filters));

    return walletsDb.map((w) => Wallet.with(w));
  }

  public async findById(id: string) {
    const result = await this.dbInstance
      .select()
      .from(wallets)
      .where(eq(wallets.id, id));

    if (!result || result.length === 0) return null;

    return Wallet.with(result[0]);
  }

  public async deleteById(id: string) {
    const result = await this.dbInstance
      .delete(wallets)
      .where(eq(wallets.id, id))
      .returning();

    return result.length > 0;
  }
}
