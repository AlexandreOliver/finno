"use client";
import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { CreateMovementForm } from "./CreateMovementForm";
import { ButtonCreate } from "./ButtonCreate";

interface CreateFormProps {
  type: "Renda" | "Despesa" | "Investimento";
  label: string;
}

export function CreateMovementDialog(props: CreateFormProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<ButtonCreate variant={props.type} label={props.label} />}
      />
      <DialogContent className="max-w-90 md:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
        </DialogHeader>
        <CreateMovementForm variant={props.type} />
      </DialogContent>
    </Dialog>
  );
}
