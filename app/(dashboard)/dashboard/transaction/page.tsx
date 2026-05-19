import { Badge } from "@/components/ui/badge";
import { CreateDialog } from "@/features/transactions/components";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";

export const metadata = {
  title: "Transações",
};

export default function Page() {
  const dateFormated = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });
  return (
    <section className="flex flex-col gap-3 w-full">
      <div className="p-3 flex justify-between items-center">
        <div>
          <p className="text-muted-foreground text-md">{dateFormated}</p>
          <p className="text-3xl tracking-tight font-medium">Transações</p>
          <div className="flex gap-2 mt-1">
            <Badge className="dark:bg-green-800 dark:text-green-200 bg-green-400/30 text-green-800">
              Entradas
            </Badge>
            <Badge className="dark:bg-red-800 dark:text-red-200 bg-red-400/30 text-red-600">
              Saidas
            </Badge>
            <Badge className="dark:bg-[#df5e3a] dark:text-[#f3e2dd] bg-[#db7c61]/20 text-[#8f3820]">
              Transferências
            </Badge>
          </div>
        </div>
        <div className="flex gap-4">
          <CreateDialog type="Renda" label="Nova Receita" />
          <CreateDialog type="Despesa" label="Nova Despesa" />
        </div>
      </div>
    </section>
  );
}
