"use server";

import * as z from "zod";
import { pt } from "zod/locales";

z.config(pt());

import { verifySession } from "@/features/authorization/services/verifysession";
import { cookies } from "next/headers";

import db from "@/infrastructure/database";
import { MovementsRepositoryDrizzle } from "@/infrastructure/repositories/drizzle/drizzle-movements.repository";
import { WalletsRepositoryDrizzle } from "@/infrastructure/repositories/drizzle/drizzle-wallets.repository";
import { DrizzleUnitOfWork } from "@/infrastructure/repositories/drizzle/drizzle-unitOfWork";
import { CreateMovementHandler } from "@/features/transactions/create-movement/create-movement.handler";
import { movementDomainBaseSchema } from "@/domain/schemas/movement.schema";

const CreateMovementRequestSchema = movementDomainBaseSchema
  .omit({
    reccurrentId: true,
    isRefunded: true,
    isReversal: true,
    reversalOfId: true,
    dueDate: true,
    executedAt: true,
    id: true,
  })
  .safeExtend({
    description: z.coerce
      .string<string>({ error: "Forneça uma desrição" })
      .min(2, { error: "Descrição muito curta" }),
    amount: z.coerce
      .number<number>({ error: "Forneça um valor valido" })
      .gt(0, { error: "O valor precisa ser maior que 0" }),
    categoryId: z.uuidv7({ error: "Forneça uma uuid v7" }),
    walletId: z.uuidv7({ error: "Forneça uma uuid v7" }),
    executedAt: z.coerce
      .date({ error: "Forneça uma data no formato YYYY-MM-DD" })
      .optional()
      .default(new Date()),
  });

export interface StateFormMovement {
  errors?: z.core.$ZodFlattenedError<
    z.infer<typeof CreateMovementRequestSchema>
  >["fieldErrors"];
  message?: string | null;
  success: boolean;
}

export async function CreateAction(
  formData: FormData,
): Promise<StateFormMovement> {
  const { isAuth } = await verifySession(
    (await cookies()).get("session_token")?.value as string,
  );

  if (!isAuth) throw new Error("Não autorizado");

  const receivedData = Object.fromEntries(formData.entries());

  const isParseSuccess = CreateMovementRequestSchema.safeParse(receivedData);

  if (!isParseSuccess.success) {
    return {
      success: false,
      message: "Corrija os erros nos campos",
      errors: z.flattenError(isParseSuccess.error).fieldErrors,
    };
  }

  const MovementsRepository = MovementsRepositoryDrizzle.create(db);
  const WalletsRepository = WalletsRepositoryDrizzle.create(db);

  const createMovement = CreateMovementHandler.create(
    MovementsRepository,
    WalletsRepository,
    new DrizzleUnitOfWork(),
  );

  const newMovementDTO = {
    ...isParseSuccess.data,
    isReversal: false,
    isRefunded: false,
    reversalOfId: null,
    reccurrentId: null,
    dueDate: null,
  };

  const result = await createMovement.execute(newMovementDTO);

  return {
    success: result.success,
    message: result.message,
  };
}
