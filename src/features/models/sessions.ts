import "server-only";
import db from "@/infra/database";
import { sessions } from "@/infra/database/schemas/sessions";
import { and, eq, gt } from "drizzle-orm";
import { cache } from "react";

import { randomBytes } from "node:crypto";

const EXPIRATION_IN_MILLISECONDS = 1000 * 60 * 60 * 24 * 30;

async function create(userId: string) {
  const sessionObject = {
    token: randomBytes(48).toString("hex"),
    userId: userId,
    expiresAt: new Date(Date.now() + EXPIRATION_IN_MILLISECONDS),
  };

  const newSession = await db
    .insert(sessions)
    .values(sessionObject)
    .returning({ token: sessions.token });

  return newSession[0];
}

const findActiveByToken = cache(async (token: string) => {
  const session = await db
    .select()
    .from(sessions)
    .where(and(gt(sessions.expiresAt, new Date()), eq(sessions.token, token)));

  return session[0];
});

async function renew(sessionId: string) {
  const session = await db
    .update(sessions)
    .set({
      expiresAt: new Date(Date.now() + EXPIRATION_IN_MILLISECONDS),
      updatedAt: new Date(),
    })
    .where(eq(sessions.id, sessionId))
    .returning({ token: sessions.token });

  return session[0];
}

const isActive = cache(async (token: string) => {
  if (!token) return false;
  const session = await db
    .select()
    .from(sessions)
    .where(and(gt(sessions.expiresAt, new Date()), eq(sessions.token, token)));

  return session[0] !== undefined;
});

const session = {
  create,
  renew,
  isActive,
  findActiveByToken,
  EXPIRATION_IN_MILLISECONDS,
};

export default session;
