import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { verifySession } from "@/features/authorization/services/verifysession";
import { SessionProvider } from "@/features/authorization/contexts/SessionProvider";
import { HeaderDashboard, NavBar } from "@/features/dasboard/components";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionCookie = (await cookies()).get("session_token");

  const authUser = await verifySession(sessionCookie?.value as string);
  if (!authUser.isAuth) redirect("/auth/signin");

  return (
    <SessionProvider value={authUser}>
      <HeaderDashboard />
      <NavBar />
      <main className="boxed">{children}</main>
    </SessionProvider>
  );
}
