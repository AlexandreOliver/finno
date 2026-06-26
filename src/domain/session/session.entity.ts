import { sessions } from "@/infra/database/schemas/sessions";
import { randomBytes } from "node:crypto";
import { v7 as uuid7 } from "uuid";
import { z } from "zod";

export type SessionFromDb = typeof sessions.$inferSelect;

const sessionShema = z.object({
  userId: z.uuidv7({ error: "Forneça um uuid v7 valido" }),
});

export type SessionProps = {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

type resultCreate =
  | { success: false; errors: { userId?: string[] } }
  | { success: true; data: Session };

export class Session {
  static #expirationInMs = 1000 * 60 * 60 * 24 * 30;
  static #sizeTokenBytes = 48;

  private constructor(private readonly props: SessionProps) {}

  public static create(props: { userId: string }): resultCreate {
    const dataValid = sessionShema.safeParse(props);

    if (!dataValid.success) {
      return {
        success: false,
        errors: z.flattenError(dataValid.error).fieldErrors,
      };
    }

    const data = new Session({
      id: uuid7(),
      token: randomBytes(this.#sizeTokenBytes).toString("hex"),
      userId: dataValid.data.userId,
      expiresAt: new Date(Date.now() + this.#expirationInMs),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      success: true,
      data,
    };
  }

  public static with(props: SessionFromDb) {
    return new Session(props);
  }

  public static get defaultExpireInMs() {
    return this.#expirationInMs;
  }

  public get id() {
    return this.props.id;
  }

  public get token() {
    return this.props.token;
  }

  public get userId() {
    return this.props.userId;
  }

  public get expiresAt() {
    return this.props.expiresAt;
  }

  public get createdAt() {
    return this.props.createdAt;
  }

  public get updatedAt() {
    return this.props.updatedAt;
  }

  public toJson<K extends keyof SessionProps = never>(options?: {
    omit: readonly K[];
  }): Omit<SessionProps, K> {
    const data = this.props;

    if (!options || Object.keys(options.omit).length === 0) {
      return data;
    }

    if (options?.omit) {
      options.omit.forEach((key) => {
        delete data[key];
      });
    }

    return data as Omit<SessionProps, K>;
  }
}
