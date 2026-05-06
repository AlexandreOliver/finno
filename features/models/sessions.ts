import db from "@/infra/database";
import { sessions } from "@/infra/database/schemas/sessions";
import { and, eq, gt } from "drizzle-orm";

import { randomBytes } from "node:crypto";

const EXPIRATION_IN_MILLISECONDS = 1000 * 60 * 60 * 24 * 30;

async function getSession(userId: string) {
  const session = await searchAvailableSession(userId);
  if (session) return session.token;

  const sessionObject = {
    token: randomBytes(48).toString("hex"),
    userId: userId,
    expiresAt: new Date(Date.now() + EXPIRATION_IN_MILLISECONDS),
  };

  const newSession = await db
    .insert(sessions)
    .values(sessionObject)
    .returning({ token: sessions.token });

  return newSession[0].token;
}

async function searchAvailableSession(userId: string) {
  const session = await db
    .select({ token: sessions.token })
    .from(sessions)
    .where(
      and(gt(sessions.expiresAt, new Date()), eq(sessions.userId, userId)),
    );

  return session[0];
}

const session = {
  getSession,
  EXPIRATION_IN_MILLISECONDS,
};

export default session;
