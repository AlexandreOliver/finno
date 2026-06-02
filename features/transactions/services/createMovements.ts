"use server";

import * as zod from "zod";
import { pt } from "zod/locales";

zod.config(pt());

import movementsModel, {
  movementsSchema,
} from "@/features/models/movementsModel";

import reccurentModel, {
  reccurentSchema,
} from "@/features/models/recurentModel";

import { verifySession } from "@/features/authorization/services/verifysession";
import { cookies } from "next/headers";

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
    type: formData.get("type")?.toString(),
    description: formData.get("description"),
    amount: formData.get("amount")?.toString(),
    categoryId: formData.get("categoryId")?.toString(),
    walletId: formData.get("walletId")?.toString(),
    isReccurent: formData.get("isReccurent")?.toString(),
    status: formData.get("status"),
    frequency: formData.get("frequency"),
    interval: formData.get("interval"),
    installments: formData.get("installments"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
  };

  if (rawData.isReccurent === "on" || !rawData.isReccurent) {
    const objtReccurent = reccurentSchema.safeParse(rawData);

    if (!objtReccurent.success) {
      return {
        errors: zod.flattenError(objtReccurent.error).fieldErrors,
        sucess: false,
        message: "Há campos com erros",
      };
    }

    try {
      await reccurentModel.create(objtReccurent.data);
    } catch {
      return {
        message: "Um erro aconteceu ao salvar a transação, tente novamente",
        sucess: false,
      };
    }
  } else {
    const parsedData = movementsSchema.safeParse(rawData);

    if (!parsedData.success) {
      return {
        errors: zod.flattenError(parsedData.error).fieldErrors,
        sucess: false,
        message: "Há campos com erros",
      };
    }
    try {
      await movementsModel.create(parsedData.data);
    } catch {
      return {
        message: "Um erro aconteceu ao salvar a transação, tente novamente",
        sucess: false,
      };
    }
  }

  return { message: "Transação Salva com sucesso", sucess: true };
}
