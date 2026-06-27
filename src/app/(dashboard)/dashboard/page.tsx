import { CardsKpis, ChartTransactions, FonteRenda } from "./_components";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const metadata = {
  title: "Dashboard",
};

export default async function Page() {
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
