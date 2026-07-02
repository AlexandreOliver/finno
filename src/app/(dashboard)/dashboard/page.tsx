import { verifySession } from "@/features/authorization/services/verifysession";
import { CardsKpis } from "./_components/CardsKpis";
import { FonteRenda } from "./_components/FonteRenda";
import { ChartTransactions } from "./_components/ChartTransactions";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cookies } from "next/headers";
import { Suspense } from "react";

export const metadata = {
  title: "Dashboard",
};

export default async function Page() {
  const cookieStore = await cookies();

  const auth = await verifySession(
    cookieStore.get("session_token")?.value as string,
  );
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
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        <div className="xl:col-span-6">
          <Suspense fallback={<div>ddd</div>}>
            <CardsKpis userId={auth.isAuth ? auth.user.id : ""} />
          </Suspense>
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
