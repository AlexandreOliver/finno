import zod from "zod";
import { v7 as uuid7 } from "uuid";
import { movementDomainBaseSchema } from "./movement.schema";
import { FREQUENCIES_RECCURRENT, StatusTransaction } from "../enums";
import { set, subDays } from "date-fns";
import { Reccurrent } from "../entity/reccurrent.entity";

export const reccurrentDomainSchema = movementDomainBaseSchema
  .omit({
    isRefunded: true,
    isReversal: true,
    reversalOfId: true,
    executedAt: true,
    dueDate: true,
    reccurrentId: true,
    id: true,
  })
  .safeExtend({
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
      .nonoptional()
      .transform((val) =>
        set(val, {
          hours: Reccurrent.startHour,
          minutes: 0,
          seconds: 0,
          milliseconds: 0,
        }),
      ),
    payOnStartDate: zod.boolean().nonoptional(),
  })
  .transform((base) => {
    return {
      ...base,
      id: uuid7(),
      countPaid: 0,
      status: "pausado" as StatusTransaction,
      endDate: null as Date | null,
      nextDueDate: null as Date | null,
    };
  });

// .refine(
//   (data) => {
//     if (data.endDate) {
//       return (
//         new Date(data.startDate.toDateString()) <
//         new Date(data.endDate.toDateString())
//       );
//     }
//     return true;
//   },
//   {
//     error: "A Data Final não pode ser anterior ou igual a Data Final",
//     path: ["endDate"],
//   },
// )
// .refine(
//   (rec) => {
//     if (rec.nextDueDate) {
//       return isAfter(rec.nextDueDate, rec.startDate);
//     }

//     return true;
//   },
//   {
//     error: "O campo nextDueDate não pode ser menor que a data de inicio",
//     path: ["nextDueDate"],
//   },
// )
// .refine(
//   (rec) => {
//     if (rec.nextDueDate && rec.endDate) {
//       return (
//         isBefore(rec.nextDueDate, rec.endDate) ||
//         isEqual(rec.nextDueDate, rec.endDate)
//       );
//     }

//     return true;
//   },
//   {
//     error: "O campo nextDueDate não pode ser maior que a data final",
//     path: ["nextDueDate"],
//   },
// )

export type ReccurrentProps = zod.infer<typeof reccurrentDomainSchema>;
export type CreateReccurrentProps = zod.input<typeof reccurrentDomainSchema>;
export type ReccurrentPropsOutput = zod.output<typeof reccurrentDomainSchema>;

export type ReccurrentErrorsValidation =
  zod.core.$ZodFlattenedError<CreateReccurrentProps>["fieldErrors"];
