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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function TableMovements() {
  const { user } = useSession();
  const [page, setPage] = useState(1);
  const [month, setMonth] = useState(() => new Date());
  const [seletorType, setType] = useState<"todas" | "debito" | "credito">(
    "todas",
  );
  const [selectWallet, setWallet] = useState(() => "todas");

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
    queryKey: [
      "movements",
      wallets_Ids,
      { page, limit, month: month.getMonth() + 1 },
    ],
    queryFn: () =>
      getMovementsService({
        walletId: wallets_Ids as string[],
        query: {
          page,
          limit,
          month: month.getMonth() + 1,
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

  const payloadFiltred = useMemo(
    () =>
      movements?.payload.filter(
        (w) =>
          (w.type === seletorType || seletorType === "todas") &&
          (w.walletId === selectWallet || selectWallet === "todas"),
      ) ?? [],
    [movements?.payload, seletorType, selectWallet],
  );

  return (
    <div className="min-h-147.25">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <div className="p-2 rounded-md border border-card flex gap-2 items-center ">
            <span className="text-md ml-2">Carteiras:</span>
            <Select
              defaultValue={{ value: "todas", label: "Todas" }}
              onValueChange={(e: { value: string; label: string } | null) =>
                setWallet(e?.value as string)
              }
            >
              <SelectTrigger className="w-35">
                <SelectValue placeholder="Carteiras" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {wallets &&
                    wallets.map((w) => (
                      <SelectItem
                        key={w.id}
                        value={{ value: w.id, label: w.labelName }}
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
          <div className="border border-[#2A3040] rounded-md h-full flex gap-3 p-1 items-center">
            <button
              className="hover:bg-[#2A3040] h-12"
              onClick={() =>
                setMonth(
                  (d) =>
                    new Date(d.getFullYear(), d.getMonth() - 1, d.getDate()),
                )
              }
            >
              <ChevronLeft size={30} />
            </button>
            <div className="w-35 text-center">
              {format(month, "MMMM 'de' yyyy ", { locale: ptBR })}
            </div>
            <button
              disabled={month.getMonth() === new Date().getMonth()}
              className="hover:bg-[#2A3040] h-12"
              onClick={() =>
                setMonth(
                  (d) =>
                    new Date(d.getFullYear(), d.getMonth() + 1, d.getDate()),
                )
              }
            >
              {month.getMonth() === new Date().getMonth() ? (
                <></>
              ) : (
                <ChevronRight size={30} />
              )}
            </button>
          </div>
          <div className="flex justify-end">
            <ToggleGroup
              key={seletorType}
              defaultValue={[seletorType]}
              onValueChange={(e) => setType(e[0] as typeof seletorType)}
              variant="outline"
              spacing={2}
            >
              <ToggleGroupItem
                size="lg"
                value="todas"
                aria-label="Toggle todas"
                className="text-lg font-light data-pressed:bg-[#0e1738] hover:bg-gray-900"
              >
                Todas
              </ToggleGroupItem>
              <ToggleGroupItem
                size="lg"
                value="credito"
                aria-label="Toggle entradas"
                className="data-pressed:bg-green-600 hover:bg-green-600/40 text-lg font-light"
              >
                Entradas
              </ToggleGroupItem>
              <ToggleGroupItem
                size="lg"
                value="debito"
                aria-label="Toggle saidas"
                className="data-pressed:bg-red-600 hover:bg-red-600/40 text-lg font-light"
              >
                Saidas
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
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
                <TableHead className="w-74 text-right p-3">VALOR</TableHead>
                <TableHead className="w-25 text-center p-3">AÇÕES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className=" bg-[#2A3040]/20 text-base">
              {payloadFiltred.length > 0 ? (
                payloadFiltred.map((mov) => (
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
