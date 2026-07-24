import zod from "zod";
import { isEqual } from "lodash";

import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  set,
  setHours,
  isBefore,
} from "date-fns";
import { Movement } from "./movements.entity";

import {
  ReccurrentProps,
  ReccurrentErrorsValidation,
  reccurrentDomainSchema,
  CreateReccurrentProps,
} from "../schemas/reccurrent.schema";
import { StatusTransaction } from "../enums";

export type ReccurrentFromDb = Omit<ReccurrentProps, "amount"> & {
  amount: string;
};

export type returnCreateReccurrent =
  | { success: true; data: Reccurrent }
  | {
      success: false;
      errors: ReccurrentErrorsValidation;
    };

export class Reccurrent {
  static readonly startHour = 6;
  readonly #endHour = 18;

  private constructor(private readonly props: ReccurrentProps) {}

  public static create(data: CreateReccurrentProps): returnCreateReccurrent {
    const dataFormated = reccurrentDomainSchema.safeParse(data);

    if (!dataFormated.success) {
      return {
        success: false,
        errors: zod.flattenError(dataFormated.error).fieldErrors,
      };
    }

    const reccurrent = new Reccurrent(dataFormated.data);

    reccurrent.setup();

    return {
      success: true,
      data: reccurrent,
    };
  }

  public static with(props: ReccurrentFromDb) {
    return new Reccurrent({
      ...props,
      amount: Number.parseFloat(props.amount),
      installments: props.installments,
      startDate: props.startDate,
    });
  }

  public setup() {
    this.statusValidate();
    this.inferDateEnd();
    this.calculateNextDueDate();
  }

  public inferDateEnd(): Date | null {
    if (this.endDate || !this.installments) return null;

    const baseDate = set(this.startDate, {
      hours: Reccurrent.startHour,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });

    let offset = 0;
    if (this.payOnStartDate) offset = 1;

    const saltoToEnd = (this.installments - offset) * this.interval;

    let endDate: Date;
    switch (this.frequency) {
      case "daily":
        endDate = addDays(baseDate, saltoToEnd);
        break;

      case "weekly":
        endDate = addWeeks(baseDate, saltoToEnd);
        break;

      case "monthly":
        endDate = addMonths(baseDate, saltoToEnd);
        break;

      case "yearly":
        endDate = addYears(baseDate, saltoToEnd);
        break;
    }

    this.endDate = endDate;

    return endDate;
  }

  public statusValidate() {
    if (isBefore(new Date().setHours(Reccurrent.startHour), this.startDate)) {
      this.status = "esperando";
      return;
    } else if (
      (this.installments && this.installments > this.countPaid) ||
      !this.installments
    ) {
      this.status = "ativo";
      return;
    } else {
      this.status = "terminado";
      this.terminate();
      return;
    }
  }

  public calculateNextDueDate(): Date | null {
    this.statusValidate();

    if (this.status != "ativo" && this.status != "esperando") return null;

    let nextDate = set(this.startDate, {
      hours: Reccurrent.startHour,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });

    let salto;
    if (this.payOnStartDate) {
      salto = this.countPaid * this.interval;
    } else {
      salto = (this.countPaid + 1) * this.interval;
    }

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

    this.nextDueDate = nextDate;

    return nextDate;
  }

  public mutateCountPaid(nextMovement: Movement): boolean {
    this.statusValidate();
    if (this.status != "ativo") return false;

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
        "payOnStartDate",
      ],
    });

    const jsonMovementExpect = {
      ...reccurrentProps,
      isReversal: false,
      isRefunded: false,
      reversalOfId: null,
      reccurrentId: this.id,
    };

    const nextMovementJson = nextMovement.toJson({
      omit: ["id", "dueDate", "executedAt"],
    });

    if (!isEqual(jsonMovementExpect, nextMovementJson)) return false;
    if (isBefore(nextMovement.executedAt, this.startDate)) return false;

    this.countPaid += 1;

    this.calculateNextDueDate();

    return true;
  }

  public isDued(): boolean {
    const hoje = set(new Date(), {
      hours: Reccurrent.startHour,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });

    return isEqual(this.nextDueDate, hoje) && this.status === "ativo";
  }

  private terminate() {
    this.nextDueDate = null;
    this.endDate = setHours(new Date(), Reccurrent.startHour);
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

  public get payOnStartDate() {
    return this.props.payOnStartDate;
  }

  public get interval() {
    return this.props.interval;
  }

  public get frequency() {
    return this.props.frequency;
  }

  public get startDate() {
    return this.props.startDate;
  }

  public get endDate(): Date | null {
    return this.props.endDate;
  }

  public get nextDueDate() {
    return this.props.nextDueDate;
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

  private set status(newState: StatusTransaction) {
    this.props.status = newState;
  }

  private set endDate(newDate: Date) {
    this.props.endDate = newDate;
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
