"use server";

import * as zod from "zod";
import { pt } from "zod/locales";

zod.config(pt());

import { verifySession } from "@/features/authorization/services/verifysession";
import { cookies } from "next/headers";

import db from "@/infrastructure/database";
import { MovementsRepositoryDrizzle } from "@/infrastructure/repositories/drizzle/drizzle-movements.repository";
import { CreateMovementHandler } from "@/features/transactions/create-movement/create-movement.handler";

export interface StateForm {
  errors?: {
    type?: string[] | null;
    description?: string[] | null;
    amount?: string[] | null;
    categoryId?: string[] | null;
    walletId?: string[] | null;
    isReccurent?: string[] | null;
    status?: string[] | null;
    frequencie?: string[] | null;
    interval?: string[] | null;
    installments?: string[] | null;
    start_date?: string[] | null;
    end_date?: string[] | null;
  };
  message?: string | null;
  success: boolean;
}

export async function CreateAction(formData: FormData): Promise<StateForm> {
  const { isAuth } = await verifySession(
    (await cookies()).get("session_token")?.value as string,
  );

  if (!isAuth) throw new Error("Não autorizado");

  let result: StateForm = { success: false };

  const MovementsRepository = MovementsRepositoryDrizzle.create(db);
  const createMovement = CreateMovementHandler.create(MovementsRepository);

  const createMovementCommand = {
    type: formData.get("type")?.toString() as string,
    description: formData.get("description")?.toString() as string,
    amount: formData.get("amount")?.toString() as string,
    categoryId: formData.get("categoryId")?.toString() as string,
    walletId: formData.get("walletId")?.toString() as string,
  };

  result = await createMovement.execute(createMovementCommand);

  return result;
}
