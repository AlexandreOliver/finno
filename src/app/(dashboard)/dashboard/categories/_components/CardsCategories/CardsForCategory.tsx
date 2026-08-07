"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePercentLabel } from "@/hooks/usePercentlLabel";
import { cn, formatCurrency } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import { randomBytes } from "node:crypto";
import { useCallback } from "react";

interface Category {
  diffPerc: number;
  amount: number;
  amountLastMonth: number;
  label: string;
  type: string;
}

export function CardsForCategory({
  data,
  total,
  type,
}: {
  data: Category[];
  total: number;
  type: "Saida" | "Entrada";
}) {
  let badgeColor;

  if (type === "Saida") {
    badgeColor =
      "bg-red-500/10 text-red-700 dark:bg-red-600/60 dark:text-red-100";
  } else {
    badgeColor =
      "bg-green-500/10 text-green-700 dark:bg-green-700/60 dark:text-green-100";
  }

  const diferencaPercentual = usePercentLabel();

  return data.map((ctg) => (
    <Card
      key={ctg.label + randomBytes(7).toString("ascii")}
      className="md:w-50 md:h-35 bg-card/40"
    >
      <CardHeader>
        <CardTitle className="text-md md:text-xl truncate">
          {ctg.label}
        </CardTitle>
        <CardDescription>
          <Badge className={badgeColor}>
            <span className="text-[9px] md:text-sm">{type}</span>
          </Badge>
        </CardDescription>
        <CardAction>
          <Badge>
            <span className="text-[9px] md:text-sm">
              {Math.round((ctg.amount / total) * 100)}%
            </span>
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="flex justify-center items-center">
        <div className="flex gap-2 items-start">
          <span className="text-lg md:text-2xl">
            {formatCurrency(ctg.amount, {
              currency: "BRL",
              maximumFractionDigits: 2,
            })}
          </span>

          {Math.abs(ctg.diffPerc) >= 1 && (
            <Badge
              className={cn("p-1 bg-transparent", {
                "text-green-200":
                  (type === "Saida" && ctg.diffPerc < 0) ||
                  (type === "Entrada" && ctg.diffPerc >= 0),
                "text-red-400":
                  (type === "Saida" && ctg.diffPerc > 0) ||
                  (type === "Entrada" && ctg.diffPerc < 0),
              })}
            >
              {ctg.diffPerc > 0 ? (
                <TrendingUp size={10} />
              ) : (
                <TrendingDown size={10} />
              )}
              <span className="text-[10px]">
                {diferencaPercentual(ctg.amountLastMonth, ctg.amount).label}
              </span>
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  ));
}
