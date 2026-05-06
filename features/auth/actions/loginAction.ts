"use server";

import zod from "zod";
import { credentialSchema } from "../credentials";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import user from "@/features/models/user";
import passwordModel from "@/features/models/password";
import session from "@/features/models/sessions";

interface State {
  errors?: {
    email?: string[];
    password?: string[];
  };
  message?: string | null;
}

export async function loginAction(
  prevState: State | null,
  formData: FormData,
): Promise<State | null> {
  const cookieJar = await cookies();
  const dataValidated = credentialSchema.safeParse({
    password: formData.get("password"),
    email: formData.get("email"),
  });
  console.log(dataValidated);

  if (!dataValidated.success) {
    return {
      errors: zod.flattenError(dataValidated.error).fieldErrors,
      message: null,
    };
  }

  // 1 - Verifica email e senha
  const userInDb = await user.findByEmail(dataValidated.data.email);
  if (!userInDb) redirect("/register");
  console.log(userInDb);

  const passwordMatch = await passwordModel.compareHash(
    userInDb.password,
    dataValidated.data.password,
  );
  if (!passwordMatch) return { message: "Email ou Senha Inválida" };
  console.log(passwordMatch);

  // 2 - Resgata sessão ou cria caso nao exista
  const sessionToken = await session.getSession(userInDb.id);
  console.log(sessionToken);
  // 3 - Verifica ou cria o cookie
  const existsCookie = cookieJar.has("session_token");

  cookieJar.set({
    name: "session_token",
    value: sessionToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
  });

  redirect("/dashboard");
}
