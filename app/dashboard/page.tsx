import { CardsKpis } from "./_components/CardsKpis";
import { DetalhamentoReceita } from "./_components/DetalhamentoReceita";

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
      </div>
    </section>
  );
}
