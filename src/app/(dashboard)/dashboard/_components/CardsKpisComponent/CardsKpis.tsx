import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { CardsKpisContent } from "./CardsKpisContent";
import { dashboardQuery } from "@/features/Provider/queryKeys";
import { DasboardDataQueryHandler } from "@/features/dashboard/query-dashboard-data/dashboard-data.query-handler";
import db from "@/infrastructure/database";

interface CardsKpisProps {
  userId: string;
}

export async function CardsKpis(props: CardsKpisProps) {
  const queryClient = new QueryClient();
  const handlerDashboard = DasboardDataQueryHandler.create(db);

  const date = new Date().toISOString().slice(0, 7); // YYYY-MM
  await queryClient.prefetchQuery({
    queryKey: dashboardQuery.owned(props.userId)._ctx.referenceDate(date)
      .queryKey,
    queryFn: () =>
      handlerDashboard.execute({
        userId: props.userId,
        referenceMonth: date,
      }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CardsKpisContent userId={props.userId} />
    </HydrationBoundary>
  );
}
