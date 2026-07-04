"use client";

import { Badge } from "@/components/ui/badge";
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
  RefreshCcwIcon,
  Settings2Icon,
} from "lucide-react";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import clsx from "clsx";
import { cn, formatCurrency } from "@/lib/utils";
import { DelButtonMovement } from "./buttons";
import Link from "next/link";
import { useMemo, useState } from "react";

import { useSession } from "@/hooks/useSession";
import { useDeleteMovement } from "@/features/transactions/hooks/useDeleteMovement";

import { movementsQuerys } from "@/features/Provider/queryKeys";
import { useIsMobile } from "@/hooks/use-mobile";
import { useStatement } from "@/features/transactions/hooks/useStatement";
import { useWallets } from "@/features/dashboard/hooks/useWallets";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

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

  const isMobile = useIsMobile();

  const { data: wallets } = useWallets(user?.id ?? "");

  const wallets_Ids = useMemo(() => wallets?.map((w) => w.id), [wallets]);

  const rangeDate = useMemo(() => {
    const range = {
      start: dateStart.toISOString().slice(0, 10),
      end: dateEnd.toISOString().slice(0, 10),
    };
    return range;
  }, [dateEnd, dateStart]);

  const limit = 10;
  const { data: movements, isPending } = useStatement(
    wallets_Ids as string[],
    { limit, page },
    { date: rangeDate },
  );

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
      ._ctx.query({ date: rangeDate }).queryKey,
  );

  const deleteMovement = (id: string) => {
    mutationDelete.mutate(id);
  };

  return (
    <div className="min-h-147.25">
      <div className="flex flex-col gap-2">
        <div className="mx-auto md:mx-0">
          <div className="grid grid-cols-1 md:flex md:flex-row md:gap-4 md:justify-between md:items-end">
            <div className="order-last md:order-first justify-center border border-[#2A3040] w-full md:w-max h-16.5 rounded-md flex gap-3 items-center">
              <button
                className="hover:bg-[#2A3040] h-6 md:h-12"
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
                <ChevronLeft className="size-5 md:size-7" />
              </button>
              <div className="w-full md:w-35 h-full flex justify-center items-center">
                <p className="text-md text-center">
                  {format(dateStart, "MMMM 'de' yyyy ", { locale: ptBR })}
                </p>
              </div>
              <button
                disabled={dateEnd.toDateString() === new Date().toDateString()}
                className="h-6 md:h-12 not-disabled:hover:bg-[#2A3040]"
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
                  className={cn(
                    clsx({
                      "text-white/20":
                        dateEnd.toDateString() === new Date().toDateString(),
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
                    onValueChange={(
                      e: { value: string; label: string } | null,
                    ) => setWallet(e?.value as string)}
                  >
                    <SelectTrigger className="text-xs w-20 md:w-35 md:text-sm">
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
              </div>
              <div className="py-1 flex flex-col justify-center rounded-md border gap-1 border-card items-center">
                <p className="text-sm md:text-md">Tipo:</p>
                <ToggleGroup
                  key={seletorType}
                  defaultValue={[seletorType]}
                  onValueChange={(e) => setType(e[0] as typeof seletorType)}
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
        <div className="rounded-md overflow-hidden border border-[#3a3f4d]">
          <Table className="p-5 rounded-xl">
            <TableHeader className="bg-[#0e1738]">
              <TableRow className="font-bold text-xs md:text-lg">
                <TableHead className="flex p-2 justify-center items-center w-17 md:w-auto">
                  DESCRIÇÃO
                </TableHead>
                <TableHead className="text-center p-2 w-22 md:w-32">
                  CATEGORIA
                </TableHead>
                <TableHead className="text-right p-2 w-18">VALOR</TableHead>
                <TableHead className="text-center p-2 w-15 md:w-25">
                  AÇÕES
                </TableHead>
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
                            <span>
                              {format(mov.executedAt as Date, "d 'de' MMMM", {
                                locale: ptBR,
                              })}
                            </span>
                            {mov.reccurent && (
                              <HoverCard>
                                <HoverCardTrigger
                                  delay={10}
                                  closeDelay={100}
                                  render={
                                    <Badge className="ml-1 w-7">
                                      <RefreshCcwIcon />
                                    </Badge>
                                  }
                                />
                                <HoverCardContent
                                  className="flex w-64 flex-col gap-0.5"
                                  side="right"
                                >
                                  <div className="font-medium">
                                    Transação Recorrente
                                  </div>
                                  {mov.reccurent.installments !== null ? (
                                    <div>{`Parcelas restantes ${mov.reccurent.installments - mov.reccurent.countPaid}`}</div>
                                  ) : (
                                    <div>{`${mov.reccurent.countPaid} parcelas executadas`}</div>
                                  )}
                                  <div className="mt-1 text-xs text-muted-foreground">
                                    {mov.reccurent.start_date &&
                                    mov.reccurent.end_date ? (
                                      <p>
                                        Prazo:{" "}
                                        {format(
                                          mov.reccurent.start_date,
                                          "MM'/'yyyy",
                                          {
                                            locale: ptBR,
                                          },
                                        )}{" "}
                                        até{" "}
                                        {format(
                                          mov.reccurent.end_date,
                                          "MM'/'yyyy",
                                          {
                                            locale: ptBR,
                                          },
                                        )}
                                      </p>
                                    ) : (
                                      <p>
                                        Iniciado em $
                                        {format(
                                          mov.reccurent.start_date,
                                          "MMMM 'de' yyyy",
                                          {
                                            locale: ptBR,
                                          },
                                        )}
                                      </p>
                                    )}
                                  </div>
                                </HoverCardContent>
                              </HoverCard>
                            )}
                          </div>
                          <p className="text-balance">{mov.description}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center w-22 md:w-32">
                      <p className="text-balance">
                        {mov.category?.label ?? "-"}
                      </p>
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
                                deleteMovement(mov.id as string)
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
                  <TableCell colSpan={4} className="h-55 text-center">
                    <div className="flex justify-center items-center gap-3">
                      <DatabaseSearch />
                      {isPending ? (
                        <span className="text-gray-400">Pesquisando...</span>
                      ) : (
                        <span>Sem dados</span>
                      )}
                    </div>
                    <div
                      className="text-sm mt-1 text-muted-foreground"
                      hidden={isPending}
                    >
                      Tente mudar os filtros
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-between items-center px-2">
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
