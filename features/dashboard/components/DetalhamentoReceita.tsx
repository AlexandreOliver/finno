"use client";

import * as React from "react";
import { Label, Pie, PieChart, Sector } from "recharts";
import type { PieSectorShapeProps } from "recharts/types/polar/Pie";
import { DateRangeComponent } from "@/features/dashboard/components/DateRangeComponent";
import { type DateRange } from "react-day-picker";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const description = "An interactive pie chart";

const incomes = [
  { name: "salario", amount: 1232.45, fill: "var(--chart-1)" },
  { name: "freelancer", amount: 320.34, fill: "var(--chart-2)" },
  { name: "dividendos", amount: 230.34, fill: "var(--chart-3)" },
  { name: "doacao", amount: 30.34, fill: "var(--chart-4)" },
];

const chartConfig = {
  salario: {
    label: "Salario",
    color: "var(--chart-1)",
  },
  freelancer: {
    label: "Frelancer",
    color: "var(--chart-2)",
  },
  dividendos: {
    label: "Dividendos",
    color: "var(--chart-3)",
  },
  doacao: {
    label: "Doacao",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export function DetalhamentoReceita() {
  const id = "pie-interactive";
  const hoje = new Date();
  const [activeIncome, setActiveIncome] = React.useState<string | null>(
    incomes[0].name.charAt(0).toUpperCase() + incomes[0].name.slice(1),
  );
  const [currentInterval, setInterval] = React.useState<DateRange | undefined>({
    from: new Date(hoje.getFullYear(), hoje.getMonth(), 1),
    to: hoje,
  });

  const activeIndex = React.useMemo(
    () =>
      incomes.findIndex((item) => item.name === activeIncome?.toLowerCase()),
    [activeIncome],
  );
  // a [] vazia talvez faça o nome das rendas nao atualizar automaticamente a cada consulta, ent esteja atento a isso.
  const incomeNames = React.useMemo(() => incomes.map((item) => item.name), []);

  const renderPieShape = React.useCallback(
    ({ index, outerRadius = 0, ...props }: PieSectorShapeProps) => {
      if (index === activeIndex) {
        return (
          <g>
            <Sector {...props} outerRadius={outerRadius + 5} />
            <Sector
              {...props}
              outerRadius={outerRadius + 12}
              innerRadius={outerRadius + 8}
            />
          </g>
        );
      }

      return <Sector {...props} outerRadius={outerRadius} />;
    },
    [activeIndex],
  );

  // console.log(activeIncome);
  // console.log(activeIndex);
  // console.log(incomeNames);

  return (
    <Card data-chart={id} className="flex flex-col">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle>Detalhamento da Renda</CardTitle>
          <CardDescription>
            {/*`${format(currentInterval?.from as Date, "LLLL", { locale: ptBR })} - 
            ${format(currentInterval?.to as Date, "LLLL", { locale: ptBR })} ${currentInterval?.from?.getFullYear()}`*/}
            <DateRangeComponent
              interval={currentInterval}
              setInterval={setInterval}
            />
          </CardDescription>
        </div>
        <Select value={activeIncome} onValueChange={setActiveIncome}>
          <SelectTrigger
            className="ml-auto h-7 w-32.5 rounded-lg pl-2.5 hover:bg-gray-200"
            aria-label="Selecione um valor"
          >
            <SelectValue placeholder="Selecione o nome" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {incomeNames.map((key) => {
              const nameFormted = key.charAt(0).toUpperCase() + key.slice(1);
              const config = chartConfig[key as keyof typeof chartConfig];

              if (!config) {
                return null;
              }

              return (
                <SelectItem
                  key={nameFormted}
                  value={nameFormted}
                  className="rounded-lg [&_span]:flex"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-xs"
                      style={{
                        backgroundColor: config.color,
                      }}
                    />
                    {config?.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-75"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={incomes}
              dataKey="amount"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
              shape={renderPieShape}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-lg font-light"
                        >
                          {incomes[activeIndex].amount.toLocaleString("pt-BR", {
                            maximumFractionDigits: 2,
                          })}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-[15px]"
                        >
                          Reais
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// export function DetalhamentoReceita() {
//   const incomes = [
//     {
//       name: "Salário",
//       amount: 1232.45,
//       perc: 0.7,
//     },
//     {
//       name: "Freelancer",
//       amount: 320.34,
//       perc: 0.2,
//     },
//     {
//       name: "Dividendos",
//       amount: 230.34,
//       perc: 0.1,
//     },
//     {
//       name: "Doação",
//       amount: 30.34,
//       perc: 0.1,
//     },
//   ];
//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Detalhamento de Receita</CardTitle>
//       </CardHeader>
//       <CardContent className={`grid grid-cols-1 md:grid-cols-4`}>
//         <div className="h-12"></div>
//         {/*incomes.map((income) => (
//           <div key={income.amount} className="flex gap-[0.5px]">
//             <Separator
//               orientation="vertical"
//               className="mb-1 h-auto self-auto border-muted-foreground/50 border-l border-dashed bg-transparent "
//             />
//             <div className={`flex flex-col flex-1 justify-between min-h-24`}>
//               <div>
//                 <p
//                   key={income.name}
//                   className="wrap-break-word text-muted-foreground text-xs"
//                 >
//                   {income.name}
//                 </p>
//                 <p className="font-heading text-lg leading-none tracking-tight">
//                   {income.amount.toLocaleString("pt-BR", {
//                     style: "currency",
//                     currency: "BRL",
//                     minimumFractionDigits: 2,
//                   })}
//                 </p>
//               </div>
//               <div className=" bg-chart-3 rounded-md h-5 min-w-full"></div>
//             </div>
//           </div>
//         ))*/}
//       </CardContent>
//     </Card>
//   );
// }
