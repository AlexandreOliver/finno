"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

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
import { useQuery } from "@tanstack/react-query";
import { dashboardQuery } from "@/features/Provider/queryKeys";
import { useSession } from "@/hooks/useSession";
import { format } from "date-fns";
import { DatabaseMinus } from "lucide-react";

// const chartDomain = [weekStart, weekStart + 7 * DAY_MS];
const formatTooltipCurrency = (value: number | string) =>
  formatCurrency(Number(value), { maximumFractionDigits: 2 });

const chartConfig = {
  expenses: {
    color: "red",
    label: "Despesas",
  },
  incomes: {
    color: "green",
    label: "Receitas",
  },
  balance: {
    color: "#3b82f6",
    label: "Saldo",
  },
} satisfies ChartConfig;

export function ChartTransactions() {
  const { user } = useSession();
  const date = format(new Date(), "yyyy-MM");

  const dayFormatter = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    month: "short",
  });

  const formatMonth = (value: number) => dayFormatter.format(new Date(value));

  const { data: summaryPerMonth } = useQuery({
    ...dashboardQuery.all({
      referenceMonth: date,
      userId: user?.id as string,
    }),

    enabled: !!user?.id,

    select: (result) => ({
      ...result.data.financeSummary.summaryPerMonth,
      summaryPerMonth:
        result.data.financeSummary.summaryPerMonth.summaryPerMonth.map(
          (sum) => ({ ...sum, balance: sum.incomes - sum.expenses }),
        ),
    }),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-medium">Anual </CardTitle>
        <CardDescription>
          {summaryPerMonth?.referenceYear ?? ""}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {summaryPerMonth && summaryPerMonth.summaryPerMonth.length > 1 ? (
          <ChartContainer config={chartConfig} className="max-h-70 w-full">
            <LineChart
              accessibilityLayer
              data={summaryPerMonth?.summaryPerMonth}
              margin={{ bottom: 0, left: 15, right: 0, top: 0 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="5, 5, 1, 5" />
              <XAxis
                axisLine={false}
                dataKey="month"
                tickFormatter={formatMonth}
                tickLine={false}
                tickMargin={10}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                hide
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip
                cursor={false}
                content={({ active, payload, label }) => (
                  <ChartTooltipContent
                    active={active}
                    hideLabel
                    label={label}
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
              <Line
                connectNulls
                dataKey="incomes"
                dot={false}
                stroke="var(--color-incomes)"
                strokeLinecap="round"
                strokeWidth={1}
                type="monotone"
              />
              <Line
                dataKey="expenses"
                dot={false}
                stroke="var(--color-expenses)"
                strokeLinecap="round"
                strokeWidth={1}
                type="monotone"
              />
              <Line
                dataKey="balance"
                dot={false}
                stroke="var(--color-balance)"
                strokeLinecap="round"
                strokeWidth={1}
                type="monotone"
              />
            </LineChart>
          </ChartContainer>
        ) : (
          <div className="flex justify-center items-center gap-3 h-70">
            <DatabaseMinus />
            <span className="text-gray-400">Poucos dados</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
