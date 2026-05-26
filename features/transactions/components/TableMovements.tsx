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
  Edit,
  Settings2Icon,
} from "lucide-react";

import { getMovementsService } from "../services/getMovements";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import { DelButtonMovement } from "./buttons";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/hooks/useSession";
import { findWallets } from "../services/findWallets";
import Link from "next/link";
import { useMemo, useState } from "react";

export function TableMovements() {
  const { user } = useSession();

  const [page, setPage] = useState(1);

  const { data: wallets } = useQuery({
    queryKey: ["wallets", { userId: user?.id }],
    queryFn: () =>
      findWallets({
        ownerId: user?.id as string,
        returnFields: ["id", "balance", "createdAt", "labelName", "updatedAt"],
      }),
    enabled: !!user?.id,
  });

  const wallets_Ids = useMemo(() => wallets?.map((w) => w.id), [wallets]);

  const limit = 10;

  const { data: movements } = useQuery({
    queryKey: ["movements", wallets_Ids, { page, limit }],
    queryFn: () =>
      getMovementsService({
        walletId: wallets_Ids as string[],
        query: {
          page,
          limit,
        },
      }),
    placeholderData: (previousData) => previousData,
    enabled: !!wallets_Ids,
  });

  const totalPages = useMemo(
    () =>
      Math.round(
        ((movements?.totalMovementsFromDb as number) + 5) /
          (movements?.limit ?? 0),
      ),
    [movements?.totalMovementsFromDb, movements?.limit],
  );

  return (
    <div className="min-h-147.25">
      <div className="flex flex-col gap-2">
        <div className="rounded-md overflow-hidden border border-[#3a3f4d]">
          <Table className="p-5 rounded-xl">
            <TableHeader className="bg-[#0e1738]">
              <TableRow className="font-bold text-[15px]">
                <TableHead className="w-15 p-3 text-center">DATA</TableHead>
                <TableHead className="p-3">DESCRIÇÃO</TableHead>
                <TableHead className="w-20 text-center p-3">TIPO</TableHead>
                <TableHead className="w-12 text-center p-3">CARTEIRA</TableHead>
                <TableHead className="w-30 text-center p-3">
                  CATEGORIA
                </TableHead>
                <TableHead className="text-right p-3">VALOR</TableHead>
                <TableHead className="w-25 text-center p-3">AÇÕES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className=" bg-[#2A3040]/20 text-base">
              {movements &&
                movements.payload.map((mov) => (
                  <TableRow key={mov.id} className="border-[#323A4D]">
                    <TableCell className="p-2">
                      {format(mov.executedAt as Date, "d 'de' MMM", {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell className="p-2">{mov.description}</TableCell>
                    <TableCell>
                      <div className="flex justify-center items-center">
                        {mov.type === "debito" ? (
                          <Badge className="dark:bg-red-800 ">Saida</Badge>
                        ) : (
                          <Badge className="dark:bg-green-800 ">Entrada</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center p-2">
                      {wallets?.find((w) => w.id === mov.walletId)?.labelName}
                    </TableCell>
                    <TableCell className="text-center p-2">
                      {mov.labelCategory}
                    </TableCell>
                    <TableCell className="text-right p-2">
                      {formatCurrency(Number(mov.amount))}
                    </TableCell>
                    <TableCell className="text-center p-2">
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
                          className="min-w-17"
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
                            <DelButtonMovement MovementsId={mov.id as string} />
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
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
