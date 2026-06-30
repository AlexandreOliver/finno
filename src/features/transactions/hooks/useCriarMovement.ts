"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CreateAction } from "@/app/(dashboard)/dashboard/transaction/actions/createMovement.action";

export function useCriarMovement(queryKey: unknown) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["refetch movements - Criação"],
    mutationFn: CreateAction,
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({
          queryKey: queryKey as string[],
        });

        return;
      }
    },
  });
}
