import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { verifySession } from "@/features/authorization/services/verifysession";
import { SessionProvider } from "@/features/authorization/contexts/SessionProvider";
import { HeaderDashboard, NavBar } from "./dashboard/_components";

import ClientProvider from "@/features/Provider/ClientProvider";
import getQueryClient from "@/features/Provider/QueryClientServer";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { walletsQuerys } from "@/features/Provider/queryKeys";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionCookie = (await cookies()).get("session_token");

  const authUser = await verifySession(sessionCookie?.value as string);
  if (!authUser.isAuth) redirect("/auth/signin");

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(walletsQuerys.owned(authUser.user.id));

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
