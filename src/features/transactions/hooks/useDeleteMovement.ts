"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteMovement } from "@/app/(dashboard)/dashboard/transaction/actions/deleteMovements.action";

export function useDeleteMovement(queryKey: unknown) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["refetch Movements - Deleção"],
    mutationFn: deleteMovement,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKey as string[],
      });
    },
  });
}
