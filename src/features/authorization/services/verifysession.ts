import "server-only";

import { cache } from "react";
import { SessionsRepositoryDrizzle } from "@/infrastructure/repositories/drizzle/drizzle-sessions.repository";
import { UserRepositoryDrizzle } from "@/infrastructure/repositories/drizzle/drizzle-users.repository";

import db from "@/infrastructure/database";
import { User } from "@/domain/entity/user.entity";
import { cookies } from "next/headers";

const sessionRepository = SessionsRepositoryDrizzle.create(db);
const userRepository = UserRepositoryDrizzle.create(db);

type authObj =
  | {
      isAuth: false;
      user: null;
    }
  | {
      isAuth: true;
      user: {
        id: string;
        firstName: string;
        lastName: string;
      };
    };

export const verifySession = cache(
  async (sessionToken?: string): Promise<authObj> => {
    if (!sessionToken) {
      const cookieJar = await cookies();

      const sessionCookie = cookieJar.get("session_token");
      if (!sessionCookie || !sessionCookie.value)
        return {
          isAuth: false,
          user: null,
        };

      sessionToken = sessionCookie.value;
    }

    const session = await sessionRepository.findActiveByToken(sessionToken);

    if (!session) {
      return {
        isAuth: false,
        user: null,
      };
    }

    const isValid = session.isActive();

    if (!isValid) {
      return {
        isAuth: false,
        user: null,
      };
    }

    const user = (await userRepository.getById(session.userId)) as User;

    return {
      isAuth: isValid,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  },
);
