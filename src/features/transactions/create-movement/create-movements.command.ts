import { z } from "zod";

export const CreateMovementCommandSchema = z.object({
  description: z
    .string({ error: "Forneça uma desrição" })
    .min(2, { error: "Descrição muito curta" }),
  type: z.preprocess(
    (val) => (typeof val === "string" ? val.trim().toLowerCase() : val),
    z.enum(["debito", "credito"], {
      error: (iss) => {
        if (iss.code === "invalid_value") {
          return { message: "Forneça apenas um desses valores: " + iss.values };
        }
      },
    }),
  ),
  amount: z
    .string({ error: "Forneça um valor valido" })
    .min(1, { error: "O valor precisa ser fornecido" })
    .transform((val) => {
      const valor = val.trim();

      if (valor.includes(",")) valor.replace(/\./g, "").replace(",", ".");

      return Number.parseFloat(valor);
    }),
  categoryId: z.string().min(1, { error: "Forneça uma uuid" }),
  walletId: z.string().min(1, { error: "Forneça uma uuid" }),
  reccurentId: z.string().nullable().default(null),
  executedAt: z.iso
    .date({ error: "Forneça uma data no formato YYYY-MM-DD" })
    .optional()
    .transform((val) => (val ? new Date(val) : new Date())),
  dueDate: z.iso
    .date({ error: "Forneça uma data no formato YYYY-MM-DD" })
    .optional()
    .transform((val) => {
      return val ? new Date(val) : null;
    }),
});

export type CreateMovementCommand = z.input<typeof CreateMovementCommandSchema>;
