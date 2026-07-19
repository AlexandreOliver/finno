"use client";
import * as React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import { CreateForm } from "./CreateForm";
import { ButtonCreate } from "./ButtonCreate";

interface CreateFormProps {
  type: "Renda" | "Despesa" | "Investimento";
  label: string;
}

export function CreateDialog(props: CreateFormProps) {
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
        <CreateForm variant={props.type} />
      </DialogContent>
    </Dialog>
  );
}
