"use server";

import { verifySession } from "@/features/authorization/services/verifysession";

import { WalletsRepositoryDrizzle } from "@/infrastructure/repositories/drizzle/drizzle-wallets.repository";
import { GetWalletsUseCase } from "@/features/dashboard/statement/UseCases/get-wallets.use-case";
import db from "@/infrastructure/database";

import { cookies } from "next/headers";

const WalletsRepository = WalletsRepositoryDrizzle.create(db);
const GetWallets = GetWalletsUseCase.create(WalletsRepository);

export type Wallet = {
  id: string;
  label: string;
};

export const findWallets = async (ownerId: string) => {
  const { isAuth } = await verifySession(
    (await cookies()).get("session_token")?.value as string,
  );

  if (!isAuth) throw new Error("Não autorizado");

  const result = await GetWallets.execute({
    ownerId,
  });

  return result;
};
