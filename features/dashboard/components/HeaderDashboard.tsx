"use client";

import { BellIcon, Coins, User } from "lucide-react";

import { useSession } from "@/hooks/useSession";
import ThemeComponent from "@/components/ThemeComponent";
import { formatNome } from "@/lib/utils";

export function HeaderDashboard() {
  const { user } = useSession();

  const nome = formatNome(user?.firstName as string);
  const sobrenome = formatNome(user?.lastName as string);
  return (
    <header className="border-gray-400 border-b bg-white dark:bg-background">
      <div className="boxed p-2 flex justify-between">
        <div className="flex gap-3 justify-center items-center">
          <Coins size={33} className="text-black/60 dark:text-foreground" />
          <span className="text-3xl font-bold text-black/60 dark:text-foreground">
            Finno
          </span>
        </div>

        <div className="flex gap-5">
          <div className="flex gap-3">
            <ThemeComponent />
            <div className="flex justify-between items-center">
              <BellIcon size={19} />
            </div>
          </div>

          <div className="flex gap-2">
            <div className="rounded-sm w-10 border border-gray-800 dark:border-gray-400 flex justify-center items-center">
              <User />
            </div>
            <div>
              <div className="text-sm">{nome}</div>
              <div className="text-xs text-muted-foreground">{sobrenome}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
