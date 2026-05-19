import "server-only";
import db from "@/infra/database";
import { movements } from "@/infra/database/schemas/movements";
import { createInsertSchema } from "drizzle-zod";
import zod from "zod";

export const movementsSchema = createInsertSchema(movements, {
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
      }),
  description: (schema) => schema.min(2, { error: "Descrição curta demais" }),
});

type TypeMovementsCreate = Omit<
  zod.infer<typeof movementsSchema>,
  "id" | "dueDate"
>;

async function create(movObject: TypeMovementsCreate) {
  const newMovement = movementsSchema.parse(movObject);

  await db.insert(movements).values(newMovement);
}

const movementsModel = {
  create,
};

export default movementsModel;
