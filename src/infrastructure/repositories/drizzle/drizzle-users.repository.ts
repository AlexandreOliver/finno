import { IUserGateway } from "@/domain/repositories/user.gateway";
import { users } from "@/infrastructure/database/schemas/users";

import { eq } from "drizzle-orm";

// import { cache } from "react";

import db from "@/infrastructure/database";
import { User, UserFromDb } from "@/domain/entity/user.entity";

export class UserRepositoryDrizzle implements IUserGateway {
  private constructor(private readonly dbInstance: typeof db) {}

  public static create(dbInstance: typeof db) {
    return new UserRepositoryDrizzle(dbInstance);
  }

  public save: IUserGateway["save"] = async (user) => {
    const data = { ...user.toJson(), password: user.password } as UserFromDb;

    const result = await this.dbInstance.insert(users).values(data).returning();

    return result.length > 0;
  };
  public list: IUserGateway["list"] = async () => {
    throw new Error("Nao implementado");
  };
  public getById: IUserGateway["getById"] = async () => {
    throw new Error("Nao implementado");
  };
  public getByEmail: IUserGateway["getByEmail"] = async (props) => {
    const result = await this.dbInstance
      .select()
      .from(users)
      .where(eq(users.email, props.email));

    if (result.length > 0) {
      const userClass = User.with(result[0]);
      return userClass;
    }

    return null;
  };
  public deleteById = async () => {
    throw new Error("Nao implementado");
  };
}
