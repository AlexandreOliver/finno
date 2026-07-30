import zod from "zod";

export const GetStatementQuerySchema = zod.object({
  walletId: zod
    .uuidv7({ error: "Forneça uma lista com uuids na versão 7" })
    .array(),
  pagination: zod.object({
    limit: zod
      .number({ error: "Forneça um numero" })
      .gt(0, { error: "O limite precisa ser maior do que 0" }),
    page: zod
      .number({ error: "Forneça um numero" })
      .gt(0, { error: "O page precisa ser maior do que 0" }),
  }),
  filters: zod.object({
    date: zod.object({
      start: zod.iso.date({
        error: "O formato deve ser YYYY-MM-DD (ex: 2026-07-01)",
      }),
      end: zod.iso.date({
        error: "O formato deve ser YYYY-MM-DD (ex: 2026-07-01)",
      }),
    }),
  }),
});

export interface GetStatementQuery {
  walletId: string[];
  pagination: { limit: number; page: number };
  filters: { date: { start: string; end: string } };
}
