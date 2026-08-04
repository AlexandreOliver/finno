"use client";

import { SummaryCategoriesQueryOutput } from "@/features/categories/QuerySummaryCategories/summary-categories.query";
import { DasboardDataQueryOutput } from "@/features/dashboard/query-dashboard-data/dashboard-data.query";
import { dashboardQuery } from "@/features/Provider/queryKeys";
import { useSession } from "@/hooks/useSession";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { SkeletonCardsCategories } from "./SkeletonCardsCategories";
import { CardsForCategory } from "./CardsForCategory";

export function SectionCategories() {
  const { user } = useSession();

  const date = format(new Date(), "yyyy-MM");

  const { data, isPending } = useQuery({
    queryKey: ["categories", { userId: user?.id, referenceMonth: date }],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/categories/", {
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

      return response.json() as Promise<SummaryCategoriesQueryOutput>;
    },

    select: (data) => {
      return {
        incomes: {
          categories: data.incomes.categories.map((ctg) => ({
            ...ctg,
            diffPerc:
              ctg.amountLastMonth > 0
                ? ((ctg.amount - ctg.amountLastMonth) / ctg.amountLastMonth) *
                  100
                : 0,
          })),
        },
        expenses: {
          categories: data.expenses.categories.map((ctg) => ({
            ...ctg,
            diffPerc:
              ctg.amountLastMonth > 0
                ? ((ctg.amount - ctg.amountLastMonth) / ctg.amountLastMonth) *
                  100
                : 0,
          })),
        },
      };
    },

    enabled: !!user?.id,
  });

  const { data: financeCurrent } = useQuery({
    queryKey: dashboardQuery.owned(user?.id as string)._ctx.referenceDate(date)
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

    select: (data) => ({
      totalIncomes: data.data.financeSummary.walletsInQuery.current.incomes,
      totalExpenses: data.data.financeSummary.walletsInQuery.current.expenses,
    }),

    enabled: !!user?.id,
  });

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="grid grid-cols-3 space-y-3 border border-card rounded-md p-2 pl-3 min-h-80">
        {isPending ? (
          <SkeletonCardsCategories countCards={5} />
        ) : (
          <CardsForCategory
            data={data?.incomes.categories ?? []}
            total={financeCurrent?.totalIncomes ?? 0}
            type="Entrada"
          />
        )}
      </div>
      <div className="grid grid-cols-3 space-y-3 border border-card rounded-md p-2 pl-3 min-h-80">
        {isPending ? (
          <SkeletonCardsCategories countCards={6} />
        ) : (
          <CardsForCategory
            data={data?.expenses.categories ?? []}
            total={financeCurrent?.totalExpenses ?? 0}
            type="Saida"
          />
        )}
      </div>
    </div>
  );
}
