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
import { formatCurrency } from "@/lib/utils";
import { DelButtonMovement } from "./buttons";
import Link from "next/link";
import { useMemo, useState } from "react";

import { useSession } from "@/hooks/useSession";
import { useDeleteMovement } from "@/features/transactions/hooks/useDeleteMovement";

import { movementsQuerys } from "@/features/Provider/queryKeys";

import { useStatement } from "@/features/transactions/hooks/useStatement";
import { useWallets } from "@/features/dashboard/hooks/useWallets";
import { useRangeDate } from "@/features/transactions/hooks/use-rangeDate";
import { ControlsTableMovements } from "./ControlsTableMovements";

export function TableMovements() {
  const { range } = useRangeDate();
  const { user } = useSession();
  const [page, setPage] = useState(1);

  const [seletorType, setType] = useState<"todas" | "debito" | "credito">(
    "todas",
  );
  const [selectWallet, setWallet] = useState(() => "todas");

  const { data: wallets } = useWallets(user?.id ?? "");

  const wallets_Ids = useMemo(() => wallets?.map((w) => w.id), [wallets]);

  const rangeDate = useMemo(() => {
    const range1 = {
      start: range.start.toISOString().slice(0, 10),
      end: range.end.toISOString().slice(0, 10),
    };
    return range1;
  }, [range.start, range.end]);

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
      movements?.payload?.movements.filter(
        (w) =>
          (w.type === seletorType || seletorType === "todas") &&
          (w.walletId === selectWallet || selectWallet === "todas") &&
          !w.isReversal,
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
    <div className="flex flex-col gap-2">
      <ControlsTableMovements
        currentType={seletorType}
        setType={setType}
        setWallet={setWallet}
      />
      <div className="rounded-md overflow-hidden border border-[#3a3f4d] max-h-176 bg-[#2A3040]/20 ">
        <Table className="p-5 rounded-xl">
          <TableHeader className="bg-[#0e1738]">
            <TableRow className="font-bold text-xs md:text-lg">
              <TableHead className="flex p-2 justify-center items-center w-auto">
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
          <TableBody className="text-xs md:text-lg">
            {payloadFiltred.length > 0 ? (
              payloadFiltred.map((mov) => (
                <TableRow key={mov.id} className="border-[#323A4D]">
                  <TableCell className="text-xs md:text-lg">
                    <div className="flex gap-4 ml-4">
                      <div className="flex flex-col">
                        <div className="text-xs md:text-sm text-white/60">
                          <div className="flex gap-1">
                            <span>
                              {format(mov.executedAt as Date, "d 'de' MMMM", {
                                locale: ptBR,
                              })}
                            </span>
                            {mov.isRefunded &&
                              (mov.type === "debito" ? (
                                <span className="text-xs md:text-sm text-muted-foreground">
                                  - Reembolsado
                                </span>
                              ) : (
                                <span className="text-xs md:text-sm text-muted-foreground">
                                  - Estornado
                                </span>
                              ))}
                            {mov.reccurrent && (
                              <a href={`#${mov.reccurrent}`}>
                                <Badge className="ml-1 w-7">
                                  <RefreshCcwIcon />
                                </Badge>
                              </a>
                            )}
                          </div>
                        </div>
                        <p
                          className={clsx(
                            { "text-muted-foreground": mov.isRefunded },
                            "text-balance",
                          )}
                        >
                          {mov.description}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <p className="text-balance">{mov.category?.label ?? "-"}</p>
                  </TableCell>
                  <TableCell
                    className={clsx("text-right", {
                      "line-through": mov.isRefunded,
                    })}
                  >
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
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost">
                            <Settings2Icon className="size-5" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="center" className="min-w-22">
                        <DropdownMenuItem className="flex justify-center items-center h-8">
                          <Link
                            prefetch={false}
                            href="#"
                            className="flex justify-center items-center text-green-400 "
                          >
                            <Edit className="" />
                            <span className="ml-2">Editar</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex justify-center items-center"
                          hidden={mov.isReversal || mov.isRefunded}
                        >
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
        <span className="text-sm md:text-lg">
          {movements?.totalMovementsFromDb} Transações
        </span>
        <div className="flex gap-5 justify-center items-center text-sm md:text-lg">
          <span>{`Pagina ${movements?.page} de ${totalPages}`}</span>
          <div className="flex gap-2 h-7 md:h-9 ">
            <button
              className="border rounded-md p-1"
              onClick={() => {
                if (page === 1) return;
                setPage(1);
              }}
            >
              <ChevronsLeftIcon className="size-4 md:size-7" />
            </button>
            <button
              className="border rounded-md p-1"
              onClick={() => {
                if (page === 1) return;
                setPage((p) => p - 1);
              }}
            >
              <ChevronLeft className="size-4 md:size-7" />
            </button>
            <button
              className="border rounded-md p-1"
              onClick={() => {
                if (page === totalPages) return;
                setPage((p) => p + 1);
              }}
            >
              <ChevronRight className="size-4 md:size-7" />
            </button>
            <button
              className="border rounded-md p-1"
              onClick={() => {
                if (page === totalPages) return;
                setPage(totalPages);
              }}
            >
              <ChevronsRight className="size-4 md:size-7" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
