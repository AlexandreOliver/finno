import { ReactNode } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import getQueryClient from "./QueryClientServer";
import { getMovementsService } from "../transactions/services/getMovements";

export default async function TransactionProvider({
  children,
  user,
}: {
  children: ReactNode;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
}) {
  const queryClient = getQueryClient();

  const wallets =
    queryClient.getQueryData(["wallets", { userId: user.id }]) ?? [];

  console.log(wallets);

  const wallets_Ids = wallets?.map((w) => w.id);

  await queryClient.prefetchQuery({
    queryKey: ["movements", wallets_Ids],
    queryFn: () =>
      getMovementsService({
        walletId: wallets_Ids as string[],
      }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}
