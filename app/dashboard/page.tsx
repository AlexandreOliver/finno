import { CardsKpis } from "./_components/CardsKpis";

export default function Page() {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex flex-col xl:flex-row">
        <CardsKpis />
      </div>
    </section>
  );
}
