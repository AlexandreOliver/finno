"use server";

import { verifySession } from "@/features/authorization/services/verifysession";
import walletsModel, {
  FunctionFindAllByOwner,
} from "@/features/models/walletsModel";
import { cookies } from "next/headers";

export type Wallet = {
  id: string;
  label: string;
};

export const findWallets: FunctionFindAllByOwner = async ({
  ownerId,
  returnFields,
}) => {
  const { isAuth } = await verifySession(
    (await cookies()).get("session_token")?.value as string,
  );

  if (!isAuth) throw new Error("Não autorizado");

  const result = await walletsModel.findAllByOwner({
    ownerId,
    returnFields,
  });

  return result;
};
