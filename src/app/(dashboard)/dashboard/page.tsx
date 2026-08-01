import { verifySession } from "@/features/authorization/services/verifysession";
import { FonteRenda } from "./_components/FonteRenda";
import { ChartTransactions } from "./_components/ChartTransactions";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Suspense } from "react";
import { CardsKpis } from "./_components/CardsKpisComponent/CardsKpis";
import { SkeletonCardsKpis } from "./_components/CardsKpisComponent/SkeletonCardsKpis";

export const metadata = {
  title: "Dashboard",
};

export default async function Page() {
  const auth = await verifySession();
  const dateFormated = format(new Date(), "MMMM 'de' yyyy", {
    locale: ptBR,
  });

  return (
    <section className="flex flex-col gap-3 w-full">
      <div className="p-3 flex justify-between items-center">
        <p className="text-3xl tracking-tight font-medium">Dashboard</p>
        <p className="text-xl">
          {dateFormated.charAt(0).toUpperCase() + dateFormated.slice(1)}
        </p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 w-full">
        <Suspense fallback={<SkeletonCardsKpis countCards={4} />}>
          <CardsKpis userId={auth.isAuth ? auth.user.id : ""} />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
        <div className="col-span-6">
          <ChartTransactions />
        </div>
        <div className="col-span-6">
          <FonteRenda />
        </div>
      </div>
    </section>
  );
}
