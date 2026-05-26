"use server";

import { verifySession } from "@/features/authorization/services/verifysession";
import movementsModel from "@/features/models/movementsModel";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export const deleteMovement = async (id: string) => {
  const { isAuth } = await verifySession(
    (await cookies()).get("session_token")?.value as string,
  );

  if (!isAuth) throw new Error("Não autorizado");
  await movementsModel.deleteById(id);

  revalidatePath("dashboard/transaction");
};
