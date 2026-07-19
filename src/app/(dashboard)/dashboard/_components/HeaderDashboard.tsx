"use client";

import { BellIcon, Coins } from "lucide-react";

import { useSession } from "@/hooks/useSession";
import ThemeComponent from "@/components/ThemeComponent";
import { UserOptions } from "./UserOptions";

export function HeaderDashboard() {
  const { user } = useSession();

  return (
    <header className="border-gray-400 border-b bg-background dark:bg-background">
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

          {user && <UserOptions user={user} />}
        </div>
      </div>
    </header>
  );
}
