import {
  CardsKpis,
  ChartTransactions,
  FonteRenda,
} from "@/features/dasboard/components";

import { cookies } from "next/headers";

import { verifySession } from "@/features/authorization/services/verifysession";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Dashboard",
};

export default async function Page() {
  const sessionCookie = (await cookies()).get("session_token");

  const authUser = await verifySession(sessionCookie?.value as string);

  const dateFormated = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  return (
    <section className="flex flex-col gap-3 w-full">
      <div className="p-3 flex justify-between items-center">
        <div>
          <p className="text-muted-foreground text-md">{dateFormated}</p>
          <p className="text-3xl tracking-tight font-medium">Dashboard</p>
          <p className="text-xl tracking-tight font-normal">Visão Geral</p>
        </div>
        <div className="flex gap-4">
          <div className="border flex p-2 rounded-md border-green-400 dark:border-green-800 hover:bg-green-400/20">
            <Link
              href="#"
              prefetch={false}
              className="text-green-700 dark:text-green-300"
            >
              <Plus className="inline mr-1" />
              <span>Nova Receita</span>
            </Link>
          </div>
          <div className="border flex p-2 rounded-md border-red-400 dark:border-red-800 hover:bg-red-400/20">
            <Link
              href="#"
              prefetch={false}
              className="text-red-700 dark:text-red-400"
            >
              <Plus className="inline mr-1" />
              <span>Nova Despesa</span>
            </Link>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <div className="xl:col-span-6">
          <CardsKpis />
        </div>
        <div className="xl:col-span-6">
          <FonteRenda />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-2">
        <div className="col-span-7">
          <ChartTransactions />
        </div>
        <div className="col-span-5"></div>
      </div>
    </section>
  );
}
