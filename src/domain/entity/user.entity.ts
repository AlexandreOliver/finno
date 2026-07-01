import { users } from "@/infrastructure/database/schemas/users";
import { createInsertSchema } from "drizzle-zod";
import { v7 as uuid7 } from "uuid";
import zod from "zod";

import "server-only";
import bcrypt from "bcrypt";

export const userSchema = createInsertSchema(users, {
  id: (schema) => schema.optional(),
  firstName: (schema) =>
    schema
      .min(2, { error: "Nome Inválido" })
      .max(30, { error: "O nome excede o limite de 30 caracteres" })
      .toLowerCase()
      .trim(),
  lastName: (schema) =>
    schema
      .min(2, { error: "Sobrenome Inválido" })
      .max(50, { error: "O sobrenome excede o limite de 50 caracteres" })
      .toLowerCase()
      .trim(),
  features: (schema) => schema.optional(),
  email: () => zod.email({ error: "Email invalido" }),
  password: (schema) =>
    schema.min(6, { error: "A senha precisa ter mais que 6 digitos" }),
  createdAt: (schema) => schema.nonoptional().default(new Date()),
  updatedAt: (schema) => schema.nonoptional().default(new Date()),
})
  .safeExtend({
    cfm_password: zod.string().optional(),
  })
  .refine(
    (user) => {
      if (!user.cfm_password) return true;

      return user.password === user.cfm_password;
    },
    {
      error: "As senhas não conferem",
      path: ["cfm_password"],
    },
  );

export type UserFromDb = typeof users.$inferSelect;

export type UserCreateProps = Omit<
  UserProps,
  "id" | "features" | "createdAt" | "updatedAt"
>;

export type UserProps = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  features: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type resultCreate =
  | { success: true; user: User }
  | {
      success: false;
      errors: {
        id?: string[] | undefined;
        firstName?: string[] | undefined;
        lastName?: string[] | undefined;
        email?: string[] | undefined;
        password?: string[] | undefined;
        cfm_password?: string[] | undefined;
        createdAt?: string[] | undefined;
        updatedAt?: string[] | undefined;
        features?: string[] | undefined;
      };
    };

export class User {
  private constructor(private readonly props: UserProps) {}

  public static async create(props: UserCreateProps): Promise<resultCreate> {
    const dataValid = userSchema.safeParse(props);

    if (!dataValid.success) {
      return {
        success: false,
        errors: zod.flattenError(dataValid.error).fieldErrors,
      };
    }

    const passwordHash = await this.passwordHashed(dataValid.data.password);
    const featuresPadrao = [] as string[];

    const dataUser = {
      ...dataValid.data,
      password: passwordHash,
      features: featuresPadrao,
      id: uuid7(),
    };

    const newUser = new User(dataUser);

    return { success: true, user: newUser };
  }

  public static with(dataDb: UserFromDb) {
    return new User(dataDb);
  }

  public static async passwordHashed(passwordInText: string) {
    const salt = await bcrypt.genSalt(
      process.env.NODE_ENV === "production" ? 12 : 1,
    );

    return await bcrypt.hash(passwordInText, salt);
  }

  public static async compareHash(
    passwordHashed: string,
    passwordInText: string,
  ) {
    return await bcrypt.compare(passwordInText, passwordHashed);
  }

  //#region Getters
  public get id() {
    return this.props.id;
  }

  public get firstName() {
    return this.props.firstName;
  }

  public get fullName() {
    return this.props.firstName + " " + this.props.lastName;
  }

  public get lastName() {
    return this.props.lastName;
  }

  public get email() {
    return this.props.email;
  }

  public get password() {
    return this.props.password;
  }

  public get features() {
    return this.props.features;
  }

  public get createdAt() {
    return this.props.createdAt;
  }

  public get updatedAt() {
    return this.props.updatedAt;
  }
  //#endregion

  public toJson<K extends keyof Omit<UserProps, "password"> = never>(options?: {
    omit: K[];
  }): Omit<Omit<UserProps, "password">, K> {
    const props = {
      ...this.props,
      password: undefined,
    };

    if (!options) return props;

    options.omit.forEach((f) => {
      delete props[f];
    });

    return props;
  }
}
