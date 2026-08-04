import zod from "zod";

export const SummaryCategoriesQuerySchema = zod.object({
  referenceMonth: zod.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, {
    error: "O formato deve ser YYYY-MM (ex: 2026-07)",
  }),
  userId: zod.uuidv7({ error: "Forneça um UUID na versão 7" }),
});

export type SummaryCategoriesQuery = zod.infer<
  typeof SummaryCategoriesQuerySchema
>;

export type TCategories = {
  amount: number;
  amountLastMonth: number;
  label: string;
  type: string;
};

export type SummaryCategoriesQueryOutput = {
  incomes: {
    categories: TCategories[];
  };
  expenses: {
    categories: TCategories[];
  };
};
