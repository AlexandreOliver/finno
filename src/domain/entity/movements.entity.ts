import { movements } from "@/infrastructure/database/schemas/movements";
import { createInsertSchema } from "drizzle-zod";
import { v7 as uuid7 } from "uuid";
import zod from "zod";
import { TypesTransaction } from "../enums";

export type MovementsProps = {
  id: string;
  walletId: string;
  type: TypesTransaction;
  description: string;
  amount: number;
  isReversal: boolean;
  isRefunded: boolean;
  reversalOfId: string | null;
  categoryId: string;
  reccurrentId: string | null;
  executedAt: Date;
  dueDate: Date | null;
};

export type MovementsCreateProps = {
  walletId: string;
  type: string;
  description: string;
  amount: number;
  isRefunded: boolean;
  isReversal: boolean;
  reversalOfId: string | null;
  categoryId: string;
  reccurrentId: string | null;
  executedAt: Date;
  dueDate: Date | null;
};

export type MovementsFromDb = typeof movements.$inferSelect;

export type MovementErrorsValidation = {
  id?: string[] | undefined;
  type?: string[] | undefined;
  description?: string[] | undefined;
  amount?: string[] | undefined;
  categoryId?: string[] | undefined;
  walletId?: string[] | undefined;
  reccurrentId?: string[] | undefined;
  executedAt?: string[] | undefined;
  dueDate?: string[] | undefined;
};

export type resultCreateMovement =
  | {
      success: false;
      errors: {
        id?: string[] | undefined;
        type?: string[] | undefined;
        description?: string[] | undefined;
        amount?: string[] | undefined;
        categoryId?: string[] | undefined;
        walletId?: string[] | undefined;
        reccurrentId?: string[] | undefined;
        executedAt?: string[] | undefined;
        dueDate?: string[] | undefined;
      };
    }
  | { success: true; movement: Movement };

export const movementsSchema = createInsertSchema(movements, {
  amount: () =>
    zod.number().refine((value) => value > 0, {
      error: "O Valor Precisa ser maior do que 0",
    }),
  description: (schema) => schema.min(2, { error: "Descrição curta demais" }),
  walletId: () => zod.uuidv7({ error: "Forneça uma uuid na versao 7" }),
  reccurrentId: () => zod.uuidv7({ error: "Forneça uma uuid na versao 7" }),
  categoryId: () => zod.uuidv7({ error: "Forneça uma uuid na versao 7" }),
  executedAt: (schema) => schema.nonoptional().default(new Date()),
  dueDate: (schema) => schema.nonoptional(),
  isReversal: (schema) => schema.nonoptional(),
  isRefunded: (schema) => schema.nonoptional(),
  reversalOfId: () =>
    zod.uuidv7({ error: "Forneça uma uuid na versao 7" }).nonoptional(),
})
  .refine((mov) => !(mov.isRefunded && mov.isReversal), {
    error:
      "A movimentação não pode ter os campos isReversal e isRefunded como true",
    path: ["isReversal"],
  })
  .refine(
    (mov) =>
      (!mov.isReversal && !mov.reversalOfId) ||
      (mov.isReversal && mov.reversalOfId),
    {
      error:
        "Se a movimentação é um estorno o campo reversalOfId precisa estar preenchido.",
      path: ["reversalOfId"],
    },
  );

export class Movement {
  private constructor(private readonly props: MovementsProps) {}

  public static create(data: MovementsCreateProps): resultCreateMovement {
    const dataValid = movementsSchema.safeParse({
      id: uuid7(),
      ...data,
    });

    if (!dataValid.success) {
      return {
        errors: zod.flattenError(dataValid.error).fieldErrors,
        success: false,
      };
    }

    const movement = new Movement(dataValid.data);

    return {
      success: true,
      movement: movement,
    };
  }

  public static with(props: MovementsFromDb) {
    return new Movement({
      ...props,
      amount: Number.parseFloat(props.amount),
      executedAt: props.executedAt as Date,
    });
  }

  //#region Getters
  public get id() {
    return this.props.id;
  }
  public get type() {
    return this.props.type;
  }

  public get description() {
    return this.props.description;
  }

  public get amount() {
    return this.props.amount;
  }

  public get isRefunded() {
    return this.props.isRefunded;
  }

  public get isReversal() {
    return this.props.isReversal;
  }

  public get reversalOfId() {
    return this.props.reversalOfId;
  }

  public get walletId() {
    return this.props.walletId;
  }

  public get categoryId() {
    return this.props.categoryId;
  }

  public get reccurrentId() {
    return this.props.reccurrentId;
  }

  public get executedAt() {
    return this.props.executedAt;
  }

  public get dueDate() {
    return this.props.dueDate;
  }
  //#endregion

  //#region Setters
  public set isRefunded(newSate: boolean) {
    this.props.isRefunded = newSate;
  }

  //#endregion

  public toJson<K extends keyof MovementsProps = never>(options?: {
    omit: readonly K[];
  }): Omit<MovementsProps, K> {
    const data = Object.assign({}, this.props);

    if (!options || Object.keys(options.omit).length === 0) {
      return data;
    }

    if (options?.omit) {
      options.omit.forEach((key) => {
        delete data[key];
      });
    }

    return data as Omit<MovementsProps, K>;
  }
}
