"use server";

import { cookies } from "next/headers";

import { verifySession } from "@/features/authorization/services/verifysession";
import { redirect } from "next/navigation";
import { LogoutHandler } from "@/features/authorization/logout/logout.handler";
import { SessionsRepositoryDrizzle } from "@/infrastructure/repositories/drizzle/drizzle-sessions.repository";
import db from "@/infrastructure/database";

const SessionRepository = SessionsRepositoryDrizzle.create(db);
const logoutHandler = LogoutHandler.create(SessionRepository);

export async function logoutAction(props: { userId: string }) {
  const cookieJar = await cookies();

  const sessionToken = cookieJar.get("session_token");
  if (!sessionToken) redirect("/auth/signin");

  const { isAuth } = await verifySession(sessionToken.value);
  if (!isAuth) redirect("/auth/signin");

  const isLogoutSuccess = await logoutHandler.execute({
    ...props,
    sessionToken: sessionToken.value,
  });

  if (isLogoutSuccess) {
    cookieJar.set({
      name: "session_token",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: -1,
    });

    redirect("/");
  }
}
