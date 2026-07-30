import { verifySession } from "@/features/authorization/services/verifysession";
import { DashboardDataQuerySchema } from "@/features/dashboard/query-dashboard-data/dashboard-data.query";
import { DasboardDataQueryHandler } from "@/features/dashboard/query-dashboard-data/dashboard-data.query-handler";
import db from "@/infrastructure/database";
import zod from "zod";

export async function POST(req: Request) {
  const auth = await verifySession();

  if (!auth.isAuth) {
    return Response.json(
      {
        message: "Não está autenticado",
      },
      { status: 401 },
    );
  }

  const body = await req.json();

  const dataFormated = DashboardDataQuerySchema.safeParse(body);

  if (!dataFormated.success) {
    return Response.json(
      {
        message: "Campos não Fornecidos",
        fields: zod.flattenError(dataFormated.error).fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const dashboardData = DasboardDataQueryHandler.create(db);

    const result = await dashboardData.execute(dataFormated.data);

    return Response.json(result);
  } catch (err) {
    const error = err as Error;

    console.error(error);

    return new Response("Um Erro aconteceu", { status: 500 });
  }
}
