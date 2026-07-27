import { cache } from "react";
import { getDashboardData } from "./getDashboardData.action";
import { DashboardDataQuery } from "@/features/dashboard/query-dashboard-data/dashboard-data.query";

export const obterDadosDashboard = cache(
  async (
    props: Pick<DashboardDataQuery, "userId"> & { referenceMonth: string },
  ) => {
    const resultado = await getDashboardData(props);
    return resultado;
  },
);
