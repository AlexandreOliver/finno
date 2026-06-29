import { createQueryKeys } from "@lukemorales/query-key-factory";
import { findWallets } from "@/app/(dashboard)/dashboard/transaction/actions/findWallets";

export const movementsQuerys = createQueryKeys("movements", {
  owned: (walelletsId: string[]) => ({
    queryKey: [walelletsId],
    contextQueries: {
      query: (query: { date: { start?: string; end?: string } }) => ({
        queryKey: [{ date: query.date }],
        contextQueries: {
          pagination: (limit: number, page: number) => ({
            queryKey: [{ limit, page }],
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
