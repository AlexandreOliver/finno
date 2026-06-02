"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CreateAction } from "../services/createMovements";

export function useCriarMovement(queryKey: unknown) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["refetch movements - Criação"],
    mutationFn: CreateAction,
    onSuccess: (data) => {
      if (data.sucess) {
        queryClient.invalidateQueries({
          queryKey: queryKey as string[],
        });

        return;
      }
    },
  });
}
