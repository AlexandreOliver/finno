"use server";

import { verifySession } from "@/features/authorization/services/verifysession";
import { cookies } from "next/headers";

import db from "@/infrastructure/database";
import { MovementsRepositoryDrizzle } from "@/infrastructure/repositories/drizzle/drizzle-movements.repository";
import { WalletsRepositoryDrizzle } from "@/infrastructure/repositories/drizzle/drizzle-wallets.repository";
import { DeleteMovementHandler } from "@/features/transactions/delete-movement/delete-movement.handler";
import { DrizzleUnitOfWork } from "@/infrastructure/repositories/drizzle/drizzle-unitOfWork";

const movementsRepository = MovementsRepositoryDrizzle.create(db);
const walletsRepository = WalletsRepositoryDrizzle.create(db);
const deleteMovementsUseCase = DeleteMovementHandler.create(
  movementsRepository,
  walletsRepository,
  new DrizzleUnitOfWork(),
);

export const deleteMovement = async (id: string) => {
  const { isAuth } = await verifySession(
    (await cookies()).get("session_token")?.value as string,
  );

  if (!isAuth) throw new Error("Não autorizado");

  await deleteMovementsUseCase.execute({ id });
};
