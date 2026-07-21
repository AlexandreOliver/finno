import { v7 as uuid7 } from "uuid";
import zod from "zod";
import { isEqual } from "lodash";

import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  set,
  isBefore,
} from "date-fns";
import { Movement } from "./movements.entity";

import {
  ReccurrentProps,
  ReccurrentErrorsValidation,
  reccurrentDomainSchema,
} from "../schemas/reccurrent.schema";

export type ReccurrentFromDb = Omit<ReccurrentProps, "amount"> & {
  amount: string;
};

export type ReccurrentCreateProps = Omit<ReccurrentProps, "id">;

export type returnCreateReccurrent =
  | { success: true; data: Reccurrent }
  | {
      success: false;
      errors: ReccurrentErrorsValidation;
    };

export class Reccurrent {
  readonly #startHour = 6;
  readonly #endHour = 18;

  private constructor(private readonly props: ReccurrentProps) {}

  public static create(data: ReccurrentCreateProps): returnCreateReccurrent {
    const fullData = {
      id: uuid7(),
      ...data,
    };

    const dataFormated = reccurrentDomainSchema.safeParse(fullData);

    if (!dataFormated.success) {
      return {
        success: false,
        errors: zod.flattenError(dataFormated.error).fieldErrors,
      };
    }

    // if (!dataFormated.data.nextDueDate) {
    //   const nextDue = this.calculateNextDueDate({
    //     interval: dataFormated.data.interval,
    //     frequency: dataFormated.data.frequency,
    //     startDate: dataFormated.data.startDate,
    //     endDate: dataFormated.data.endDate as Date,
    //     countPaid: dataFormated.data.countPaid,
    //   });

    //   dataFormated["data"]["nextDueDate"] = nextDue;
    // }

    // console.log("Saiu: ");
    // console.log(dataFormated.data);

    const reccurrent = new Reccurrent(dataFormated.data);

    if (!reccurrent.nextDueDate) reccurrent.calculateNextDueDate();

    return {
      success: true,
      data: reccurrent,
    };
  }

  public static with(props: ReccurrentFromDb) {
    return new Reccurrent({
      ...props,
      amount: Number.parseFloat(props.amount),
      installments: props.installments as number,
      startDate: props.startDate as Date,
    });
  }

  public calculateNextDueDate(): Date | null {
    let nextDate = set(this.startDate, {
      hours: 6,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });

    if (this.installments && (this.countPaid ?? 0) >= this.installments)
      return null;

    const salto = ((this.countPaid ?? 0) + 1) * this.interval;

    switch (this.frequency) {
      case "daily":
        nextDate = addDays(nextDate, salto);
        break;

      case "weekly":
        nextDate = addWeeks(nextDate, salto);
        break;

      case "monthly":
        nextDate = addMonths(nextDate, salto);
        break;

      case "yearly":
        nextDate = addYears(nextDate, salto);
        break;
    }

    if (this.endDate && !isBefore(nextDate, this.endDate)) return null;

    this.nextDueDate = nextDate;

    return nextDate;
  }

  public mutateCountPaid(nextMovement: Movement): boolean {
    if (!((this.installments ?? 0) > this.countPaid)) return false;

    const reccurrentProps = this.toJson({
      omit: [
        "countPaid",
        "status",
        "startDate",
        "endDate",
        "frequency",
        "id",
        "installments",
        "interval",
        "nextDueDate",
      ],
    });

    const jsonMovementExpect = {
      ...reccurrentProps,
      isReversal: false,
      isRefunded: false,
      reversalOfId: null,
      reccurrentId: this.id,
      executedAt: this.nextDueDate,
      dueDate: this.nextDueDate,
    };

    const nextMovementJson = nextMovement.toJson({ omit: ["id"] });

    if (!isEqual(jsonMovementExpect, nextMovementJson)) return false;

    this.countPaid += 1;

    return true;
  }

  //#region Getters
  public get id() {
    return this.props.id;
  }
  public get type() {
    return this.props.type;
  }

  public get status() {
    return this.props.status;
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

  public get installments() {
    return this.props.installments;
  }

  public get countPaid() {
    return this.props.countPaid;
  }

  public get interval() {
    return this.props.interval;
  }

  public get frequency() {
    return this.props.frequency;
  }

  public get startDate() {
    return this.props.startDate as Date;
  }

  public get endDate() {
    return this.props.endDate;
  }

  public get nextDueDate() {
    return this.props.nextDueDate;
  }

  public get startHour() {
    return this.#startHour;
  }
  //#endregion

  //#region Setters

  private set countPaid(newValue: number) {
    if (newValue < 0 || newValue === this.countPaid) return;

    this.props.countPaid = newValue;
  }

  private set nextDueDate(newDate: Date | null) {
    if (this.nextDueDate && newDate == this.nextDueDate) {
      return;
    }

    this.props.nextDueDate = newDate;
  }

  //#endregion

  public toJson<K extends keyof ReccurrentProps = never>(options?: {
    omit: K[];
  }): Omit<ReccurrentProps, K> {
    const data = { ...this.props };

    if (!options || Object.keys(options.omit).length === 0) {
      return data as unknown as ReccurrentProps;
    }

    options.omit.forEach((key) => {
      delete data[key];
    });

    return data as unknown as Omit<ReccurrentProps, K>;
  }
}
