import { describe, expect, test } from "@jest/globals";
import { DasboardDataQueryHandler } from "@/features/dashboard/query-dashboard-data/dashboard-data.query-handler";
import { DashboardDataQuery } from "@/features/dashboard/query-dashboard-data/dashboard-data.query";
// import { DashboardDataRepository } from "@/features/dashboard/query-dashboard-data/dashboard-data.interface";
import setupTestDb from "../../db-test";
import { seed_users } from "@/infrastructure/defaultData";

const dbTest = setupTestDb();

describe("Caso de uso - Dashboard Data Handler", () => {
  const startUseCase = () => DasboardDataQueryHandler.create(dbTest.db);

  test("Recebe os dados de entrada e da um retorno valido", async () => {
    const dashboardData = startUseCase();

    const input: DashboardDataQuery = {
      referenceMonth: new Date(),
      userId: seed_users[0].id,
    };

    const result = await dashboardData.execute(input);

    expect(result).toStrictEqual({
      month: new Date().toLocaleString("pt-BR", { month: "long" }),
      data: {
        financeSummary: {
          walletsInQuery: {
            current: {
              incomes: 4089.69,
              expenses: 735.91,
            },
            lastMonth: {
              incomes: 4495.13,
              expenses: 413.78,
            },
          },
          netWorth: {
            currentAmount: 14427.55,
            amountLastMoth: 11073.77,
          },
        },
      },
    });
  });
});
