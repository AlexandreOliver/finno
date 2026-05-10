"use server";

import { schemas } from "./schemas";
import db from "./index";
import passwordModel from "@/features/models/password";

export async function sedding() {
  console.log("Iniciando seeding...");

  try {
    await db.insert(schemas.users).values({
      firstName: "odisseu",
      lastName: "filho de Laertes",
      email: "coroa@itaca.net",
      password: await passwordModel.passwordHashed("rei-de-itaca"),
    });
  } catch (err) {
    const erro = err as Error;
    console.log(erro.cause);
  }
}
