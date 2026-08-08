"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { LoginHandler } from "@/features/authorization/login/login.handler";
import { SessionsRepositoryDrizzle } from "@/infrastructure/repositories/drizzle/drizzle-sessions.repository";
import { UserRepositoryDrizzle } from "@/infrastructure/repositories/drizzle/drizzle-users.repository";
import db from "@/infrastructure/database";
import { Session } from "@/domain/entity/session.entity";
import { credentialSchema } from "./credentials";
import zod from "zod";

const sessionRepository = SessionsRepositoryDrizzle.create(db);
const userRepository = UserRepositoryDrizzle.create(db);

const login = LoginHandler.create(sessionRepository, userRepository);

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

  const formated = credentialSchema.safeParse({
    password: formData.get("password") as string,
    email: formData.get("email") as string,
  });

  if (!formated.success) {
    return {
      message: "Há campos com erro",
      errors: zod.flattenError(formated.error).fieldErrors,
    };
  }

  const result = await login.execute(formated.data);

  if (!result.success) {
    return result;
  }

  cookieJar.set({
    name: "session_token",
    value: result.sessionToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: Session.defaultExpireInMs / 1000,
  });

  redirect("/dashboard");
}
