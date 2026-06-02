/* eslint-disable @tanstack/query/exhaustive-deps */
import { createQueryKeys } from "@lukemorales/query-key-factory";
import { getMovementsService } from "../transactions/services/getMovements";
import { findCategories } from "../transactions/services/findCategories";
import { findWallets } from "../transactions/services/findWallets";

export const movementsQuerys = createQueryKeys("movements", {
  owned: (walelletsId: string[]) => ({
    queryKey: [walelletsId],
    queryFn: () =>
      getMovementsService({
        walletId: walelletsId,
        pagination: { limit: 100, page: 1 },
      }),
    contextQueries: {
      query: (query: { date: { start?: string; end?: string } }) => ({
        queryKey: [{ query }],
        queryFn: () =>
          getMovementsService({
            walletId: walelletsId,
            query,
            pagination: { limit: 100, page: 1 },
          }),
        contextQueries: {
          pagination: (limit: number, page: number) => ({
            queryKey: [{ limit, page }],
            queryFn: () =>
              getMovementsService({
                walletId: walelletsId,
                query,
                pagination: { limit, page },
              }),
          }),
        },
      }),
    },
  }),
});

export const categoriasQuerys = createQueryKeys("categorias", {
  all: {
    queryKey: null,
    queryFn: () =>
      findCategories({
        returnFields: ["id", "label", "description", "type", "userId"],
      }),
  },

  withOwned: (userId: string) => ({
    queryKey: [{ userId }],
    queryFn: () =>
      findCategories({
        userId,
        returnFields: ["id", "label", "type"],
      }),
  }),
});

export const walletsQuerys = createQueryKeys("wallets", {
  owned: (userId: string) => ({
    queryKey: [userId],
    queryFn: () =>
      findWallets({
        ownerId: userId,
        returnFields: ["id", "balance", "createdAt", "labelName", "updatedAt"],
      }),
  }),
});
