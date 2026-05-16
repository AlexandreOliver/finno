"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BanknoteArrowDown, BanknoteArrowUp, Home, Wallet } from "lucide-react";
import { Separator } from "@base-ui/react";
import clsx from "clsx";

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="pt-2 flex justify-center">
      <nav className="flex gap-1 text-md rounded-t-md bg-card px-2 py-1">
        <div className="flex items-center gap-2 ">
          <Link
            href="#"
            prefetch={false}
            className={clsx(
              pathname === "/dashboard" &&
                "border-b-2 border-blue-600 dark:border-blue-400",
            )}
          >
            <div
              className={`
                flex justify-center items-center gap-2
                rounded-md px-2 py-2
                hover:bg-gray-300/20 hover:text-black dark:hover:text-gray-300
                `}
            >
              <Home size={20} />
              <span>Home</span>
            </div>
          </Link>
          <Separator
            orientation="vertical"
            className="h-6 border-r border-gray-300 dark:border-card-foreground/20 mr-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="#"
            prefetch={false}
            className={clsx(
              pathname === "/expenses" &&
                "border-b-2 border-blue-600 dark:border-blue-400",
            )}
          >
            <div
              className={`
                flex justify-center items-center gap-2
                rounded-md px-2 py-2
                hover:bg-gray-300/20 hover:text-black dark:hover:text-gray-300
                `}
            >
              <BanknoteArrowDown size={22} />
              <span>Gastos</span>
            </div>
          </Link>
          <Separator
            orientation="vertical"
            className="h-6 border-r border-gray-300 dark:border-card-foreground/20 mr-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="#"
            prefetch={false}
            className={clsx(
              pathname === "/incomes" &&
                "border-b-2 border-blue-600 dark:border-blue-400",
            )}
          >
            <div
              className={`
                flex justify-center items-center gap-2
                rounded-md px-2 py-2
                hover:bg-gray-300/20 hover:text-black dark:hover:text-gray-300`}
            >
              <BanknoteArrowUp size={22} />
              <span>Receita</span>
            </div>
          </Link>
          <Separator
            orientation="vertical"
            className="h-6 border-r border-gray-300 dark:border-card-foreground/20 mr-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="#"
            prefetch={false}
            className={clsx(
              pathname === "/wallets" &&
                "border-b-2 border-blue-600 dark:border-blue-400",
            )}
          >
            <div
              className={`
                flex justify-center items-center gap-2
                rounded-md px-2 py-2
                hover:bg-gray-300/20 hover:text-black dark:hover:text-gray-300`}
            >
              <Wallet size={20} />
              <span>Carteiras</span>
            </div>
          </Link>
        </div>
      </nav>
    </header>
  );
}
