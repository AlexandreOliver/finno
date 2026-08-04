import { verifySession } from "@/features/authorization/services/verifysession";
import { SummaryCategoriesQuerySchema } from "@/features/categories/QuerySummaryCategories/summary-categories.query";
import { SummaryCategoriesQueryHandler } from "@/features/categories/QuerySummaryCategories/summary-categories.query-handler";
import db from "@/infrastructure/database";
import zod from "zod";

export async function POST(req: Request) {
  const Auth = await verifySession();

  if (!Auth.isAuth) {
    return Response.json(
      { message: "Usuario nao autenticado" },
      { status: 401 },
    );
  }

  const body = await req.json();

  const dataFormated = SummaryCategoriesQuerySchema.safeParse(body);

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
    const summaryCategories = SummaryCategoriesQueryHandler.create(db);

    const result = await summaryCategories.execute(dataFormated.data);

    return Response.json(result);
  } catch (err) {
    const error = err as Error;
    console.error(error);

    return Response.json(
      {
        message: "Um erro aconteceu",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
