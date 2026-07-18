"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { ComponentProps } from "react";

type DelButtonMovementProps = {
  functionDelete: () => void;
} & ComponentProps<"button">;

export function DelButtonMovement({
  functionDelete,
  ...rest
}: DelButtonMovementProps) {
  return (
    <Button
      type="submit"
      variant="ghost"
      size="icon-xs"
      className="min-w-sm text-red-500"
      onClick={functionDelete}
      {...rest}
    >
      <Trash2 />
      <span className="ml-2">Excluir</span>
    </Button>
  );
}
