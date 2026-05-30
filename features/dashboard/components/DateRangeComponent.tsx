"use client";
import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { type DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ptBR } from "date-fns/locale";

export function DateRangeComponent({
  interval,
  setInterval,
  limitar = true,
}: {
  interval: DateRange | undefined;
  setInterval: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
  limitar: boolean;
}) {
  const hoje = new Date();
  return (
    <Field className=" w-60 rounded-lg p-1">
      <FieldLabel htmlFor="interval-picker-range">
        Selecione um Intervalo:
      </FieldLabel>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              id="interval-picker-range"
              className="justify-start px-2.5 font-normal"
            >
              <CalendarIcon data-icon="inline-start" />
              {interval?.from ? (
                interval.to ? (
                  <>
                    {format(interval.from, "LLL dd, y", { locale: ptBR })} -{" "}
                    {format(interval.to, "LLL dd, y", { locale: ptBR })}
                  </>
                ) : (
                  format(interval.from, "LLL dd, y", { locale: ptBR })
                )
              ) : (
                <span>Escolha o Intervalo</span>
              )}
            </Button>
          }
        />
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            locale={ptBR}
            mode="range"
            startMonth={
              limitar ? new Date(hoje.getFullYear(), 0, 1) : undefined
            }
            endMonth={limitar ? hoje : new Date(2036, 0, 0)}
            hidden={[
              limitar && {
                after: hoje,
              },
            ]}
            defaultMonth={interval?.from}
            captionLayout="dropdown"
            selected={interval}
            onSelect={setInterval}
            numberOfMonths={1}
            classNames={{
              selected: "bg-blue-500",
            }}
          />
        </PopoverContent>
      </Popover>
    </Field>
  );
}
