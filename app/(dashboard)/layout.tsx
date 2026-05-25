import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { verifySession } from "@/features/authorization/services/verifysession";
import { SessionProvider } from "@/features/authorization/contexts/SessionProvider";
import { HeaderDashboard, NavBar } from "@/features/dashboard/components";

import ClientProvider from "@/features/Provider/ClientProvider";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { findWallets } from "@/features/transactions/services/findWallets";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionCookie = (await cookies()).get("session_token");

  const authUser = await verifySession(sessionCookie?.value as string);
  if (!authUser.isAuth) redirect("/auth/signin");

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["wallets", { userId: authUser.user.id }],
    queryFn: () =>
      findWallets({
        ownerId: authUser.user.id,
        returnFields: ["id", "balance", "createdAt", "labelName", "updatedAt"],
      }).then((d) => {
        console.log("Prefetch feito");
        return d;
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
