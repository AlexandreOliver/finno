import { createQueryKeys } from "@lukemorales/query-key-factory";
import { StatementOutput } from "../transactions/statement/get-statement/get-statement.handler";

export const movementsQuerys = createQueryKeys("movements", {
  owned: (walletsId: string[]) => ({
    queryKey: [walletsId],
    contextQueries: {
      query: (query: { date: { start?: string; end?: string } }) => ({
        queryKey: [{ date: query.date }],
        contextQueries: {
          // eslint-disable-next-line @tanstack/query/exhaustive-deps
          pagination: (limit: number, page: number) => ({
            queryKey: [{ limit, page }],
            queryFn: async () => {
              const response = await fetch("/api/dashboard/transactions", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  walletId: walletsId,
                  pagination: {
                    limit: limit,
                    page: page,
                  },
                  filters: query,
                }),
              });

              if (!response.ok) {
                throw new Error("Houve um erro na requisição");
              }

              return response.json() as Promise<StatementOutput>;
            },

            enabled: !!walletsId,
          }),
        },
      }),
    },
  }),
});

export const categoriasQuerys = createQueryKeys("categorias", {
  all: {
    queryKey: null,
  },

  withOwned: (userId: string) => ({
    queryKey: [{ userId }],
  }),
});

export const walletsQuerys = createQueryKeys("wallets", {
  owned: (userId: string) => ({
    queryKey: [userId],
  }),
});

export const dashboardQuery = createQueryKeys("dashboard", {
  owned: (userId: string) => ({
    queryKey: [userId],
    contextQueries: {
      referenceDate: (referenceDate: string) => ({
        queryKey: [referenceDate],
      }),
    },
  }),
});
