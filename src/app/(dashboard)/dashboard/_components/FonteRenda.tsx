"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig } from "@/components/ui/chart";
import { DasboardDataQueryOutput } from "@/features/dashboard/query-dashboard-data/dashboard-data.query";
import { dashboardQuery } from "@/features/Provider/queryKeys";
import { useSession } from "@/hooks/useSession";
import { formatCurrency } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { DatabaseX } from "lucide-react";
import {
  PieChart,
  Pie,
  PieSectorShapeProps,
  useActiveTooltipDataPoints,
  useIsTooltipActive,
  Sector,
  PieLabelRenderProps,
} from "recharts";

export function FonteRenda() {
  const { user } = useSession();
  const date = format(new Date(), "yyyy-MM");

  const { data } = useQuery({
    queryKey: dashboardQuery.owned(user?.id ?? "")._ctx.referenceDate(date)
      .queryKey,
    queryFn: async () => {
      const response = await fetch("/api/dashboard/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
          referenceMonth: date,
        }),
      });

      if (!response.ok) {
        throw new Error("Houve um erro na requisição");
      }

      return response.json() as Promise<DasboardDataQueryOutput>;
    },
    enabled: !!user?.id,

    select: (result) => ({
      total: result.data.financeSummary.walletsInQuery.current.incomes,
      incomes: result.data.incomes,
    }),
  });

  // return (
  //   <Card className="h-59">
  //     <CardHeader>
  //       <CardTitle>Fontes de Renda</CardTitle>
  //     </CardHeader>
  //     <CardContent
  //       className="h-full gap-0.5 grid"
  //       style={{
  //         gridTemplateColumns: `repeat(${data?.incomes.length}, minmax(0, 1fr))`,
  //       }}
  //     >
  //       {/* Haverá um array com todas as fontes e um card para cada */}
  //       {data?.incomes.map((income) => (
  //         <section
  //           key={income.description}
  //           className="isolate flex gap-[0.5px]"
  //         >
  //           <Separator
  //             orientation="vertical"
  //             className="mb-1 h-auto self-auto border-muted-foreground/50 border-l border-dashed bg-transparent"
  //           />
  //           <div className="pt-2 flex flex-col justify-between w-full">
  //             <div className="ml-0.5">
  //               <div>
  //                 <div className="grid grid-cols-[125px_30px]">
  //                   <p className="text-muted-foreground truncate">
  //                     {income.description}
  //                   </p>
  //                   <p className="text-muted-foreground">{`${Math.floor((income.amount / data.total) * 100)}%`}</p>
  //                 </div>
  //                 <p className="text-xl">
  //                   {formatCurrency(income.amount, {
  //                     maximumFractionDigits: 2,
  //                     currency: "BRL",
  //                   })}
  //                 </p>
  //               </div>
  //             </div>
  //             <div className="bg-gray-400 h-4.5 rounded-md -ml-0.5"></div>
  //           </div>
  //         </section>
  //       ))}
  //     </CardContent>
  //   </Card>
  // );

  const chartConfig = {
    incomes: {
      color: "green",
      label: "Receitas",
    },
  } satisfies ChartConfig;

  const RADIAN = Math.PI / 180;

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    value,
    index,
  }: PieLabelRenderProps) => {
    if (
      cx == null ||
      cy == null ||
      innerRadius == null ||
      outerRadius == null
    ) {
      return null;
    }
    const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
    const ncx = Number(cx);
    const x = ncx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
    const ncy = Number(cy);
    const y = ncy + radius * Math.sin(-(midAngle ?? 0) * RADIAN);

    return (
      <g>
        <text
          x={x}
          y={y}
          fill="white"
          className="text-xs"
          textAnchor={x > ncx ? "start" : "end"}
          dominantBaseline="central"
        >
          {`${data?.incomes[index].description}`}
        </text>
        <text
          x={x}
          y={y - 15}
          className="text-xs"
          fill="white"
          textAnchor={x > ncx ? "start" : "end"}
          dominantBaseline="central"
        >
          {`${formatCurrency(value, { currency: "BRL" })} - ${((percent ?? 1) * 100).toFixed(0)}%`}
        </text>
      </g>
    );
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  const MyCustomPie = (props: PieSectorShapeProps) => {
    const p = useActiveTooltipDataPoints();
    const isAnyPieActive = useIsTooltipActive();
    const isThisPieActive = isAnyPieActive && props.payload === p?.[0];
    let fillOpacity: number;
    if (isAnyPieActive && !isThisPieActive) {
      fillOpacity = 0.5;
    } else {
      fillOpacity = 1;
    }
    return (
      <Sector
        {...props}
        fill={COLORS[props.index % COLORS.length]}
        fillOpacity={fillOpacity}
        style={{ transition: "fill-opacity 0.3s ease" }}
      />
    );
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fontes de Renda</CardTitle>
      </CardHeader>
      <CardContent className="h-75 text-center">
        {data && data.incomes.length > 0 ? (
          <PieChart
            accessibilityLayer
            style={{
              width: "100%",
              height: "100%",
              alignItems: "center",
              aspectRatio: 1,
            }}
            responsive
          >
            <Pie
              dataKey="amount"
              nameKey="description"
              data={data?.incomes}
              label={renderCustomizedLabel}
              outerRadius="80%"
              shape={MyCustomPie}
              fill="green"
              isAnimationActive={true}
            ></Pie>
          </PieChart>
        ) : (
          <div className="flex justify-center items-center gap-3 h-full">
            <DatabaseX />

            <span className="text-gray-400">Sem dados</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
