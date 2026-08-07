import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SectionCategories } from "./_components/CardsCategories/SectionCategories";

export const metadata = {
  title: "Categorias",
};

export default function Page() {
  const date = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });
  return (
    <section className="flex flex-col gap-2 w-full">
      <header className="mt-2 flex flex-col justify-center items-center md:items-start md:justify-items-start">
        <p className="text-muted-foreground text-md">{date}</p>
        <p className="text-3xl tracking-tight font-medium ">Categorias</p>
      </header>

      <div className="grid grid-cols-2 gap-4" hidden>
        <div className="h-70 border border-white"></div>
        <div className="h-70 border border-white"></div>
      </div>

      <SectionCategories />
    </section>
  );
}
