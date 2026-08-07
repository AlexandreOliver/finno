"use client";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { dashboardQuery } from "@/features/Provider/queryKeys";
import { SkeletonCardsKpis } from "./SkeletonCardsKpis";
import { TrendingDown, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePercentLabel } from "@/hooks/usePercentlLabel";

interface CardsKpisProps {
  userId?: string;
}

export function CardsKpis(props: CardsKpisProps) {
  const date = format(new Date(), "yyyy-MM");
  const isMobile = useIsMobile();

  const {
    data: summary,
    isPending,
    isSuccess,
  } = useQuery({
    ...dashboardQuery.all({
      referenceMonth: date,
      userId: props.userId as string,
    }),

    select: (data) => {
      return data?.data.financeSummary;
    },
    enabled: !!props.userId,
  });

  const diferencaPercentual = usePercentLabel();

  let cardGastos = {
    amount: 0,
    diferenceAmount: 0,
    diferencePerc: { label: "", value: 0 },
    isVisibleBadge: false,
  };

  let cardEntradas = {
    amount: 0,
    diferenceAmount: 0,
    diferencePerc: { label: "", value: 0 },
    isVisibleBadge: false,
  };

  let cardDisponivel = {
    amount: 0,
    diferenceAmount: 0,
    diferencePerc: { label: "", value: 0 },
    isVisibleBadge: false,
  };

  let cardPatrimonio = {
    netWorth: 0,
    diferenceLastMonth: 0,
    diferencePerc: { label: "", value: 0 },
    isVisibleBadge: false,
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
      isVisibleBadge: false,
    };

    cardGastos.isVisibleBadge =
      cardGastos.diferenceAmount != 0 &&
      cardGastos.amount != 0 &&
      Math.abs(cardGastos.diferencePerc.value) > 1 &&
      summary.walletsInQuery.lastMonth.expenses != 0;

    cardEntradas = {
      amount: summary.walletsInQuery.current.incomes,
      diferenceAmount:
        summary.walletsInQuery.current.incomes -
        summary.walletsInQuery.lastMonth.incomes,
      diferencePerc: diferencaPercentual(
        summary.walletsInQuery.lastMonth.incomes,
        summary.walletsInQuery.current.incomes,
      ),
      isVisibleBadge: false,
    };

    cardEntradas.isVisibleBadge =
      cardEntradas.diferenceAmount != 0 &&
      cardEntradas.amount != 0 &&
      Math.abs(cardEntradas.diferencePerc.value) > 1 &&
      summary.walletsInQuery.lastMonth.incomes != 0;

    cardPatrimonio = {
      netWorth: summary.netWorth.currentAmount,
      diferenceLastMonth:
        summary.netWorth.currentAmount - summary.netWorth.amountLastMoth,
      diferencePerc: diferencaPercentual(
        summary.netWorth.amountLastMoth,
        summary.netWorth.currentAmount,
      ),
      isVisibleBadge: false,
    };

    cardPatrimonio.isVisibleBadge =
      cardPatrimonio.diferenceLastMonth != 0 &&
      cardPatrimonio.netWorth != 0 &&
      Math.abs(cardPatrimonio.diferencePerc.value) > 1 &&
      summary.netWorth.amountLastMoth != 0;

    cardDisponivel = {
      amount:
        summary.walletsInQuery.current.incomes -
        summary.walletsInQuery.current.expenses,
      diferenceAmount:
        summary.walletsInQuery.current.incomes -
        summary.walletsInQuery.current.expenses -
        (summary.walletsInQuery.lastMonth.incomes -
          summary.walletsInQuery.lastMonth.expenses),

      diferencePerc: diferencaPercentual(
        summary.walletsInQuery.lastMonth.incomes -
          summary.walletsInQuery.lastMonth.expenses,
        summary.walletsInQuery.current.incomes -
          summary.walletsInQuery.current.expenses,
      ),
      isVisibleBadge: false,
    };

    cardDisponivel.isVisibleBadge =
      cardDisponivel.diferenceAmount != 0 &&
      cardDisponivel.amount != 0 &&
      Math.abs(cardDisponivel.diferencePerc.value) > 1 &&
      summary.walletsInQuery.lastMonth.incomes -
        summary.walletsInQuery.lastMonth.expenses !=
        0;
  }

  return isPending ? (
    <SkeletonCardsKpis countCards={4} />
  ) : (
    <>
      <Card className="">
        <CardHeader>
          <CardTitle>Gastos</CardTitle>
          <CardAction>
            {cardGastos.isVisibleBadge && (
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
          </CardAction>
        </CardHeader>
        <CardContent className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-medium">
              {summary
                ? formatCurrency(cardGastos.amount, {
                    maximumFractionDigits: 2,
                  })
                : "R$ 0,00"}
            </p>
            {summary && summary.walletsInQuery.lastMonth.expenses != 0 && (
              <p className="text-muted-foreground text-xs">
                {cardGastos.diferenceAmount > 0
                  ? `${formatCurrency(cardGastos.diferenceAmount, { maximumFractionDigits: 2 })} mais do que no mês passado`
                  : `${formatCurrency(cardGastos.diferenceAmount, { maximumFractionDigits: 2, signDisplay: "never" })} menos do que no mês passado`}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      <Card className="">
        <CardHeader>
          <CardTitle>Entradas</CardTitle>
          <CardAction>
            {cardEntradas.isVisibleBadge && (
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
          </CardAction>
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
            {summary && summary.walletsInQuery.lastMonth.incomes != 0 && (
              <p className="text-muted-foreground text-xs">
                {cardEntradas.diferenceAmount > 1
                  ? `${formatCurrency(cardEntradas.diferenceAmount, { maximumFractionDigits: 2 })} mais do que no mês passado`
                  : `${formatCurrency(cardEntradas.diferenceAmount, { maximumFractionDigits: 2, signDisplay: "never" })} menos do que no mês passado`}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      <Card className="">
        <CardHeader>
          <CardTitle>Dísponivel</CardTitle>
          <CardAction>
            {cardDisponivel.isVisibleBadge && (
              <Badge
                variant="secondary"
                className={cn({
                  "bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-500":
                    cardDisponivel.diferencePerc.value < 0,
                  "bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-300":
                    cardDisponivel.diferencePerc.value > 0,
                })}
              >
                <div className="flex gap-1">
                  {cardDisponivel.diferencePerc.value > 0 ? (
                    <TrendingUp size={14} />
                  ) : (
                    <TrendingDown size={14} />
                  )}
                  <span>{cardDisponivel.diferencePerc.label}</span>
                </div>
              </Badge>
            )}
          </CardAction>
        </CardHeader>
        <CardContent className="flex items-end justify-between">
          <div className="text-2xl font-medium">
            <p>
              {summary
                ? formatCurrency(cardDisponivel.amount, {
                    maximumFractionDigits: 2,
                  })
                : "R$ 0,00"}
            </p>
            {summary &&
              summary.walletsInQuery.lastMonth.incomes -
                summary.walletsInQuery.lastMonth.expenses !=
                0 && (
                <p className="text-muted-foreground text-xs">
                  {cardDisponivel.diferenceAmount > 1
                    ? `${formatCurrency(cardDisponivel.diferenceAmount, { maximumFractionDigits: 2 })} mais do que no mês passado`
                    : `${formatCurrency(cardDisponivel.diferenceAmount, { maximumFractionDigits: 2, signDisplay: "never" })} menos do que no mês passado`}
                </p>
              )}
          </div>
        </CardContent>
      </Card>
      <Card className="">
        <CardHeader>
          <CardTitle>
            {isMobile ? "Patrimônio" : "Patrimônio Líquido"}
          </CardTitle>
          <CardAction>
            {cardPatrimonio.isVisibleBadge && (
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
          </CardAction>
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
            {summary && summary.netWorth.amountLastMoth != 0 && (
              <p className="text-muted-foreground text-xs">
                {`${formatCurrency(cardPatrimonio.diferenceLastMonth, {
                  maximumFractionDigits: 2,
                })} a mais que o último mês`}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
