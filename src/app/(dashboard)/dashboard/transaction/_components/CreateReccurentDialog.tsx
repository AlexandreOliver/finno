"use client";
import * as React from "react";

import {
  Dialog,
  DialogContent,
  // DialogHeader,
  // DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { CreateReccurentForm } from "./CreateReccurentForm";
import { ButtonCreate } from "./ButtonCreate";

export function CreateReccurentDialog() {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<ButtonCreate label="Nova" />} />
      <DialogContent className="max-w-90 md:max-w-106.25">
        {/* <DialogHeader>
          <DialogTitle>Transação Recorrente</DialogTitle>
        </DialogHeader> */}
        <CreateReccurentForm />
      </DialogContent>
    </Dialog>
  );
}
