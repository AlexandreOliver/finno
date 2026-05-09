"use server";

import zod from "zod";
import user from "@/features/models/user";
import { redirect } from "next/navigation";

const registerSchema = zod
  .object({
    firstName: zod
      .string()
      .min(2, { error: "Nome Inválido" })
      .max(30, { error: "O nome excede o limite de 30 caracteres" })
      .toLowerCase(),
    lastName: zod
      .string()
      .min(2, { error: "Sobrenome Inválido" })
      .max(50, { error: "O sobrenome excede o limite de 50 caracteres" })
      .toLowerCase(),
    email: zod.email("Email Inválido"),
    password: zod
      .string("O campo não pode estar vazio")
      .min(6, { error: "A senha precisa ter mais que 6 digitos" }),
    cfm_password: zod
      .string("O campo não pode estar vazio")
      .min(6, { error: "A senha precisa ter mais que 6 digitos" }),
  })
  .refine((user) => user.password === user.cfm_password, {
    error: "As senhas não conferem",
    path: ["cfm_password"],
  });

export interface State {
  errors?: {
    firstName?: string[];
    lastName?: string[];
    email?: string[];
    password?: string[];
    cfm_password?: string[];
  };
  message?: string | null | undefined;
  data?: Partial<zod.infer<typeof registerSchema>>;
}

export async function registerAction(
  prevState: State | null,
  formData: FormData,
) {
  const rawData = {
    firstName: formData.get("nome")?.toString(),
    lastName: formData.get("sobrenome")?.toString(),
    email: formData.get("email")?.toString(),
    password: formData.get("password")?.toString(),
    cfm_password: formData.get("cfm_password")?.toString(),
  };

  const dataValidated = registerSchema.safeParse(rawData);

  if (!dataValidated.success) {
    return {
      message: "Corrija os erros e envie novamente",
      errors: zod.flattenError(dataValidated.error).fieldErrors,
      data: rawData,
    };
  }

  try {
    await user.create(dataValidated.data);
    redirect("/auth/signin");
  } catch (err) {
    const error = err as Error;
    if (error.message === "Esse usuario ja existe") {
      return {
        message: "Faça login",
        errors: {
          email: ["Email ja registrado"],
        },
        data: rawData,
      };
    }
    throw error;
  }
}
