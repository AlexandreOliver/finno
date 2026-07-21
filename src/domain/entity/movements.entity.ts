import { v7 as uuid7 } from "uuid";
import zod from "zod";

import {
  MovementProps,
  MovementErrorsValidation,
  movementDomainSchema,
} from "../schemas/movement.schema";

export type MovementCreateProps = Omit<MovementProps, "id">;

export type MovementsFromDb = Omit<MovementProps, "amount"> & {
  amount: string;
};

export type resultCreateMovement =
  | {
      success: false;
      errors: MovementErrorsValidation;
    }
  | { success: true; movement: Movement };

export class Movement {
  private constructor(private readonly props: MovementProps) {}

  public static create(data: MovementCreateProps): resultCreateMovement {
    const dataValid = movementDomainSchema.safeParse({
      id: uuid7(),
      ...data,
    });

    if (!dataValid.success) {
      console.log(zod.flattenError(dataValid.error).fieldErrors);
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

  public toJson<K extends keyof MovementProps = never>(options?: {
    omit: readonly K[];
  }): Omit<MovementProps, K> {
    const data = Object.assign({}, this.props);

    if (!options || Object.keys(options.omit).length === 0) {
      return data;
    }

    if (options?.omit) {
      options.omit.forEach((key) => {
        delete data[key];
      });
    }

    return data as Omit<MovementProps, K>;
  }
}
