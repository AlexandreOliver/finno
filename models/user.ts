import db from "@/infra/database";
import { users } from "@/infra/database/schemas/users";
import { createInsertSchema } from "drizzle-zod";
import zod from "zod";
import passwordModel from "./password";
import { eq } from "drizzle-orm";

const userSchema = createInsertSchema(users);

type IUserCreate = zod.infer<typeof userSchema>;

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
  const userInDb = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return userInDb[0];
}

const userModel = {
  getAll,
  create,
  findByEmail,
};

export default userModel;
