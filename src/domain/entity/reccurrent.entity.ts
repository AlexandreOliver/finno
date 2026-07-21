import { templateReccurrent } from "@/infrastructure/database/schemas/templateReccurrent";
import { createInsertSchema } from "drizzle-zod";
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
  Frequenciesreccurrent,
  StatusTransaction,
  TypesTransaction,
} from "../enums";

export const reccurrentSchema = createInsertSchema(templateReccurrent, {
  description: (schema) => schema.min(2, { error: "Descrição curta demais" }),
  interval: (schema) =>
    zod.preprocess(
      (val) => (typeof val === "string" ? Number.parseInt(val) : val),
      schema.gt(0, {
        error: "O Intervalo precisa ser maior do que 0",
      }),
    ),
  countPaid: (schema) => schema.default(0),
  installments: (schema) =>
    zod.preprocess(
      (val) => {
        if (typeof val !== "string") return val;

        return val.length > 0 ? Number.parseFloat(val) : 0;
      },
      schema.gte(0, {
        error: "As parcelas não podem ser menores que 0",
      }),
    ),
  amount: () =>
    zod
      .preprocess(
        (val) => {
          if (typeof val !== "string") return val;
          const valor = val.trim();
          if (valor.includes(",")) {
            return valor.replace(/\./g, "").replace(",", ".");
          }
          return Number.parseFloat(valor);
        },
        zod.number({ error: "O Valor precisa ser um Número" }),
      )
      .refine((value) => value > 0, {
        error: "O Valor Precisa ser maior do que 0",
      }),
  startDate: (schema) =>
    zod.preprocess((val) => {
      if (typeof val !== "string") return val;

      if (val.length === 10) {
        const dateData = new Date(val);

        //Converte o startDate para as 6 horas
        const dateReceived = new Date(
          dateData.getFullYear(),
          dateData.getMonth(),
          dateData.getDate() + 1,
          6,
        ); // +3

        return dateReceived;
      }

      return val;
    }, schema),
  endDate: (schema) =>
    zod
      .preprocess((val) => {
        if (typeof val !== "string") return val;

        if (val.length === 10) {
          const dateData = new Date(val);

          //Converte o endDate para as 18 horas
          const dateReceived = new Date(
            dateData.getFullYear(),
            dateData.getMonth(),
            dateData.getDate() + 1,
            18,
          ); // +3

          return dateReceived;
        }

        return val;
      }, schema.nullable().default(null))
      .refine(
        (data) => {
          if (data) return data.toDateString() !== new Date().toDateString();

          return true;
        },
        { error: "A data final nao pode ser hoje" },
      ),
  nextDueDate: (schema) => schema.nullable().default(null),
}).refine(
  (data) => {
    if (data.endDate) {
      return (
        new Date(data.startDate.toDateString()) <
        new Date(data.endDate.toDateString())
      );
    }
    return true;
  },
  {
    error: "A Data Final não pode ser anterior ou igual a Data Final",
    path: ["endDate"],
  },
);

export type reccurrentFromDbSelect = typeof templateReccurrent.$inferSelect;

export type reccurrentCreateProps = {
  type: string;
  status: string;
  description: string;
  amount: string;
  frequency: string;
  interval: number | string;
  installments?: number | string | null;
  countPaid?: number | null;
  categoryId: string;
  walletId: string;
  startDate: string | Date;
  endDate?: string | Date | null;
  nextDueDate?: Date | null;
};

export type reccurrentOutput = zod.output<typeof reccurrentSchema>;
export type reccurrentInput = zod.input<typeof reccurrentSchema>;

export type reccurrentProps = {
  id: string;
  type: TypesTransaction;
  status: StatusTransaction;
  description: string;
  amount: number;
  frequency: Frequenciesreccurrent;
  interval: number;
  categoryId: string;
  walletId: string;
  installments: number | null;
  countPaid: number;
  startDate: Date;
  endDate: Date | null;
  nextDueDate: Date | null;
};

export type returnCreateReccurrent =
  | { success: true; data: Reccurrent }
  | {
      success: false;
      errors: {
        id?: string[] | undefined;
        type?: string[] | undefined;
        status?: string[] | undefined;
        description?: string[] | undefined;
        amount?: string[] | undefined;
        frequency?: string[] | undefined;
        interval?: string[] | undefined;
        installments?: string[] | undefined;
        countPaid?: string[] | undefined;
        categoryId?: string[] | undefined;
        walletId?: string[] | undefined;
        startDate?: string[] | undefined;
        endDate?: string[] | undefined;
        nextDueDate?: string[] | undefined;
      };
    };

export class Reccurrent {
  readonly #startHour = 6;
  readonly #endHour = 18;

  private constructor(private readonly props: reccurrentProps) {}

  public static create(data: reccurrentCreateProps): returnCreateReccurrent {
    const fullData = {
      id: uuid7(),
      ...data,
    };

    const dataFormated = reccurrentSchema.safeParse(fullData);

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

  public static with(props: reccurrentFromDbSelect) {
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

  public toJson<K extends keyof reccurrentProps = never>(options?: {
    omit: K[];
  }): Omit<reccurrentProps, K> {
    const data = { ...this.props };

    if (!options || Object.keys(options.omit).length === 0) {
      return data as unknown as reccurrentProps;
    }

    options.omit.forEach((key) => {
      delete data[key];
    });

    return data as unknown as Omit<reccurrentProps, K>;
  }
}
