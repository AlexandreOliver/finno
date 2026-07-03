"use server";

import zod from "zod";
import { redirect } from "next/navigation";
import { userSchema } from "@/domain/entity/user.entity";

import db from "@/infrastructure/database";

import { CreateUserHandler } from "@/features/authorization/create-user/create-user.handler";

import { UserRepositoryDrizzle } from "@/infrastructure/repositories/drizzle/drizzle-users.repository";
import { WalletsRepositoryDrizzle } from "@/infrastructure/repositories/drizzle/drizzle-wallets.repository";
import { DrizzleUnitOfWork } from "@/infrastructure/repositories/drizzle/drizzle-unitOfWork";

export interface State {
  errors: {
    firstName?: string[];
    lastName?: string[];
    email?: string[];
    password?: string[];
    cfm_password?: string[];
  };
  message: string;
  data?: Partial<zod.infer<typeof userSchema>>;
}

const registration = CreateUserHandler.create(
  UserRepositoryDrizzle.create(db),
  WalletsRepositoryDrizzle.create(db),
  new DrizzleUnitOfWork(),
);

export async function registerAction(
  prevState: State | null,
  formData: FormData,
): Promise<State | never> {
  try {
    const rawData = {
      firstName: formData.get("nome")?.toString() ?? "",
      lastName: formData.get("sobrenome")?.toString() ?? "",
      email: formData.get("email")?.toString() ?? "",
      password: formData.get("password")?.toString() ?? "",
    };

    const result = await registration.execute(rawData);

    if (!result.success) {
      return {
        message: result.message,
        errors: result.errors ?? {},
        data: rawData,
      };
    }
  } catch (err) {
    console.log(err);
    return {
      message: "Um erro aconteceu",
      errors: {},
    };
  }

  redirect("/auth/signin");
}
