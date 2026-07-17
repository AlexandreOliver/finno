import { wallets } from "@/infrastructure/database/schemas/wallets";
import { v7 as uuidV7 } from "uuid";
import { z } from "zod";
import {
  Movement,
  MovementErrorsValidation,
  MovementsCreateProps,
} from "./movements.entity";

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

export type FunctionNewMovement = (props: {
  amount: number;
  movConfig: Omit<
    MovementsCreateProps,
    | "walletId"
    | "amount"
    | "reccurentId"
    | "type"
    | "isReversal"
    | "reversalOfId"
  >;
}) =>
  | { success: true; data: Movement }
  | { success: false; message: string; errors?: MovementErrorsValidation };

export type WalletsProps = {
  id: string;
  labelName: string;
  ownerId: string;
  balance: number;
  updatedAt: Date;
  createdAt: Date;
};

export type resultCreateWallet =
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
  ): resultCreateWallet {
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
    return this.props.balance;
  }

  public get updatedAt() {
    return this.props.updatedAt as Date;
  }

  public get createdAt() {
    return this.props.createdAt as Date;
  }
  //#endregion

  public debito: FunctionNewMovement = (props) => {
    const { amount, movConfig } = props;

    const movementDTO = {
      ...movConfig,
      amount,
      type: "debito",
      walletId: this.id,
      reccurentId: null,
      isReversal: false,
      reversalOfId: null,
    };

    const mov = Movement.create(movementDTO);

    if (!mov.success) {
      return {
        success: false,
        message: "Há campos com erros",
        errors: mov.errors,
      };
    }

    this.props.balance -= mov.movement.amount;
    this.props.updatedAt = new Date();

    return {
      success: true,
      data: mov.movement,
    };
  };

  public credito: FunctionNewMovement = (props) => {
    const { amount, movConfig } = props;

    const movementDTO = {
      ...movConfig,
      amount,
      type: "credito",
      walletId: this.id,
      reccurentId: null,
      isReversal: false,
      reversalOfId: null,
    };

    const mov = Movement.create(movementDTO);

    if (!mov.success) {
      return {
        success: false,
        message: "Há campos com erros",
        errors: mov.errors,
      };
    }

    this.props.balance += mov.movement.amount;
    this.props.updatedAt = new Date();

    return {
      success: true,
      data: mov.movement,
    };
  };

  public gerarEstorno(
    source: Movement,
  ): { success: true; data: Movement } | { success: false; message: string } {
    const sourceMovmentDTO = {
      ...source.toJson({ omit: ["id"] }),
      description: `Estorno - ${source.description}`,
      executedAt: new Date(),
      isReversal: true,
    };

    let movement: Movement;

    if (sourceMovmentDTO.type === "credito") {
      const result = Movement.create({
        ...sourceMovmentDTO,
        type: "debito",
        reversalOfId: source.id,
      });

      if (!result.success) {
        return {
          success: false,
          message: "Falhou ao criar estorno do tipo debito",
        };
      }

      movement = result.movement;

      this.props.balance -= movement.amount;
      this.props.updatedAt = new Date();
    } else {
      const result = Movement.create({
        ...sourceMovmentDTO,
        type: "credito",
        reversalOfId: source.id,
      });

      if (!result.success) {
        return {
          success: false,
          message: "Falhou ao criar estorno do tipo credito",
        };
      }

      movement = result.movement;

      this.props.balance += movement.amount;
      this.props.updatedAt = new Date();
    }

    return {
      success: true,
      data: movement,
    };
  }

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
