import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarDashboard } from "@/features/dasboard/components";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { verifySession } from "@/features/authorization/services/verifysession";
import { SessionProvider } from "@/features/authorization/contexts/SessionProvider";

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
      <SidebarProvider className="gap-4">
        <SidebarDashboard />
        <main className="w-full">
          <SidebarTrigger />
          {children}
        </main>
      </SidebarProvider>
    </SessionProvider>
  );
}
