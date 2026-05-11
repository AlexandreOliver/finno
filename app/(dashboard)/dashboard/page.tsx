import {
  CardsKpis,
  ChartTransactions,
  FonteRenda,
} from "@/features/dasboard/components";

import { cookies } from "next/headers";

import { verifySession } from "@/features/authorization/services/verifysession";

export default async function Page() {
  const sessionCookie = (await cookies()).get("session_token");

  const authUser = await verifySession(sessionCookie?.value as string);

  return (
    <section className="flex flex-col gap-2">
      <div>
        <div className="p-3 bg-card border-b-4">
          <p className="text-2xl tracking-tight font-medium">
            {`Alexandre Ferreira de Oliveira`}
          </p>
          <p className="text-muted-foreground text-sm">
            {Intl.DateTimeFormat("pt-BR", {
              weekday: "long",
              day: "2-digit",
              month: "short",
              year: "numeric",
            }).format(new Date())}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2 xl:grid-cols-12">
          <div className="xl:col-span-6">
            <CardsKpis />
          </div>
          <div className="xl:col-span-6">
            <FonteRenda />
          </div>
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
