"use server";

import { verifySession } from "@/features/authorization/services/verifysession";
import { cookies } from "next/headers";

import db from "@/infrastructure/database";
import { MovementsRepositoryDrizzle } from "@/infrastructure/repositories/drizzle/drizzle-movements.repository";
import { DeleteMovementsUseCase } from "@/features/transactions/statement/UseCases/delete-movements.use-case";

const movementsRepository = MovementsRepositoryDrizzle.create(db);
const deleteMovementsUseCase =
  DeleteMovementsUseCase.create(movementsRepository);

export const deleteMovement = async (id: string) => {
  const { isAuth } = await verifySession(
    (await cookies()).get("session_token")?.value as string,
  );

  if (!isAuth) throw new Error("Não autorizado");

  await deleteMovementsUseCase.execute(id);
};
