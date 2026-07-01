import { movements } from "@/infrastructure/database/schemas/movements";
import { createInsertSchema } from "drizzle-zod";
import { v7 as uuid7 } from "uuid";
import zod from "zod";

export type MovementsProps = {
  id: string;
  walletId: string;
  type: "debito" | "credito" | "investimento";
  description: string;
  amount: number;
  categoryId: string;
  reccurentId: string | null;
  executedAt: Date;
  dueDate: Date | null;
};

export type MovementsCreateProps = {
  walletId: string;
  type: string;
  description: string;
  amount: number;
  categoryId: string;
  reccurentId: string | null;
  executedAt: Date;
  dueDate: Date | null;
};

export type MovementsFromDb = typeof movements.$inferSelect;

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
        reccurentId?: string[] | undefined;
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
  walletId: () => zod.uuidv7({ error: "Forneça uma uuid a versao 7" }),
  reccurentId: () => zod.uuidv7({ error: "Forneça uma uuid a versao 7" }),
  categoryId: () => zod.uuidv7({ error: "Forneça uma uuid a versao 7" }),
  executedAt: (schema) => schema.nonoptional().default(new Date()),
  dueDate: (schema) => schema.nonoptional(),
});

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
    return this.props.id as string;
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

  public get walletId() {
    return this.props.walletId;
  }

  public get categoryId() {
    return this.props.categoryId;
  }

  public get reccurentId() {
    return this.props.reccurentId;
  }

  public get executedAt() {
    return this.props.executedAt as Date;
  }

  public get dueDate() {
    return this.props.dueDate;
  }
  //#endregion

  public toJson<K extends keyof MovementsProps = never>(options?: {
    omit: readonly K[];
  }): Omit<MovementsProps, K> {
    const data = this.props;

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
