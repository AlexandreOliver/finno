import { useQuery } from "@tanstack/react-query";
import { getStatement } from "@/app/(dashboard)/dashboard/transaction/actions/getStatement.action";
import { movementsQuerys } from "@/features/Provider/queryKeys";

export function useStatement(
  walletId: string | string[],
  pagination: { limit: number; page: number },
  query: { date: { end: string; start: string } },
) {
  return useQuery({
    ...movementsQuerys
      .owned(walletId as string[])
      ._ctx.query({ ...query })
      ._ctx.pagination(pagination.limit, pagination.page),

    queryFn: () => getStatement({ walletId, pagination, query }),
    placeholderData: (previousData) => previousData,
  });
}
