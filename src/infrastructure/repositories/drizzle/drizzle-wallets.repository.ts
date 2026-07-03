import { IWalletsGateway } from "@/domain/repositories/wallets.gateway";
import { Wallet } from "@/domain/entity/wallets.entity";
import { wallets } from "@/infrastructure/database/schemas/wallets";
import db from "@/infrastructure/database";
import { eq, and, SQL, sql } from "drizzle-orm";
import { cache } from "react";

export class WalletsRepositoryDrizzle implements IWalletsGateway {
  private constructor(private readonly dbInstance: typeof db) {}

  public static create(dbInstance: typeof db) {
    return new WalletsRepositoryDrizzle(dbInstance);
  }

  public saveOrUpdate: IWalletsGateway["saveOrUpdate"] = cache(
    async (props) => {
      const aWallet = {
        ...props.toJson(),
        balance: String(props.balance),
      };

      const result = await this.dbInstance
        .insert(wallets)
        .values(aWallet)
        .onConflictDoUpdate({
          target: wallets.id,
          set: {
            labelName: sql`excluded.label_name`,
            balance: sql`excluded.balance`,
            updatedAt: sql`excluded.updated_at`,
          },
        })
        .returning();

      return !!result[0]?.id;
    },
  );

  public list: IWalletsGateway["list"] = cache(async (ownerId?: string) => {
    const filters: SQL[] = [];

    if (ownerId) {
      filters.push(eq(wallets.ownerId, ownerId));
    }

    const walletsDb = await this.dbInstance
      .select()
      .from(wallets)
      .where(and(...filters));

    return walletsDb.map((w) => Wallet.with(w));
  });

  public findById: IWalletsGateway["findById"] = cache(async (id: string) => {
    const result = await this.dbInstance
      .select()
      .from(wallets)
      .where(eq(wallets.id, id));

    if (!result || result.length === 0) return null;

    return Wallet.with(result[0]);
  });

  public deleteById: IWalletsGateway["deleteById"] = cache(
    async (id: string) => {
      const result = await this.dbInstance
        .delete(wallets)
        .where(eq(wallets.id, id))
        .returning();

      return result.length > 0;
    },
  );
}
