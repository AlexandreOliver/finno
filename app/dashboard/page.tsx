import {
  CardsKpis,
  ChartTransactions,
  DetalhamentoReceita,
} from "@/features/dasboard/components";

export default function Page() {
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
        <div className="flex flex-col xl:flex-row">
          <CardsKpis />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-2">
        <div>
          <DetalhamentoReceita />
        </div>
        <div className="col-span-2">
          <ChartTransactions />
        </div>
      </div>
    </section>
  );
}
