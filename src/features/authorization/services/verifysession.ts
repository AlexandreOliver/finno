import "server-only";

import { cache } from "react";
import { SessionsRepositoryDrizzle } from "@/infrastructure/repositories/drizzle/drizzle-sessions.repository";
import { UserRepositoryDrizzle } from "@/infrastructure/repositories/drizzle/drizzle-users.repository";

import db from "@/infrastructure/database";
import { User } from "@/domain/entity/user.entity";

const sessionRepository = SessionsRepositoryDrizzle.create(db);
const userRepository = UserRepositoryDrizzle.create(db);

type authObj =
  | {
      isAuth: false;
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
  async (sessionToken: string): Promise<authObj> => {
    const session = await sessionRepository.findActiveByToken(sessionToken);

    if (!session) {
      return {
        isAuth: false,
      };
    }

    const isValid = session.isActive();

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
