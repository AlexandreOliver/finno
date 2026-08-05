"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardQuery } from "@/features/Provider/queryKeys";
import { useSession } from "@/hooks/useSession";
import { formatCurrency } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { DatabaseSearch, DatabaseX } from "lucide-react";
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

  const { data, isPending } = useQuery({
    ...dashboardQuery.all({
      referenceMonth: date,
      userId: user?.id as string,
    }),

    enabled: !!user?.id,

    select: (result) => ({
      total: result.data.financeSummary.walletsInQuery.current.incomes,
      incomes: result.data.incomes,
    }),
  });

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
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Fontes de Renda</CardTitle>
      </CardHeader>
      <CardContent className="h-70 text-center">
        {data && data.incomes.length > 0 ? (
          <PieChart
            accessibilityLayer
            className="h-70"
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
          <div className="flex justify-center items-center gap-3 h-70">
            {isPending ? <DatabaseSearch /> : <DatabaseX />}
            <span className="text-gray-400">
              {isPending ? "Pesquisando..." : "Sem dados"}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
