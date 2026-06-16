"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeftIcon,
  ChevronsRight,
  DatabaseSearch,
  Edit,
  Settings2Icon,
} from "lucide-react";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import clsx from "clsx";
import { formatCurrency } from "@/lib/utils";
import { DelButtonMovement } from "./buttons";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";

import { useSession } from "@/hooks/useSession";
import { useDeleteMovement } from "../hooks/useDeleteMovement";

import { movementsQuerys, walletsQuerys } from "../../Provider/queryKeys";

export function TableMovements() {
  const { user } = useSession();
  const [page, setPage] = useState(1);
  const [dateEnd, setEnd] = useState(new Date());
  const [dateStart, setStart] = useState(
    () => new Date(dateEnd.getFullYear(), dateEnd.getMonth(), 1, 0, 0),
  );

  const [seletorType, setType] = useState<"todas" | "debito" | "credito">(
    "todas",
  );
  const [selectWallet, setWallet] = useState(() => "todas");

  const { data: wallets } = useQuery({
    ...walletsQuerys.owned(user?.id as string),
    enabled: !!user?.id,
  });

  const wallets_Ids = useMemo(() => wallets?.map((w) => w.id), [wallets]);

  const rangeDate = useMemo(() => {
    const range = {
      start: dateStart.toLocaleDateString("en-US"),
      end: dateEnd.toLocaleDateString("en-US"),
    };
    return range;
  }, [dateEnd, dateStart]);

  const limit = 10;
  const { data: movements } = useQuery({
    ...movementsQuerys
      .owned(wallets_Ids as string[])
      ._ctx.query({ date: rangeDate })
      ._ctx.pagination(limit, page),
    placeholderData: (previousData) => previousData,
  });

  const totalPages = useMemo(
    () =>
      Math.ceil(
        (movements?.totalMovementsFromDb as number) / (movements?.limit ?? 0),
      ),
    [movements?.totalMovementsFromDb, movements?.limit],
  );

  const payloadFiltred = useMemo(
    () =>
      movements?.payload.filter(
        (w) =>
          (w.type === seletorType || seletorType === "todas") &&
          (w.walletId === selectWallet || selectWallet === "todas"),
      ) ?? [],
    [movements?.payload, seletorType, selectWallet],
  );

  const mutationDelete = useDeleteMovement(
    movementsQuerys
      .owned(wallets_Ids as string[])
      ._ctx.query({ date: rangeDate })
      ._ctx.pagination(limit, page).queryKey,
  );

  const deleteMovment = (id: string) => {
    mutationDelete.mutate(id);
  };

  return (
    <div className="min-h-147.25">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col md:flex-row md:gap-4 md:justify-between md:items-end">
          <div className="justify-center border border-[#2A3040] rounded-md h-full flex gap-3 p-1 items-center">
            <button
              className="hover:bg-[#2A3040] h-12"
              onClick={() => {
                setEnd(
                  (endPrev) =>
                    new Date(endPrev.getFullYear(), endPrev.getMonth(), 0),
                );
                setStart(
                  (datePrev) =>
                    new Date(
                      datePrev.getFullYear(),
                      datePrev.getMonth() - 1,
                      1,
                    ),
                );
              }}
            >
              <ChevronLeft size={30} />
            </button>
            <div className="w-35 text-center">
              {format(dateStart, "MMMM 'de' yyyy ", { locale: ptBR })}
            </div>
            <button
              disabled={dateEnd.toDateString() === new Date().toDateString()}
              className=" h-12 not-disabled:hover:bg-[#2A3040]"
              onClick={() => {
                setStart(
                  (datePrev) =>
                    new Date(
                      datePrev.getFullYear(),
                      datePrev.getMonth() + 1,
                      1,
                    ),
                );
                setEnd((d) =>
                  d.getMonth() + 1 === new Date().getMonth() &&
                  d.getFullYear() === new Date().getFullYear()
                    ? new Date()
                    : new Date(d.getFullYear(), d.getMonth() + 2, 0),
                );
              }}
            >
              <ChevronRight
                size={30}
                className={clsx({
                  "text-white/20":
                    dateEnd.toDateString() === new Date().toDateString(),
                })}
              />
            </button>
          </div>
          <div className="flex gap-2 items-center justify-center">
            <div className="p-1 rounded-md border border-card flex flex-col gap-1 items-center">
              <span className="text-sm md:text-md md:ml-2">Carteira:</span>
              <Select
                defaultValue={{ value: "todas", label: "Todas" }}
                onValueChange={(e: { value: string; label: string } | null) =>
                  setWallet(e?.value as string)
                }
              >
                <SelectTrigger className="w-24 md:w-35">
                  <SelectValue placeholder="Carteiras" />
                </SelectTrigger>
                <SelectContent>
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
            <div className="flex flex-col justify-center rounded-md border p-1 gap-1 border-card items-center">
              <span className="text-sm md:text-md">Tipo:</span>
              <ToggleGroup
                key={seletorType}
                defaultValue={[seletorType]}
                onValueChange={(e) => setType(e[0] as typeof seletorType)}
                variant="outline"
                spacing={2}
              >
                <ToggleGroupItem
                  size="default"
                  value="todas"
                  aria-label="Toggle todas"
                  className="text-md font-light data-pressed:bg-[#0e1738] hover:bg-gray-900"
                >
                  Todas
                </ToggleGroupItem>
                <ToggleGroupItem
                  size="default"
                  value="credito"
                  aria-label="Toggle entradas"
                  className="data-pressed:bg-green-600 hover:bg-green-600/40 text-md font-light"
                >
                  Entradas
                </ToggleGroupItem>
                <ToggleGroupItem
                  size="default"
                  value="debito"
                  aria-label="Toggle saidas"
                  className="data-pressed:bg-red-600 hover:bg-red-600/40 text-md font-light"
                >
                  Saidas
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </div>
        <div className="rounded-md overflow-hidden border border-[#3a3f4d]">
          <Table className="p-5 rounded-xl">
            <TableHeader className="bg-[#0e1738]">
              <TableRow className="font-bold text-xs md:text-lg">
                <TableHead className="flex p-2 justify-center items-center">
                  DESCRIÇÃO
                </TableHead>
                <TableHead className="text-center p-2">CATEGORIA</TableHead>
                <TableHead className="text-right p-2">VALOR</TableHead>
                <TableHead className="text-center p-2">AÇÕES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className=" bg-[#2A3040]/20 text-xs md:text-lg">
              {payloadFiltred.length > 0 ? (
                payloadFiltred.map((mov) => (
                  <TableRow key={mov.id} className="border-[#323A4D]">
                    <TableCell className="text-xs md:text-lg w-17 md:w-auto">
                      <div className="flex gap-4 ml-4">
                        <div className="md:flex justify-center items-center hidden"></div>
                        <div className="flex flex-col">
                          <div className="text-xs md:text-sm text-white/60">
                            {format(mov.executedAt as Date, "d 'de' MMMM", {
                              locale: ptBR,
                            })}
                          </div>
                          <p className="text-balance">{mov.description}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center w-22 md:w-32">
                      <p className="text-balance">{mov.labelCategory}</p>
                    </TableCell>
                    <TableCell className="text-right w-18">
                      {mov.type === "debito" ? (
                        <span className="dark:text-red-400 ">
                          {`- ${formatCurrency(Number(mov.amount))}`}
                        </span>
                      ) : (
                        <span className="dark:text-green-400 ">
                          {`+ ${formatCurrency(Number(mov.amount))}`}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center w-15 md:w-25">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost">
                              <Settings2Icon className="size-5" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent
                          align="center"
                          className="min-w-22"
                        >
                          <DropdownMenuItem className="flex justify-center items-center h-8">
                            <Link
                              prefetch={false}
                              href="#"
                              className="flex justify-center items-center h-full w-full"
                            >
                              <Edit className="text-green-400 " />
                              <span className="sr-only">Editar</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex justify-center items-center">
                            <DelButtonMovement
                              functionDelete={() =>
                                deleteMovment(mov.id as string)
                              }
                            />
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-[#323A4D] hover:bg-bg-[#2A3040]/20">
                  <TableCell colSpan={7} className="h-55 text-center">
                    <div className="flex justify-center items-center gap-3">
                      <DatabaseSearch />
                      <span>Sem dados</span>
                    </div>
                    <div className="text-sm mt-1 text-muted-foreground">
                      Tente mudar os filtros
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-between items-center">
          <span>{movements?.totalMovementsFromDb} Transações</span>
          <div className="flex gap-5 justify-center items-center">
            <span>{`Pagina ${movements?.page} de ${totalPages}`}</span>
            <div className="flex gap-2">
              <button className="border rounded-md p-1">
                <ChevronsLeftIcon />
              </button>
              <button
                className="border rounded-md p-1"
                onClick={() => {
                  if (page === 1) return;
                  setPage((p) => p - 1);
                }}
              >
                <ChevronLeft />
              </button>
              <button
                className="border rounded-md p-1"
                onClick={() => {
                  if (page === totalPages) return;
                  setPage((p) => p + 1);
                }}
              >
                <ChevronRight />
              </button>
              <button className="border rounded-md p-1">
                <ChevronsRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
