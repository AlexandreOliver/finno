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
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={<ButtonCreate variant={props.type} label={props.label} />}
        />
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Nova Transação</DialogTitle>
          </DialogHeader>
          <CreateForm variant={props.type} />
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <Drawer open={open} onOpenChange={setOpen} modal={false}>
      <DrawerTrigger asChild>
        <ButtonCreate variant={props.type} label={props.label} />
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{props.label}</DrawerTitle>
        </DrawerHeader>
        <div className="px-2">
          <CreateForm variant={props.type} />
        </div>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
