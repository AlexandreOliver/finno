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

  if (!dataValidated.success) {
    return {
      errors: zod.flattenError(dataValidated.error).fieldErrors,
      message: null,
    };
  }

  // 1 - Verifica email e senha
  const userInDb = await user.findByEmail(dataValidated.data.email);
  if (!userInDb) redirect("/auth/register");

  const passwordMatch = await passwordModel.compareHash(
    userInDb.password,
    dataValidated.data.password,
  );
  if (!passwordMatch) return { message: "Email ou Senha Inválida" };

  // 2 - Cria a sessão
  const sessionToken = await session.create(userInDb.id);

  // 3 - Cria o cookie
  cookieJar.set({
    name: "session_token",
    value: sessionToken.token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
  });

  redirect("/dashboard");
}
