"use server";

import * as zod from "zod";
import { pt } from "zod/locales";

zod.config(pt());

import { verifySession } from "@/features/authorization/services/verifysession";
import { cookies } from "next/headers";

import db from "@/infrastructure/database";
import { MovementsRepositoryDrizzle } from "@/infrastructure/repositories/drizzle/drizzle-movements.repository";
import { ReccurentRepositoryDrizzle } from "@/infrastructure/repositories/drizzle/drizzle-reccurent.repository";

import { CreateReccurentUseCase } from "@/features/statement/UseCases/create-reccurent.use-case";
import { CreateMovementsUseCase } from "@/features/statement/UseCases/create-movements.use-case";

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
  sucess: boolean;
}

export async function CreateAction(formData: FormData): Promise<StateForm> {
  const { isAuth } = await verifySession(
    (await cookies()).get("session_token")?.value as string,
  );

  if (!isAuth) throw new Error("Não autorizado");

  const rawData = {
    isReccurent: formData.get("isReccurent")?.toString(),
  };

  let result: StateForm = { sucess: false };

  if (rawData.isReccurent === "on" || !rawData.isReccurent) {
    const ReccurentRepository = ReccurentRepositoryDrizzle.create(db);
    const createReccurent = CreateReccurentUseCase.create(ReccurentRepository);

    result = await createReccurent.execute({
      type: formData.get("type")?.toString() as string,
      description: formData.get("description")?.toString() as string,
      amount: formData.get("amount")?.toString() as string,
      categoryId: formData.get("categoryId")?.toString() as string,
      walletId: formData.get("walletId")?.toString() as string,
      status: formData.get("status")?.toString() as string,
      frequency: formData.get("frequency")?.toString() as string,
      interval: formData.get("interval")?.toString() as string,
      installments: formData.get("installments")?.toString() as string,
      start_date: formData.get("start_date")?.toString() as string,
      end_date: formData.get("end_date")?.toString(),
    });
  } else {
    const MovementsRepository = MovementsRepositoryDrizzle.create(db);
    const createMovement = CreateMovementsUseCase.create(MovementsRepository);

    result = await createMovement.execute({
      type: formData.get("type")?.toString() as string,
      description: formData.get("description")?.toString() as string,
      amount: formData.get("amount")?.toString() as string,
      categoryId: formData.get("categoryId")?.toString() as string,
      walletId: formData.get("walletId")?.toString() as string,
    });
  }

  return result;
}
