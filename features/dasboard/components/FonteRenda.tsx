import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@base-ui/react";

export function FonteRenda() {
  const data = {
    count: 3,
    incomes: [
      { nome: "Salario", amount: 3434.09, percent: 0.86 },
      { nome: "Frelancer", amount: 344.09, percent: 0.07 },
      { nome: "Outros", amount: 334.09, percent: 0.07 },
    ],
  };
  return (
    <Card className="h-59">
      <CardHeader>
        <CardTitle>Fontes de Renda</CardTitle>
      </CardHeader>
      <CardContent
        className="h-full gap-0.5 grid"
        style={{ gridTemplateColumns: `repeat(${data.count}, minmax(0, 1fr))` }}
      >
        {/* Haverá um array com todas as fontes e um card para cada */}
        {data.incomes.map((income) => (
          <section key={income.nome} className="isolate flex gap-[0.5px]">
            <Separator
              orientation="vertical"
              className="mb-1 h-auto self-auto border-muted-foreground/50 border-l border-dashed bg-transparent"
            />
            <div className="pt-2 flex flex-col justify-between w-full">
              <div className="ml-0.5">
                <div>
                  <p className="text-muted-foreground">{`${income.nome} - ${Math.floor(income.percent * 100)}%`}</p>
                  <p className="text-xl">R$ {income.amount}</p>
                </div>
              </div>
              <div className="bg-gray-400 h-4.5 rounded-md -ml-0.5"></div>
            </div>
          </section>
        ))}
      </CardContent>
    </Card>
  );
}
