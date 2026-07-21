"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useWallets } from "@/features/dashboard/hooks/useWallets";
import { useRangeDate } from "@/features/transactions/hooks/use-rangeDate";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSession } from "@/hooks/useSession";
import { cn } from "@/lib/utils";
import clsx from "clsx";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface ControlsProps {
  setWallet: Dispatch<SetStateAction<string>>;
  setType: Dispatch<SetStateAction<"todas" | "credito" | "debito">>;
  currentType: "todas" | "credito" | "debito";
}

export function ControlsTableMovements({
  setWallet,
  setType,
  currentType,
}: ControlsProps) {
  const isMobile = useIsMobile();
  const { range, setRange } = useRangeDate();
  const { user } = useSession();

  const { data: wallets } = useWallets(user?.id ?? "");

  return (
    <div className="mx-auto md:mx-0">
      <div className="grid grid-cols-1 md:flex md:flex-row md:gap-4 md:justify-between md:items-end">
        <div className="order-last md:order-first justify-center border border-[#2A3040] w-full md:w-max h-16.5 rounded-md flex gap-3 items-center">
          <button
            className="hover:bg-[#2A3040] h-6 md:h-12"
            onClick={() => {
              setRange((prevRange) => {
                return {
                  end: new Date(
                    prevRange.end.getFullYear(),
                    prevRange.end.getMonth(),
                    0,
                  ),
                  start: new Date(
                    prevRange.start.getFullYear(),
                    prevRange.start.getMonth() - 1,
                    1,
                  ),
                };
              });
            }}
          >
            <ChevronLeft className="size-5 md:size-7" />
          </button>
          <div className="w-full md:w-35 h-full flex justify-center items-center">
            <p className="text-md text-center">
              {format(range.start, "MMMM 'de' yyyy ", { locale: ptBR })}
            </p>
          </div>
          <button
            disabled={range.end.toDateString() === new Date().toDateString()}
            className="h-6 md:h-12 not-disabled:hover:bg-[#2A3040]"
            onClick={() => {
              setRange((prevRange) => {
                return {
                  end:
                    prevRange.end.getMonth() + 1 === new Date().getMonth() &&
                    prevRange.end.getFullYear() === new Date().getFullYear()
                      ? new Date()
                      : new Date(
                          prevRange.end.getFullYear(),
                          prevRange.end.getMonth() + 2,
                          0,
                        ),
                  start: new Date(
                    prevRange.start.getFullYear(),
                    prevRange.start.getMonth() + 1,
                    1,
                  ),
                };
              });
            }}
          >
            <ChevronRight
              className={cn(
                clsx({
                  "text-white/20":
                    range.end.toDateString() === new Date().toDateString(),
                }),
                "size-5 md:size-7",
              )}
            />
          </button>
        </div>
        <div className="flex gap-2 md:gap-4 items-center justify-center">
          <div className="py-1 rounded-md border border-card flex flex-col gap-1 items-center">
            <p className="text-xs md:text-sm md:ml-2">Carteira:</p>
            <div className="mx-1">
              <Select
                defaultValue={{ value: "todas", label: "Todas" }}
                onValueChange={(e: { value: string; label: string } | null) =>
                  setWallet(e?.value as string)
                }
              >
                <SelectTrigger className="text-xs w-20 md:w-35 md:text-sm">
                  <SelectValue placeholder="Carteiras" />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  <SelectGroup>
                    {wallets &&
                      wallets.map((w) => (
                        <SelectItem
                          key={w.id}
                          value={{ value: w.id, label: w.labelName }}
                          className="sm:text-sm md:text-md"
                        >
                          {w.labelName}
                        </SelectItem>
                      ))}
                    <SelectItem value={{ value: "todas", label: "Todas" }}>
                      Todas
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="py-1 flex flex-col justify-center rounded-md border gap-1 border-card items-center">
            <p className="text-sm md:text-md">Tipo:</p>
            <ToggleGroup
              key={currentType}
              defaultValue={[currentType]}
              onValueChange={(e) => setType(e[0] as typeof currentType)}
              variant="default"
              spacing={isMobile ? 0.5 : 2}
              className="mx-1"
            >
              <ToggleGroupItem
                value="todas"
                aria-label="Toggle todas"
                className="text-xs md:text-sm font-light data-pressed:bg-[#0e1738] hover:bg-gray-900"
              >
                Todas
              </ToggleGroupItem>
              <ToggleGroupItem
                value="credito"
                aria-label="Toggle entradas"
                className="data-pressed:bg-green-400/50 hover:bg-green-600/40 text-xs md:text-sm font-light"
              >
                Entradas
              </ToggleGroupItem>
              <ToggleGroupItem
                value="debito"
                aria-label="Toggle saidas"
                className="data-pressed:bg-red-600/50 hover:bg-red-600/40 text-xs md:text-sm font-light"
              >
                Saidas
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>
    </div>
  );
}
