import { wallets } from "@/infra/database/schemas/wallets";
import { v7 as uuidV7 } from "uuid";

export type WalletsFromDb = typeof wallets.$inferSelect;

export type WalletsProps = {
  id: string;
  labelName: string;
  ownerId: string | null;
  balance: string;
  updatedAt: Date;
  createdAt: Date;
};

export class Wallet {
  private constructor(private readonly props: WalletsProps) {}

  public static create(props: Omit<WalletsProps, "id" | "balance">) {
    const aWallet = {
      id: uuidV7(),
      balance: "0",
      ...props,
    };

    return new Wallet(aWallet);
  }

  public static with(props: WalletsFromDb) {
    return new Wallet(props);
  }

  //#region Getters
  public get id() {
    return this.props.id as string;
  }

  public get labelName() {
    return this.props.labelName;
  }

  public get ownerId() {
    return this.props.ownerId;
  }

  public get balance() {
    return Number.parseFloat(this.props.balance as unknown as string);
  }

  public get updatedAt() {
    return this.props.updatedAt as Date;
  }

  public get createdAt() {
    return this.props.createdAt as Date;
  }
  //#endregion

  public toJson<K extends keyof WalletsProps = never>(options?: {
    omit: readonly K[];
  }): Omit<WalletsProps, K> {
    const data = this.props;

    if (!options || Object.keys(options.omit).length === 0) {
      return data;
    }

    if (options?.omit) {
      options.omit.forEach((key) => {
        delete data[key];
      });
    }

    return data as Omit<WalletsProps, K>;
  }
}
