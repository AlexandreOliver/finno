import { useQuery } from "@tanstack/react-query";
import { getTransactions } from "@/app/(dashboard)/dashboard/transaction/actions/getTransactions";
import { movementsQuerys } from "@/features/Provider/queryKeys";

export function useTransacoes(
  walletId: string | string[],
  pagination: { limit: number; page: number },
  query: { date: { end: string; start: string } },
) {
  return useQuery({
    ...movementsQuerys
      .owned(walletId as string[])
      ._ctx.query({ ...query })
      ._ctx.pagination(pagination.limit, pagination.page),

    queryFn: () => getTransactions({ walletId, pagination, query }),
    placeholderData: (previousData) => previousData,
  });
}
