"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Tags, TrendingUp, Wallet, ArrowUpDown } from "lucide-react";
import { Separator } from "@base-ui/react";
import clsx from "clsx";

export function NavBar() {
  const pathname = usePathname();

  const links = [
    {
      label: "Home",
      link: "/dashboard",
      icon: <Home size={20} />,
    },
    {
      label: "Transações",
      link: "/dashboard/transaction",
      icon: <ArrowUpDown size={22} />,
    },
    {
      label: "Carteiras",
      link: "/wallets",
      icon: <Wallet size={20} />,
    },
    {
      label: "Categorias",
      link: "/categories",
      icon: <Tags size={20} />,
    },
    {
      label: "Investimentos",
      link: "/investments",
      icon: <TrendingUp size={20} />,
    },
  ];

  return (
    <header className="flex justify-center">
      <nav className="flex gap-1 text-md rounded-b-md bg-card px-2 py-1">
        {links.map((navlink) => (
          <div key={navlink.label} className="flex items-center gap-2 group">
            <Link
              href={navlink.link}
              prefetch={false}
              className={clsx(
                pathname === `${navlink.link}` &&
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
                {navlink.icon}
                <span className="hidden md:block">{navlink.label}</span>
              </div>
            </Link>
            <Separator
              orientation="vertical"
              className="h-6 border-r border-gray-300 dark:border-card-foreground/20 mr-1 group-last:hidden"
            />
          </div>
        ))}
      </nav>
    </header>
  );
}
