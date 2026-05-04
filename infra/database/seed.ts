import { schemas } from "./schemas";
import db from "./index";
import passwordModel from "@/models/password";

async function main() {
  console.log("Iniciando seeding...");

  await db.insert(schemas.users).values({
    firstName: "sysgod",
    lastName: "onipotent",
    email: "sys@test.com",
    password: await passwordModel.passwordHashed("teste"),
  });
}
main();
