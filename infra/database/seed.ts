"use server";

import { schemas } from "./schemas";
import db from "./index";
import passwordModel from "@/features/models/password";

export async function sedding() {
  console.log("Iniciando seeding...");

  try {
    await db.insert(schemas.users).values({
      firstName: "ulisses",
      lastName: "filho de laertes",
      email: "coroa@itaca.ageu",
      password: await passwordModel.passwordHashed("rei-de-itaca"),
    });

    const userId = await db
      .select({ id: schemas.users.id })
      .from(schemas.users);

    await db.insert(schemas.accounts).values({
      labelName: "patrimonio",
      ownerId: userId[0].id,
    });
  } catch (err) {
    const erro = err as Error;
    console.log(erro.cause);
  }
}
