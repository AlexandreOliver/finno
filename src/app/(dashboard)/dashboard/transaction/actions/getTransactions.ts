"use server";

import { GetTransactionsUseCase } from "@/features/statement/get-statement/get-statement.handler";

import db from "@/infrastructure/database";
import { verifySession } from "@/features/authorization/services/verifysession";
import { cookies } from "next/headers";
import { TransactionsRepositoryDrizzle } from "@/infrastructure/repositories/drizzle/drizzle-transactions.repository";
import { MovementsRepositoryDrizzle } from "@/infrastructure/repositories/drizzle/drizzle-movements.repository";

// Instancia as dependências

const getTransacoesUseCase = GetTransactionsUseCase.create(
  TransactionsRepositoryDrizzle.create(db),
  MovementsRepositoryDrizzle.create(db),
);

export async function getTransactions({
  walletId,
  pagination,
  query,
}: {
  walletId: string | string[];
  pagination: { limit: number; page: number };
  query: { date: { end: string; start: string } };
}) {
  const { isAuth } = await verifySession(
    (await cookies()).get("session_token")?.value as string,
  );

  if (!isAuth) throw new Error("Não autorizado");

  if (!walletId || walletId.length === 0)
    return {
      totalMovementsFromDb: 0,
      page: pagination.page as number,
      limit: pagination.limit as number,
      payload: [],
    };

  return await getTransacoesUseCase.execute({
    walletId,
    pagination,
    filters: query,
  });
}
