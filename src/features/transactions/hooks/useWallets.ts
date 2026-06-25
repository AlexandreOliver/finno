import { useQuery } from "@tanstack/react-query";
import { walletsQuerys } from "@/features/Provider/queryKeys";
import { findWallets } from "@/app/(dashboard)/dashboard/transaction/actions/findWallets";

export function useWallets(ownerId: string) {
  return useQuery({
    queryKey: walletsQuerys.owned(ownerId).queryKey,
    queryFn: () => findWallets(ownerId),
    enabled: !!ownerId,
  });
}
