import { verifySession } from "@/features/authorization/services/verifysession";
import { FinanceSummaryQueryService } from "@/features/Services/finance-summary.service-query";
import { GetStatementHandler } from "@/features/transactions/statement/get-statement/get-statement.handler";
import { GetStatementQuerySchema } from "@/features/transactions/statement/get-statement/get-statement.query";
import db from "@/infrastructure/database";
import { MovementsRepositoryDrizzle } from "@/infrastructure/repositories/drizzle/drizzle-movements.repository";
import { StatementRepositoryDrizzle } from "@/infrastructure/repositories/queries/drizzle-statement.repository";
import zod from "zod";

export async function POST(request: Request) {
  const auth = await verifySession();

  if (!auth.isAuth) {
    return Response.json(
      {
        message: "Não está autenticado",
      },
      { status: 401 },
    );
  }

  const body = await request.json();

  const dataFormated = GetStatementQuerySchema.safeParse(body);

  if (!dataFormated.success) {
    return Response.json(
      {
        message: "Campos não Fornecidos",
        fields: zod.treeifyError(dataFormated.error),
      },
      { status: 400 },
    );
  }

  try {
    const getStatement = GetStatementHandler.create(
      StatementRepositoryDrizzle.create(db),
      MovementsRepositoryDrizzle.create(db),
      new FinanceSummaryQueryService(db),
    );

    const result = await getStatement.execute(dataFormated.data);

    return Response.json(result);
  } catch (err) {
    const error = err as Error;

    console.error(error);
  }
}
