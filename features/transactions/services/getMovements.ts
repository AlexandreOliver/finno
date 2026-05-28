"use server";

import { verifySession } from "@/features/authorization/services/verifysession";
import movementsModel from "@/features/models/movementsModel";
import { QueryParamsMovements } from "@/features/models/types/movements";
import { cookies } from "next/headers";

type IPayload = {
  id?: string;
  description?: string;
  type?: "debito" | "credito" | "investimento";
  walletId?: string;
  labelCategory?: string;
  categoryId: string;
  amount?: string;
  executedAt?: Date;
};

type TReturnGetMovements = {
  totalMovementsFromDb: number;
  page: number;
  limit: number;
  payload: IPayload[] | [];
};

type TGetMovementsService = ({
  walletId,
  query,
}: {
  walletId: string[] | string;
  query?: QueryParamsMovements;
}) => Promise<TReturnGetMovements>;

export const getMovementsService: TGetMovementsService = async ({
  walletId,
  query = { limit: 10, page: 1 },
}) => {
  const { isAuth } = await verifySession(
    (await cookies()).get("session_token")?.value as string,
  );

  if (!isAuth) throw new Error("Não autorizado");

  if (!walletId)
    return {
      totalMovementsFromDb: 0,
      page: query.page as number,
      limit: query.limit as number,
      payload: [],
    };

  const fields = [
    "amount",
    "description",
    "executedAt",
    "id",
    "walletId",
    "type",
  ] as const;

  const [movements, countDb] = await Promise.all([
    movementsModel.findByWalletIdForQuery({
      walletId: walletId,
      returnFields: fields,
      query,
      include: {
        category: true,
      },
    }),
    movementsModel.count(walletId, query),
  ]);

  return {
    totalMovementsFromDb: countDb,
    page: query.page,
    limit: query.limit,
    payload: movements,
  } as TReturnGetMovements;
};
