import ThemeComponent from "@/components/ThemeComponent";
import { BellIcon, Coins, User } from "lucide-react";

export function HeaderDashboard() {
  return (
    <header className="border-gray-400 border-b bg-white">
      <div className="boxed p-2 flex justify-between">
        <div className="flex gap-3 justify-center items-center">
          <Coins size={33} className="text-black/60" />
          <span className="text-3xl font-bold text-black/60">Finno</span>
        </div>

        <div className="flex gap-5">
          <div className="flex gap-3">
            <ThemeComponent />
            <div className="flex justify-between items-center">
              <BellIcon size={19} />
            </div>
          </div>

          <div className="flex gap-2">
            <div className="rounded-sm w-10 border border-gray-800 flex justify-center items-center">
              <User />
            </div>
            <div>
              <div className="text-sm">Ulisses</div>
              <div className="text-xs text-muted-foreground">
                Filho de Atreu
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
