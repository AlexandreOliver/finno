"use server";

import { schemas } from "./schemas";
import db from "./index";
import passwordModel from "@/features/models/password";
import { typesEnum } from "./schemas/categories";

const categorias = [
  {
    label: "salario",
    description: "salario recebido mensalmente",
    type: typesEnum.enumValues[1],
  },
  {
    label: "rendimentos",
    description: "lucros de investimento",
    type: typesEnum.enumValues[1],
  },
  {
    label: "casa",
    description: "gastos com a casa",
    type: typesEnum.enumValues[0],
  },
  {
    label: "mercado",
    description: "compras no supermercado",
    type: typesEnum.enumValues[0],
  },
  {
    label: "transporte",
    description: "gastos com uber ou onibus",
    type: typesEnum.enumValues[0],
  },
  {
    label: "investimento",
    description: "dinheiro alçado para investimentos diversos",
    type: typesEnum.enumValues[0],
  },
  {
    label: "saude",
    description: "gastos com remedios, exames ou produtos relacionado a saude",
    type: typesEnum.enumValues[0],
  },
  {
    label: "emprestimo",
    description: "dinheiro enviado para terceiro com expectativa de retorno",
    type: typesEnum.enumValues[0],
  },
  {
    label: "devolucao",
    description: "retorno de emprestimo a terceiro",
    type: typesEnum.enumValues[1],
  },
];

export async function sedding() {
  console.log("Iniciando seeding...");

  try {
    const userId = await db
      .insert(schemas.users)
      .values({
        firstName: "ulisses",
        lastName: "filho de laertes",
        email: "coroa@itaca.ageu",
        password: await passwordModel.passwordHashed("rei-de-itaca"),
      })
      .returning({ id: schemas.users.id });

    Promise.all([
      db.insert(schemas.accounts).values({
        labelName: "patrimonio",
        ownerId: userId[0].id,
      }),
      db.insert(schemas.categories).values(categorias),
    ]);
  } catch (err) {
    const erro = err as Error;
    console.log(erro.cause);
  }
}
