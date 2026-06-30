"use server";

import { verifySession } from "@/features/authorization/services/verifysession";

import { WalletsRepositoryDrizzle } from "@/infrastructure/repositories/drizzle/drizzle-wallets.repository";
import { GetWalletsHandler } from "@/features/dashboard/get-wallets/get-wallets.handler";
import db from "@/infrastructure/database";

import { cookies } from "next/headers";

const WalletsRepository = WalletsRepositoryDrizzle.create(db);
const walletsHandler = GetWalletsHandler.create(WalletsRepository);
export type Wallet = {
  id: string;
  label: string;
};

export const findWallets = async (ownerId: string) => {
  const { isAuth } = await verifySession(
    (await cookies()).get("session_token")?.value as string,
  );

  if (!isAuth) throw new Error("Não autorizado");

  const aWallets = await walletsHandler.execute({ ownerId });

  return aWallets;
};
