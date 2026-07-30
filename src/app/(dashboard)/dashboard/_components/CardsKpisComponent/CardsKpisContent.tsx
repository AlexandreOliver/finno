"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { dashboardQuery } from "@/features/Provider/queryKeys";
import { SkeletonCardsKpis } from "./SkeletonCardsKpis";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useCallback } from "react";
import { DasboardDataQueryOutput } from "@/features/dashboard/query-dashboard-data/dashboard-data.query";

interface CardsKpisProps {
  userId?: string;
}

export function CardsKpisContent(props: CardsKpisProps) {
  const date = new Date().toISOString().slice(0, 7); // YYYY-MM

  const {
    data: summary,
    isPending,
    isSuccess,
  } = useQuery({
    queryKey: dashboardQuery.owned(props.userId ?? "")._ctx.referenceDate(date)
      .queryKey,
    queryFn: async () => {
      const response = await fetch("http://localhost:3000/api/dashboard/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: props.userId,
          referenceMonth: date,
        }),
      });

      if (!response.ok) {
        throw new Error("Houve um erro na requisição");
      }

      return response.json() as Promise<DasboardDataQueryOutput>;
    },

    select: (data) => {
      return data?.data.financeSummary;
    },
    enabled: !!props.userId,
  });

  const diferencaPercentual = useCallback(
    (inicial: number, final: number): { value: number; label: string } => {
      const variacao = (final - inicial) / inicial;
      const percVariacao = variacao * 100;
      const absPerc = Math.abs(variacao);

      let label;
      if (absPerc < 1) {
        label = Math.abs(Math.trunc(percVariacao)).toString() + "%";
      } else if (absPerc >= 1 && absPerc < 2) {
        label = "+2x";
      } else if (absPerc >= 2 && absPerc < 3) {
        label = "+3x";
      } else {
        label = "+4x";
      }

      return { value: percVariacao, label };
    },
    [],
  );

  let cardGastos = {
    amount: 0,
    diferenceAmount: 0,
    diferencePerc: { label: "", value: 0 },
  };

  let cardEntradas = {
    amount: 0,
    diferenceAmount: 0,
    diferencePerc: { label: "", value: 0 },
  };

  let cardDisponivel = {
    amount: 0,
    // diferenceAmount: 0,
    // diferencePerc: { label: "", value: 0 },
  };

  let cardPatrimonio = {
    netWorth: 34343.0,
    diferenceLastMonth: 0,
    diferencePerc: { label: "", value: 0 },
  };

  if (isSuccess && summary) {
    cardGastos = {
      amount: summary.walletsInQuery.current.expenses,
      diferenceAmount:
        summary.walletsInQuery.current.expenses -
        summary.walletsInQuery.lastMonth.expenses,
      diferencePerc: diferencaPercentual(
        summary.walletsInQuery.lastMonth.expenses,
        summary.walletsInQuery.current.expenses,
      ),
    };

    cardEntradas = {
      amount: summary.walletsInQuery.current.incomes,
      diferenceAmount:
        summary.walletsInQuery.current.incomes -
        summary.walletsInQuery.lastMonth.incomes,
      diferencePerc: diferencaPercentual(
        summary.walletsInQuery.lastMonth.incomes,
        summary.walletsInQuery.current.incomes,
      ),
    };

    cardPatrimonio = {
      netWorth: summary.netWorth.currentAmount,
      diferenceLastMonth:
        summary.netWorth.currentAmount - summary.netWorth.amountLastMoth,
      diferencePerc: diferencaPercentual(
        summary.netWorth.amountLastMoth,
        summary.netWorth.currentAmount,
      ),
    };

    cardDisponivel = {
      amount:
        summary.walletsInQuery.current.incomes -
        summary.walletsInQuery.current.expenses,
    };
  }

  if (isPending) {
    return <SkeletonCardsKpis countCards={4} />;
  } else {
    return (
      <>
        <Card className="overflow-hidden rounded-none xl:col-span-4 ">
          <CardHeader>
            <CardTitle>Gastos Mensais</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-medium">
                {summary
                  ? formatCurrency(cardGastos.amount, {
                      maximumFractionDigits: 2,
                    })
                  : "R$  0,00"}
              </p>
              <p className="text-muted-foreground text-xs">
                {cardGastos.diferenceAmount > 0
                  ? `${formatCurrency(cardGastos.diferenceAmount, { maximumFractionDigits: 2 })} mais do que no mês passado`
                  : `${formatCurrency(cardGastos.diferenceAmount, { maximumFractionDigits: 2, signDisplay: "never" })} menos do que no mês passado`}
              </p>
            </div>
            {cardGastos.diferenceAmount != 0 &&
              cardGastos.amount != 0 &&
              Math.abs(cardGastos.diferencePerc.value) > 1 && (
                <Badge
                  variant="secondary"
                  className={cn({
                    "bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-500":
                      cardGastos.diferencePerc.value > 0,
                    "bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-300":
                      cardGastos.diferencePerc.value < 0,
                  })}
                >
                  <div className="flex gap-1">
                    {cardGastos.diferencePerc.value > 0 ? (
                      <TrendingUp size={14} />
                    ) : (
                      <TrendingDown size={14} />
                    )}
                    <span>{cardGastos.diferencePerc.label}</span>
                  </div>
                </Badge>
              )}
          </CardContent>
        </Card>
        <Card className="overflow-hidden rounded-none xl:col-span-4 ">
          <CardHeader>
            <CardTitle>Entradas Mensais</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-medium">
                {summary
                  ? formatCurrency(cardEntradas.amount, {
                      maximumFractionDigits: 2,
                    })
                  : "R$ 0,00"}
              </div>
              <p className="text-muted-foreground text-xs">
                {cardEntradas.diferenceAmount > 1
                  ? `${formatCurrency(cardEntradas.diferenceAmount, { maximumFractionDigits: 2 })} mais do que no mês passado`
                  : `${formatCurrency(cardEntradas.diferenceAmount, { maximumFractionDigits: 2, signDisplay: "never" })} menos do que no mês passado`}
              </p>
            </div>
            {cardEntradas.diferenceAmount != 0 &&
              cardEntradas.amount != 0 &&
              Math.abs(cardEntradas.diferencePerc.value) > 1 && (
                <Badge
                  variant="secondary"
                  className={cn({
                    "bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-500":
                      cardEntradas.diferencePerc.value < 0,
                    "bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-300":
                      cardEntradas.diferencePerc.value > 0,
                  })}
                >
                  <div className="flex gap-1">
                    {cardEntradas.diferencePerc.value > 0 ? (
                      <TrendingUp size={14} />
                    ) : (
                      <TrendingDown size={14} />
                    )}
                    <span>{cardEntradas.diferencePerc.label}</span>
                  </div>
                </Badge>
              )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-none xl:col-span-4">
          <CardHeader>
            <CardTitle>Patrimônio Líquido</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-medium">
                {summary
                  ? formatCurrency(cardPatrimonio.netWorth, {
                      maximumFractionDigits: 2,
                    })
                  : "R$ 0,00"}
              </div>
              <p className="text-muted-foreground text-xs">
                {`${formatCurrency(cardPatrimonio.diferenceLastMonth, {
                  maximumFractionDigits: 2,
                })} a mais que o último mês`}
              </p>
            </div>

            {cardPatrimonio.diferenceLastMonth != 0 &&
              cardPatrimonio.netWorth != 0 &&
              Math.abs(cardPatrimonio.diferencePerc.value) > 1 && (
                <Badge
                  variant="secondary"
                  className={cn({
                    "bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-500":
                      cardPatrimonio.diferencePerc.value < 0,
                    "bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-300":
                      cardPatrimonio.diferencePerc.value > 0,
                  })}
                >
                  <div className="flex gap-1">
                    {cardPatrimonio.diferencePerc.value > 0 ? (
                      <TrendingUp size={14} />
                    ) : (
                      <TrendingDown size={14} />
                    )}
                    <span>{cardPatrimonio.diferencePerc.label}</span>
                  </div>
                </Badge>
              )}
          </CardContent>
        </Card>
        <Card className="overflow-hidden rounded-none xl:col-span-4">
          <CardHeader>
            <CardTitle>Dísponivel</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="text-2xl font-medium text-center">
              {summary
                ? formatCurrency(cardDisponivel.amount, {
                    maximumFractionDigits: 2,
                  })
                : "R$ 0,00"}
            </div>
            {/* <div> */}
            {/* <p className="text-muted-foreground text-xs">
                {`
                ${card_Disponivel.diff_lastMonth.toLocaleString("pt-BR", {
                  currency: "BRL",
                  style: "currency",
                })} 
                acima de sua média de 30 dias`}
              </p> */}
            {/* </div> */}
            {/* <Badge
              variant="secondary"
              className={cn({
                "bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-300":
                  card_Disponivel.percent_diff >= 1,
                "bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-500":
                  card_Disponivel.percent_diff < 1,
              })}
            >
              {card_Disponivel.percent_diff}%
            </Badge> */}
          </CardContent>
        </Card>
      </>
    );
  }
}
