"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CreateReccurrentAction } from "@/app/(dashboard)/dashboard/transaction/actions/createReccurrent.action";

export function useCriarReccurent(queryKey: unknown) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["refetch reccurrent - Criação"],
    mutationFn: CreateReccurrentAction,
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
