"use client";

import Link from "next/link";
import { BanknoteArrowDown, BanknoteArrowUp, Home, Wallet } from "lucide-react";
import { Separator } from "@base-ui/react";

export function NavBar() {
  return (
    <header className="pt-2 flex justify-center">
      <nav className="flex gap-1 text-md rounded-t-md bg-card px-2 py-1">
        <div className="flex items-center gap-2">
          <Link href="#" prefetch={false}>
            <div className="flex rounded-md justify-center items-center gap-2 px-1 py-2 hover:bg-gray-300 hover:text-black">
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
          <Link href="#" prefetch={false}>
            <div className="flex rounded-md justify-center items-center gap-2 px-1 py-2 hover:bg-gray-300 hover:text-black">
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
          <Link href="#" prefetch={false}>
            <div className="flex rounded-md justify-center items-center gap-2 px-1 py-2 hover:bg-gray-300 hover:text-black">
              <BanknoteArrowUp size={22} />
              <span>Home</span>
            </div>
          </Link>
          <Separator
            orientation="vertical"
            className="h-6 border-r border-gray-300 dark:border-card-foreground/20 mr-1"
          />
        </div>
        <Link href="#" prefetch={false}>
          <div className="flex rounded-md justify-center items-center gap-2 px-1 py-2 hover:bg-gray-300 hover:text-black">
            <Wallet size={20} />
            <span>Carteiras</span>
          </div>
        </Link>
      </nav>
    </header>
  );
}
