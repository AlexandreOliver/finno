import { wallets } from "@/infra/database/schemas/wallets";
import { v7 as uuidV7 } from "uuid";
import { z } from "zod";

export type WalletsFromDb = typeof wallets.$inferSelect;
export type WalletsFromD = typeof wallets.$inferInsert;

const walletSchema = z.object({
  id: z.uuidv7().optional(),
  labelName: z
    .string()
    .max(20, { error: "O nome da conta nao pode ultrapassar 20 caracteres" })
    .optional()
    .default("Principal"),
  ownerId: z.uuidv7({ error: "Forneça um uuid valido" }),
  createdAt: z.date().optional().default(new Date()),
  updatedAt: z.date().optional().default(new Date()),
});

export type WalletsProps = {
  id: string;
  labelName: string;
  ownerId: string;
  balance: number;
  updatedAt: Date;
  createdAt: Date;
};

type resultCreate =
  | {
      success: false;
      errors: {
        labelName?: string[] | undefined;
        ownerId?: string[] | undefined;
      };
    }
  | {
      success: true;
      data: Wallet;
    };
export class Wallet {
  private constructor(private readonly props: WalletsProps) {}

  public static create(
    props: Omit<WalletsProps, "id" | "balance" | "createdAt" | "updatedAt">,
  ): resultCreate {
    const dataValid = walletSchema.safeParse(props);

    if (!dataValid.success) {
      return {
        success: false,
        errors: z.flattenError(dataValid.error).fieldErrors,
      };
    }

    const aWallet = {
      id: uuidV7(),
      balance: 0,
      ...dataValid.data,
    };

    const walletInst = new Wallet(aWallet);

    return {
      success: true,
      data: walletInst,
    };
  }

  public static with(props: WalletsFromDb) {
    return new Wallet({ ...props, balance: Number.parseFloat(props.balance) });
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
