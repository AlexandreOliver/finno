import { FonteRenda } from "./_components/FonteRenda";
import { ChartTransactions } from "./_components/ChartTransactions";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CardsKpis } from "./_components/CardsKpisComponent/CardsKpis";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Dashboard",
};

export default async function Page(props: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await props.searchParams;

  if (!params.referenceMonth) {
    const newParams = new URLSearchParams(params);

    newParams.set("referenceMonth", format(new Date(), "yyyy-MM"));

    redirect(`/dashboard?${newParams.toString()}`);
  }

  const dateFormated = format(new Date(params.referenceMonth), "MMMM',' yyyy", {
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
        <CardsKpis />
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
