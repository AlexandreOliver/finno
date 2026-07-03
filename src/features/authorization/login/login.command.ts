import zod from "zod";

export const credentialSchema = zod.object({
  password: zod
    .string()
    .min(6, { error: "A senha precisa ter mais que 6 caracteres" })
    .max(60, { error: "A senha não pode ter mais que 60 caracteres" }),
  email: zod.email({ error: "Email invalido" }),
});

export type LoginCommand = zod.input<typeof credentialSchema>;
