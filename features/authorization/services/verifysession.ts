import "server-only";

import sessions from "@/features/models/sessions";
import userModel from "@/features/models/user";
import { cache } from "react";

export const verifySession = cache(async (sessionToken: string) => {
  const session = await sessions.findActiveByToken(sessionToken);
  console.log(session);

  const isValid = await sessions.isActive(sessionToken);

  const user = await userModel.findById(session?.userId);
  console.log(user);

  return { isAuth: isValid, user: user };
});
