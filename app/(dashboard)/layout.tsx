import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarDashboard } from "@/features/dasboard/components";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider className="gap-4">
      <SidebarDashboard />
      <main className="w-full">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
