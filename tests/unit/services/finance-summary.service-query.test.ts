import { FinanceSummaryQueryService } from "@/features/Services/finance-summary.service-query";
import { describe, expect, test } from "@jest/globals";
import setupTestDb from "../../db-test";
import { walletsIds } from "@/infrastructure/defaultData";

const testDb = setupTestDb();

describe("Finance Summary Query Service", () => {
  const startUseCase = () => new FinanceSummaryQueryService(testDb.db);

  test("#1 - summaryDaysOfMonth: Retorna corretamendo o sumario", async () => {
    const financeSummary = startUseCase();

    const input = {
      walletId: walletsIds,
      referenceMonth: new Date(),
      excludeRefundedFromTotals: true,
    };

    const result = await financeSummary.summaryPerDaysAtMonth(input);

    expect(result.summaryPerDays[0]).toHaveProperty("day");
    expect(result.summaryPerDays[0]).toHaveProperty("incomes");
    expect(result.summaryPerDays[0]).toHaveProperty("expenses");
    expect(result.summaryPerDays[0]).toHaveProperty("balanceAcc");
  });
});
