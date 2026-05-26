"use client";

import { Button } from "@/components/ui/button";
import { deleteMovement } from "../services/deleteMovements";
import { Trash2 } from "lucide-react";
import { ComponentProps } from "react";

type DelButtonMovementProps = {
  MovementsId: string;
} & ComponentProps<"button">;

export function DelButtonMovement({
  MovementsId,
  ...rest
}: DelButtonMovementProps) {
  const actionDeleteMovement = deleteMovement.bind(null, MovementsId);

  return (
    <form action={actionDeleteMovement}>
      <Button
        type="submit"
        variant="ghost"
        size="icon-xs"
        className="min-w-sm"
        {...rest}
      >
        <Trash2 color="red" />
        <span className="sr-only">Excluir</span>
      </Button>
    </form>
  );
}
