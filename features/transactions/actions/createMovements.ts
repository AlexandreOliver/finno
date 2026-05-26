"use server";

import * as zod from "zod";
import movementsModel, {
  movementsSchema,
} from "@/features/models/movementsModel";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/features/authorization/services/verifysession";
import { cookies } from "next/headers";

interface StateForm {
  errors?: {
    type?: string[] | null;
    description?: string[] | null;
    amount?: string[] | null;
    categoryId?: string[] | null;
    walletId?: string[] | null;
  };
  message?: string | null;
  sucess: boolean;
}

export async function CreateMovementAction(
  prevState: StateForm,
  formData: FormData,
): Promise<StateForm> {
  const { isAuth } = await verifySession(
    (await cookies()).get("session_token")?.value as string,
  );

  if (!isAuth) throw new Error("Não autorizado");

  const rawData = movementsSchema.safeParse({
    type: formData.get("type")?.toString(),
    description: formData.get("description"),
    amount: formData.get("amount")?.toString(),
    categoryId: formData.get("categoryId")?.toString(),
    walletId: formData.get("walletId")?.toString(),
  });

  if (!rawData.success) {
    return {
      errors: zod.flattenError(rawData.error).fieldErrors,
      sucess: false,
      message: "Há campos com erros",
    };
  }

  try {
    await movementsModel.create(rawData.data);
  } catch {
    return {
      message: "Um erro aconteceu ao salvar a transação, tente novamente",
      sucess: false,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transaction");

  return { message: "Transação Salva com sucesso", sucess: true };
}
