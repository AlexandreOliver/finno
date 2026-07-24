"use server";

import z from "zod";
import { verifySession } from "@/features/authorization/services/verifysession";
import { StateFormMovement } from "./createMovement.action";
import { cookies } from "next/headers";
import { FREQUENCIES_RECCURRENT, TYPES_TRANSACTION } from "@/domain/enums";

import { ReccurrentRepositoryDrizzle } from "@/infrastructure/repositories/drizzle/drizzle-reccurent.repository";
import db from "@/infrastructure/database";
import { CreateReccurrentHandler } from "@/features/transactions/create-reccurrent/create-reccurrent.handler";
import { MovementsRepositoryDrizzle } from "@/infrastructure/repositories/drizzle/drizzle-movements.repository";
import { WalletsRepositoryDrizzle } from "@/infrastructure/repositories/drizzle/drizzle-wallets.repository";
import { DrizzleUnitOfWork } from "@/infrastructure/repositories/drizzle/drizzle-unitOfWork";

export type StateFormReccurent = {
  errors?: StateFormMovement["errors"] & {
    status?: string[] | null;
    frequencie?: string[] | null;
    interval?: string[] | null;
    installments?: string[] | null;
    startDate?: string[] | null;
    endDate?: string[] | null;
  };
  message?: string | null;
  success: boolean;
};

const CreateReccurentCommandSchema = z
  .object({
    description: z.coerce
      .string({ error: "Forneça uma descrição" })
      .min(2, { error: "Descrição muito curta" }),
    type: z.enum(TYPES_TRANSACTION, { error: "Forneça um tipo valido" }),
    walletId: z.coerce.string({ error: "Forneça a id de uma wallet" }),
    categoryId: z.coerce.string({ error: "Forneça a id de uma categoria" }),
    amount: z.coerce
      .number()
      .gt(0, { error: "A valor precisa ser maior do que 0" }),
    frequency: z.enum(FREQUENCIES_RECCURRENT).nonoptional(),
    interval: z.coerce
      .number({ error: "Forneça um numero" })
      .gt(0, { error: "O intervalo precisa ser maior que 0" }),
    installments: z.coerce.number({ error: "Forneça um numero" }).nullable(),
    startDate: z
      .string({ error: "Forneça uma data valida no formato YYYY-MM-DD" })
      .transform((val) => {
        const apenasData = val.split("T")[0];
        return new Date(`${apenasData}T00:00:00.000`);
      })
      .nonoptional(),
    payOnStartDate: z.coerce.boolean(),
  })
  .superRefine((base) => {
    if (base.installments === 0) base.installments = null;
  });

export async function CreateReccurrentAction(
  formData: FormData,
): Promise<StateFormReccurent> {
  const { isAuth } = await verifySession(
    (await cookies()).get("session_token")?.value as string,
  );

  if (!isAuth) throw new Error("Não autorizado");

  console.log(Object.fromEntries(formData.entries()));

  const rawData = CreateReccurentCommandSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!rawData.success) {
    console.log(z.flattenError(rawData.error).fieldErrors);
    return {
      success: false,
      message: "Corrija os erros nos campos",
      errors: z.flattenError(rawData.error).fieldErrors,
    };
  }

  console.log(rawData);

  const reccurrentRepository = ReccurrentRepositoryDrizzle.create(db);
  const movementRepository = MovementsRepositoryDrizzle.create(db);
  const walletRepository = WalletsRepositoryDrizzle.create(db);
  const transactionDbRepository = new DrizzleUnitOfWork();
  const createReccurrent = CreateReccurrentHandler.create(
    reccurrentRepository,
    walletRepository,
    movementRepository,
    transactionDbRepository,
  );

  const newReccurrentDTO = {
    ...rawData.data,
    nextDueDate: null,
  };

  const result = await createReccurrent.execute(newReccurrentDTO);

  console.log(result);

  if (!result.success)
    return {
      success: false,
      message: result.message,
    };

  return {
    success: true,
    message: "Recorrência criada com sucesso",
  };
}
