import { formatNome } from "@/lib/utils";
import { User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { logoutAction } from "@/app/auth/actions/logoutAction";

import { useTransition } from "react";

export function UserOptions({
  user,
}: {
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
}) {
  const [isPending, startLogout] = useTransition();

  const nome = formatNome(user.firstName as string);
  const sobrenome = formatNome(user.lastName as string);

  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger
          className="border border-gray-800 dark:border-gray-400"
          render={
            <Button
              variant="outline"
              className="rounded-sm w-10 h-full flex justify-center items-center bg-none"
            />
          }
        >
          <User />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-24">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs">
              Minha Conta
            </DropdownMenuLabel>
            {/* <DropdownMenuItem>Profile</DropdownMenuItem> */}
            <DropdownMenuItem className="">
              <Button
                onClick={() =>
                  startLogout(() => logoutAction({ userId: user.id }))
                }
                variant="ghost"
                className="text-red-500 h-4 w-full justify-start"
              >
                {isPending ? "Saindo..." : "Sair"}
              </Button>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          {/* <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>Team</DropdownMenuItem>
            <DropdownMenuItem>Subscription</DropdownMenuItem>
          </DropdownMenuGroup> */}
        </DropdownMenuContent>
      </DropdownMenu>
      <div>
        <div className="text-sm">{nome}</div>
        <div className="text-xs text-muted-foreground">{sobrenome}</div>
      </div>
    </div>
  );
}
