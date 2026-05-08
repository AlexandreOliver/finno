import "server-only";
import db from "@/infra/database";
import { users } from "@/infra/database/schemas/users";
import { createInsertSchema } from "drizzle-zod";
import zod from "zod";
import passwordModel from "./password";
import { eq } from "drizzle-orm";

export const userSchema = createInsertSchema(users, {
  firstName: (schema) =>
    schema
      .max(30, { error: "O nome excede o limite de 30 caracteres" })
      .toLowerCase(),
  lastName: (schema) =>
    schema
      .max(50, { error: "O sobrenome excede o limite de 50 caracteres" })
      .toLowerCase(),
  email: () => zod.email(),
  password: (schema) =>
    schema.min(6, { error: "A senha precisa ter mais que 6 digitos" }),
});

type IUserCreate = Omit<
  zod.infer<typeof userSchema>,
  "id" | "createdAt" | "updatedAt"
>;

async function getAll() {
  const result = await db.select().from(users);

  return result;
}

async function create(dataReceived: IUserCreate) {
  const dataValidated = userSchema.parse(dataReceived);

  const userExists = await findByEmail(dataValidated.email);
  if (userExists) throw new Error("Esse usuario ja existe");

  const passwordHashed = await passwordModel.passwordHashed(
    dataReceived.password,
  );

  const newUser = {
    ...dataReceived,
    password: passwordHashed,
  };

  const result = await db
    .insert(users)
    .values(newUser)
    .returning({ id: users.id });

  return result[0];
}

async function findByEmail(email: string) {
  try {
    const userInDb = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return userInDb[0];
  } catch (err) {
    const error = err as Error;
    if (error.cause.code === "ECONNREFUSED") {
      throw new Error("ServiceError: Banco de dados esta offline", {
        cause: err,
      });
    }
    throw err;
  }
}

async function findById(id: string) {
  const userInDb = await db.select().from(users).where(eq(users.id, id));

  return userInDb[0];
}

const userModel = {
  getAll,
  create,
  findByEmail,
  findById,
};

export default userModel;
