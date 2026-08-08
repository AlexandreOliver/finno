import { redirect } from "next/navigation";

import { verifySession } from "@/features/authorization/services/verifysession";
import { SessionProvider } from "@/features/authorization/contexts/SessionProvider";
import { HeaderDashboard } from "./dashboard/_components/HeaderDashboard";
import { NavBar } from "./dashboard/_components/NavBar";

import ClientProvider from "@/features/Provider/ClientProvider";
import getQueryClient from "@/features/Provider/QueryClientServer";

import { WalletsRepositoryDrizzle } from "@/infrastructure/repositories/drizzle/drizzle-wallets.repository";
import { GetWalletsHandler } from "@/features/dashboard/get-wallets/get-wallets.handler";
import db from "@/infrastructure/database";

const WalletsRepository = WalletsRepositoryDrizzle.create(db);
const getWallets = GetWalletsHandler.create(WalletsRepository);

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { dashboardQuery, walletsQuerys } from "@/features/Provider/queryKeys";
import { DasboardDataQueryHandler } from "@/features/dashboard/query-dashboard-data/dashboard-data.query-handler";
import { format } from "date-fns";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authUser = await verifySession();
  if (!authUser.isAuth) redirect("/auth/signin");

  const date = format(new Date(), "yyyy-MM");

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: walletsQuerys.owned(authUser.user.id).queryKey,
    queryFn: () => getWallets.execute({ ownerId: authUser.user.id }),
  });

  const handlerDashboard = DasboardDataQueryHandler.create(db);

  // eslint-disable-next-line @tanstack/query/exhaustive-deps
  await queryClient.prefetchQuery({
    queryKey: dashboardQuery.all({
      referenceMonth: date,
    }).queryKey,

    queryFn: () =>
      handlerDashboard.execute({
        userId: authUser.user.id,
        referenceMonth: date,
      }),
  });

  return (
    <SessionProvider value={authUser}>
      <HeaderDashboard />
      <NavBar />
      <ClientProvider>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <main className="boxed">{children}</main>
        </HydrationBoundary>
      </ClientProvider>
    </SessionProvider>
  );
}
