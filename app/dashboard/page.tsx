import {
  CardsKpis,
  ChartTransactions,
  DetalhamentoReceita,
} from "@/features/dasboard/components";

export default function Page() {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex flex-col xl:flex-row">
        <CardsKpis />
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
