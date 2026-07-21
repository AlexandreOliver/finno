import zod from "zod";
import { TYPES_TRANSACTION } from "../enums";
import { subDays } from "date-fns";

export const movementDomainBaseSchema = zod.object({
  id: zod.uuidv7({ error: "Forneça uma uuid na versão 7" }),
  type: zod.enum(TYPES_TRANSACTION, {
    error: (iss) => {
      if (iss.code === "invalid_value") {
        return { message: "Forneça apenas um desses valores: " + iss.values };
      }
    },
  }),
  description: zod
    .string({ error: "Forneça uma desrição" })
    .min(2, { error: "Descrição curta demais" }),
  amount: zod.number({ error: "Forneça um valor valido" }).gt(0, {
    error: "O Valor Precisa ser maior do que 0",
  }),
  walletId: zod.uuidv7({ error: "Forneça uma uuid na versão 7" }),
  categoryId: zod.uuidv7({ error: "Forneça uma uuid na versão 7" }),
  reccurrentId: zod
    .uuidv7({ error: "Forneça uma uuid na versão 7" })
    .nullable(),
  isRefunded: zod.boolean(),
  isReversal: zod.boolean(),
  reversalOfId: zod
    .uuidv7({ error: "Forneça uma uuid na versão 7" })
    .nullable(),
  executedAt: zod.date().min(subDays(new Date(), 1), {
    error: "A data de execução não pode ser hoje",
  }),
  dueDate: zod.date().nullable(),
});

export const movementDomainSchema = movementDomainBaseSchema
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

export type MovementProps = zod.infer<typeof movementDomainBaseSchema>;

export type MovementErrorsValidation =
  zod.core.$ZodFlattenedError<MovementProps>["fieldErrors"];
