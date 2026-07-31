import { FinanceSummaryQueryService } from "@/features/Services/finance-summary.service-query";
import { describe, expect, test } from "@jest/globals";
import setupTestDb from "../../db-test";
import { walletsIds } from "@/infrastructure/defaultData";

const testDb = setupTestDb();

describe("Finance Summary Query Service", () => {
  const startUseCase = () => new FinanceSummaryQueryService(testDb.db);

  test("#1 - summaryDaysOfMonth: Retorna corretamendo o sumário por dia de um mes", async () => {
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

  test("#1 - summaryPerMonthAtYear: Retorna corretamento o sumário por mes de um ano", async () => {
    const financeSummary = startUseCase();

    const input = {
      walletIds: walletsIds,
      referenceYear: new Date().getFullYear(),
      excludeRefundedFromTotals: true,
    };

    const result = await financeSummary.summaryPerMonthAtYear(input);

    expect(result.referenceYear).toStrictEqual(input.referenceYear);
    expect(result.summaryPerMonth).toBeInstanceOf(Array);
    expect(result.summaryPerMonth).toHaveLength(7);

    expect(result.summaryPerMonth[0]).toHaveProperty("month");
    expect(result.summaryPerMonth[0].month).toHaveLength(24);

    expect(result.summaryPerMonth[0]).toHaveProperty("incomes");
    expect(result.summaryPerMonth[0]).toHaveProperty("expenses");
  });

  test("#2 - summaryPerMonthAtYear: Da erro quando um ano no futuro é fornecido", async () => {
    const financeSummary = startUseCase();

    const input = {
      walletIds: walletsIds,
      referenceYear: new Date().getFullYear() + 1,
      excludeRefundedFromTotals: true,
    };

    expect(financeSummary.summaryPerMonthAtYear(input)).rejects.toThrow(
      `O campo Year não pode ser acima de ${input.referenceYear}`,
    );
  });
});
