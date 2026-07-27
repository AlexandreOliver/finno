import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { CardsKpisContent } from "./CardsKpisContent";
import { dashboardQuery } from "@/features/Provider/queryKeys";
import { cache } from "react";
import { getDashboardData } from "../../actions/getDashboardData.action";
import { DashboardDataQuery } from "@/features/dashboard/query-dashboard-data/dashboard-data.query";

export const obterDadosDashboard = cache(
  async (
    props: Pick<DashboardDataQuery, "userId"> & { referenceMonth: string },
  ) => {
    const resultado = await getDashboardData(props);
    return resultado;
  },
);

interface CardsKpisProps {
  userId: string;
}

export async function CardsKpis(props: CardsKpisProps) {
  const queryClient = new QueryClient();

  const date = new Date().toISOString().slice(0, 7); // YYYY-MM
  await queryClient.prefetchQuery({
    queryKey: dashboardQuery.owned(props.userId)._ctx.referenceDate(date)
      .queryKey,
    queryFn: () =>
      obterDadosDashboard({ userId: props.userId, referenceMonth: date }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CardsKpisContent userId={props.userId} />
    </HydrationBoundary>
  );
}
