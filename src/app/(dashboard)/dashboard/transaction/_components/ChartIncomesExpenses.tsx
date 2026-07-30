"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils";
import { useSession } from "@/hooks/useSession";
import { useWallets } from "@/features/dashboard/hooks/useWallets";
import { movementsQuerys } from "@/features/Provider/queryKeys";
import { useRangeDate } from "@/features/transactions/hooks/use-rangeDate";
import { useQuery } from "@tanstack/react-query";

import { useMemo } from "react";
import { ChartAreaIcon } from "lucide-react";

const dayFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
});

const formatDay = (value: number) => dayFormatter.format(new Date(value));

const formatTooltipCurrency = (value: number | string) =>
  formatCurrency(Number(value), { noDecimals: true });

const chartConfig = {
  expenses: {
    color: "red",
    label: "Saidas",
  },
  incomes: {
    color: "green",
    label: "Entradas",
  },
  balanceAcc: {
    color: "blue", // #dc2626
    label: "Saldo",
  },
} satisfies ChartConfig;

export function ChartIncomesExpenses() {
  const { user } = useSession();
  const { range } = useRangeDate();

  const { data: wallets } = useWallets(user?.id as string);
  const walletsId = wallets?.map((w) => w.id) ?? [];

  const { data, isPending } = useQuery({
    ...movementsQuerys
      .owned(walletsId)
      ._ctx.query({
        date: {
          start: range.start.toISOString().slice(0, 10),
          end: range.end.toISOString().slice(0, 10),
        },
      })
      ._ctx.pagination(10, 1),

    throwOnError: (err) => {
      throw err;
    },

    select: (data) => {
      return data.summaryPerDays.map((mov) => {
        return {
          ...mov,
          date: mov.day,
        };
      });
    },

    placeholderData: (data) => data,
  });

  const chartWidth = useMemo(
    () => Math.max((data?.length ?? 7) * 80, 800),
    [data],
  );

  const saldos = useMemo(() => data?.map((d) => d.balanceAcc) ?? [0], [data]);
  const maxSaldo = useMemo(() => Math.max(...saldos, 0), [saldos]);
  const minSaldo = useMemo(() => Math.min(...saldos, 0), [saldos]);

  let zeroOffset = 0;
  if (maxSaldo !== minSaldo) {
    zeroOffset = (maxSaldo / (maxSaldo - minSaldo)) * 100;
  }

  return (
    <Card className="w-2/3">
      <CardHeader>
        <CardTitle className="font-medium">{`Visão Geral - ${range.start.toLocaleDateString("pt-BR", { month: "long" })}`}</CardTitle>
        <CardDescription>Despesas x Receitas</CardDescription>
      </CardHeader>

      <CardContent>
        {!isPending ? (
          <div className="w-full overflow-x-auto pb-4">
            <div style={{ width: `${chartWidth}px`, height: "250px" }}>
              <ChartContainer config={chartConfig} className="h-full w-full">
                <ComposedChart
                  data={data}
                  margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
                  barGap={4}
                  barCategoryGap="15%"
                >
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="5, 5, 1, 5"
                  />

                  <defs>
                    <linearGradient id="lineColor" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset={`${zeroOffset}%`}
                        stopColor="#3b82f6"
                        stopOpacity={2}
                      />
                      <stop
                        offset={`${zeroOffset}%`}
                        stopColor="#dc2626"
                        stopOpacity={1}
                      />
                    </linearGradient>
                  </defs>

                  <XAxis
                    tickFormatter={formatDay}
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                  />
                  <YAxis
                    hide
                    axisLine={false}
                    tickLine={false}
                    tickMargin={5}
                    tick={{ fontSize: 12 }}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={({ active, payload }) => (
                      <ChartTooltipContent
                        active={active}
                        // hideLabel
                        label={"Transações"}
                        payload={payload?.map((item) => ({
                          ...item,
                          value:
                            typeof item.value === "number"
                              ? formatTooltipCurrency(item.value)
                              : item.value,
                        }))}
                      />
                    )}
                  />

                  <Bar
                    dataKey="incomes"
                    fill={chartConfig.incomes.color}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={15}
                  />
                  <Bar
                    dataKey="expenses"
                    fill={chartConfig.expenses.color}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={15}
                  />
                  <Line
                    connectNulls
                    dataKey="balanceAcc"
                    dot={false}
                    activeDot={false}
                    stroke="url(#lineColor)"
                    strokeLinecap="round"
                    strokeWidth={1}
                    type="monotone"
                  />
                </ComposedChart>
              </ChartContainer>
            </div>
          </div>
        ) : (
          <div
            style={{ height: "250px" }}
            className="flex justify-center items-center gap-2"
          >
            <ChartAreaIcon />
            <span>Gerando gráfico...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
