"use server";

import { verifySession } from "@/features/authorization/services/verifysession";
import movementsModel from "@/features/models/movementsModel";
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
  query?: {
    date: {
      start?: string;
      end?: string;
    };
  };
  pagination: { limit: number; page: number };
}) => Promise<TReturnGetMovements>;

export const getMovementsService: TGetMovementsService = async ({
  walletId,
  query,
  pagination = { limit: 10, page: 1 },
}) => {
  const { isAuth } = await verifySession(
    (await cookies()).get("session_token")?.value as string,
  );

  if (!isAuth) throw new Error("Não autorizado");

  if (!walletId)
    return {
      totalMovementsFromDb: 0,
      page: pagination.page as number,
      limit: pagination.limit as number,
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

  let dateParsed = {};
  if (query?.date && query.date.start && query.date.end) {
    dateParsed = {
      start: new Date(new Date(query?.date.start).setUTCHours(0)),
      end: new Date(new Date(query?.date.end).setUTCHours(23, 59, 59, 999)),
    };
  }

  const [movements, countDb] = await Promise.all([
    movementsModel.findByWalletIdForQuery({
      walletId: walletId,
      returnFields: fields,
      query: {
        date: dateParsed,
      },
      pagination,
      include: {
        category: true,
      },
    }),
    movementsModel.count(walletId, { date: dateParsed }),
  ]);

  return {
    totalMovementsFromDb: countDb,
    page: pagination.page,
    limit: pagination.limit,
    payload: movements,
  } as TReturnGetMovements;
};
