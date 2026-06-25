import "server-only";

import zod from "zod";

import db from "@/infra/database";
import { templateReccurent } from "@/infra/database/schemas/templateReccurent";

import { createInsertSchema } from "drizzle-zod";

export const reccurentSchema = createInsertSchema(templateReccurent, {
  description: (schema) => schema.min(2, { error: "Descrição curta demais" }),
  interval: (schema) =>
    zod.preprocess(
      (val) => {
        if (typeof val !== "string") return val;

        if (val.length === 0) return 0;

        return Number.parseInt(val);
      },
      schema.gt(0, {
        error: "O Intervalo precisa ser maior do que 0",
      }),
    ),
  installments: (schema) =>
    zod.preprocess(
      (val) => {
        if (typeof val !== "string") return val;

        if (val.length === 0) return 0;

        return Number.parseInt(val);
      },
      schema.gte(0, {
        error: "As parcelas precisam ser maior do que 0",
      }),
    ),
  amount: (schema) =>
    zod
      .preprocess((val) => {
        if (typeof val !== "string") return val;
        const valor = val.trim();
        if (valor.includes(",")) {
          return valor.replace(/\./g, "").replace(",", ".");
        }
        return valor;
      }, schema)
      .refine((value) => !Number.isNaN(Number.parseFloat(value)), {
        error: "O Valor precisa ser um Número",
        abort: true,
      })
      .refine((value) => Number.parseFloat(value) > 0, {
        error: "O Valor Precisa ser maior do que 0",
      }),
  start_date: (schema) =>
    zod.preprocess((val) => {
      if (typeof val !== "string") return val;
      const dateReceived = new Date(val); // +3

      return dateReceived;
    }, schema),
  end_date: (schema) =>
    zod.preprocess(
      (val) => {
        if (typeof val !== "string") return val;

        const dateReceived = new Date(val);

        return dateReceived;
      },
      schema.refine(
        (data) => {
          return data.toDateString() !== new Date().toDateString();
        },
        { error: "A data final nao pode ser hoje" },
      ),
    ),
}).refine(
  (data) => {
    if (data.end_date) {
      return (
        new Date(data.start_date?.toDateString() ?? new Date().toDateString()) <
        new Date(data.end_date.toDateString())
      );
    }
    return true;
  },
  {
    error: "A Data Final não pode ser anterior ou igual a Data Final",
    path: ["end_date"],
  },
);

type reccurentCreate = typeof templateReccurent.$inferInsert;

const create = async (objReccurent: reccurentCreate) => {
  const result = await db
    .insert(templateReccurent)
    .values(objReccurent)
    .returning({ id: templateReccurent.id });

  return result[0];
};

const reccurentModel = {
  create,
};

export default reccurentModel;
