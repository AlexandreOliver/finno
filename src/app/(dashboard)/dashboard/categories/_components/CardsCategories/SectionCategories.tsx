"use client";

import {
  categoriasQuerys,
  dashboardQuery,
} from "@/features/Provider/queryKeys";
import { useSession } from "@/hooks/useSession";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { SkeletonCardsCategories } from "./SkeletonCardsCategories";
import { CardsForCategory } from "./CardsForCategory";

export function SectionCategories() {
  const { user } = useSession();

  const date = format(new Date(), "yyyy-MM");

  const { data, isPending } = useQuery({
    ...categoriasQuerys.summary({
      userId: user?.id as string,
      referenceMonth: date,
    }),

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
    ...dashboardQuery.all({ userId: user?.id as string, referenceMonth: date }),

    select: (data) => ({
      totalIncomes: data.data.financeSummary.walletsInQuery.current.incomes,
      totalExpenses: data.data.financeSummary.walletsInQuery.current.expenses,
    }),

    enabled: !!user?.id,
  });

  return (
    <div className="flex flex-col gap-1 mt-4">
      <div>
        <span className="text-xl ml-2">Mês Atual</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="border border-card rounded-md p-2 pl-3 max-h-80 overflow-auto scroll-fade-y scrollbar-thumb-accent">
          <div className="flex flex-col md:grid md:grid-cols-3 space-y-3">
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
        </div>
        <div className=" border border-card rounded-md p-2 pl-3 max-h-80 overflow-auto scroll-fade-y scrollbar-thumb-accent">
          <div className="flex flex-col md:grid md:grid-cols-3 space-y-3">
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
      </div>
    </div>
  );
}
