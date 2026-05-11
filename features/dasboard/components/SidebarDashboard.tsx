import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Coins, ListChevronsUpDown, Settings, User } from "lucide-react";
import Link from "next/link";

export function SidebarDashboard() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/" />}>
              <Coins size={20} />
              <span className="text-3xl font-medium">Finno</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem className="p-2">
            <SidebarMenuButton render={<Link href="#" />}>
              <ListChevronsUpDown />
              <span className="text-lg">Transações</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="flex justify-between items-center">
              <div className="flex gap-4 justify-between items-center">
                <User size={45} />
                <div>
                  <p className="text-md">Alexandre</p>
                  <p className="text-muted-foreground text-[12px]">
                    Alguma coisas
                  </p>
                </div>
              </div>
              <Settings />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
