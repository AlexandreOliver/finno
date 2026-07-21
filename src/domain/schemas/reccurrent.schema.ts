import zod from "zod";
import { movementDomainBaseSchema } from "./movement.schema";
import { STATUS_TRANSACTION, FREQUENCIES_RECCURRENT } from "../enums";
import { isAfter, isBefore, isEqual, subDays } from "date-fns";

export const reccurrentDomainBaseSchema = movementDomainBaseSchema
  .omit({
    isRefunded: true,
    isReversal: true,
    reversalOfId: true,
    executedAt: true,
    dueDate: true,
    reccurrentId: true,
  })
  .safeExtend({
    status: zod.enum(STATUS_TRANSACTION, {
      error: (iss) => {
        if (iss.code === "invalid_value") {
          return { message: "Forneça apenas um desses valores: " + iss.values };
        }
      },
    }),
    frequency: zod.enum(FREQUENCIES_RECCURRENT, {
      error: (iss) => {
        if (iss.code === "invalid_value") {
          return { message: "Forneça apenas um desses valores: " + iss.values };
        }
      },
    }),
    interval: zod
      .number()
      .gt(0, {
        error: "O Intervalo precisa ser maior do que 0",
      })
      .nonoptional(),
    countPaid: zod
      .number()
      .gt(0, { error: "O countPaid não pode ser menor do que 0" })
      .nonoptional(),
    installments: zod
      .number()
      .gt(0, {
        error: "As parcelas precisam ser maiores do que 0",
      })
      .nullable()
      .nonoptional(),
    amount: zod.number({ error: "O Valor precisa ser um Número" }).gt(0, {
      error: "O Valor Precisa ser maior do que 0",
    }),
    startDate: zod
      .date()
      .min(subDays(new Date(), 1), {
        error: "A data inicial nao pode ser anterior a hoje",
      })
      .nonoptional(),
    endDate: zod
      .date()
      .min(new Date(), { error: "A data final nao pode ser hoje" })
      .nullable(),
    nextDueDate: zod.date().nullable(),
  });

export const reccurrentDomainSchema = reccurrentDomainBaseSchema
  .refine(
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
  )
  .refine(
    (rec) => {
      if (rec.nextDueDate) {
        return isAfter(rec.nextDueDate, rec.startDate);
      }

      return true;
    },
    {
      error: "O campo nextDueDate não pode ser menor que a data de inicio",
      path: ["nextDueDate"],
    },
  )
  .refine(
    (rec) => {
      if (rec.nextDueDate && rec.endDate) {
        return (
          isBefore(rec.nextDueDate, rec.endDate) ||
          isEqual(rec.nextDueDate, rec.endDate)
        );
      }

      return true;
    },
    {
      error: "O campo nextDueDate não pode ser maior que a data final",
      path: ["nextDueDate"],
    },
  );

export type ReccurrentProps = zod.infer<typeof reccurrentDomainBaseSchema>;

export type ReccurrentErrorsValidation =
  zod.core.$ZodFlattenedError<ReccurrentProps>["fieldErrors"];
