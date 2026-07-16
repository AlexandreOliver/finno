"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";
import { useRangeDate } from "@/features/transactions/hooks/use-rangeDate";
import { useStatement } from "@/features/transactions/hooks/useStatement";
import { useSession } from "@/hooks/useSession";
import { useWallets } from "@/features/dashboard/hooks/useWallets";
import { useMemo } from "react";
import { formatCurrency } from "@/lib/utils";
import { DatabaseSearch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import clsx from "clsx";

export function TableReccurent() {
  const { user } = useSession();
  const { range } = useRangeDate();

  const { data: wallets } = useWallets(user?.id ?? "");

  const wallets_Ids = useMemo(() => wallets?.map((w) => w.id), [wallets]);

  const { data: mov, isPending } = useStatement(
    wallets_Ids as string[],
    {
      limit: 10,
      page: 1,
    },
    {
      date: {
        start: range.start.toISOString().slice(0, 10),
        end: range.end.toISOString().slice(0, 10),
      },
    },
  );

  const dataTable = useMemo(() => {
    const onlyReccurent =
      mov?.payload?.reccurents.map((re) => {
        let label_reccurent;

        switch (re.frequency) {
          case "monthly": {
            if (re.interval === 1) {
              label_reccurent = "A cada mês";
              break;
            }
            label_reccurent = `A cada ${re.interval} Meses`;
            break;
          }
          case "daily": {
            if (re.interval === 1) {
              label_reccurent = "A cada dia";
              break;
            }
            label_reccurent = `A cada ${re.interval} dias`;
            break;
          }
          case "weekly": {
            if (re.interval === 1) {
              label_reccurent = "A cada semana";
              break;
            }
            label_reccurent = `A cada ${re.interval} semanas`;
            break;
          }
          case "yearly": {
            if (re.interval === 1) {
              label_reccurent = "A cada ano";
              break;
            }
            label_reccurent = `A cada ${re.interval} anos`;
            break;
          }
        }

        return {
          ...re,
          label_reccurent,
        };
      }) ?? [];

    return onlyReccurent;
  }, [mov]);

  return (
    <section>
      <header>
        <p className="text-2xl px-2">Transações Recorrentes</p>
      </header>
      <main>
        <Table>
          <TableHeader>
            <TableRow className="font-bold text-xs md:text-lg">
              <TableHead className="md:w-auto text-center">Descrição</TableHead>
              <TableHead className="md:w-40 text-center">Status</TableHead>
              <TableHead className="md:w-40 text-center">Reccorência</TableHead>
              {/* <TableHead className="md:w-36 text-center">Categoria</TableHead> */}
              <TableHead className="text-right w-20">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs md:text-lg">
            {dataTable?.length > 0 ? (
              dataTable.map((rec) => (
                <TableRow key={rec.id}>
                  <TableCell>
                    <div>{rec.description}</div>
                    <div className="text-muted-foreground text-xs md:text-sm">
                      {`${format(rec.start_date as Date, "MMMM 'de' yyyy", {
                        locale: ptBR,
                      })} - ${format(rec.start_date as Date, "MMMM 'de' yyyy", {
                        locale: ptBR,
                      })}`}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      className={clsx({
                        "bg-blue-600": rec.status === "ativo",
                        "bg-gray-600": rec.status === "terminado",
                        "bg-yellow-600": rec.status === "pausado",
                      })}
                    >
                      {rec?.status.charAt(0).toUpperCase() +
                        rec.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <p>{rec.label_reccurent}</p>
                  </TableCell>
                  {/* <TableCell className="text-center">
                    <p className="text-balance">{rec.category?.label}</p>
                  </TableCell> */}
                  <TableCell className="text-right">
                    {rec.type === "debito" ? (
                      <span className="dark:text-red-400 ">
                        {`- ${formatCurrency(rec.amount)}`}
                      </span>
                    ) : (
                      <span className="dark:text-green-400 ">
                        {`+ ${formatCurrency(rec.amount)}`}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-55 text-center">
                  <div className="flex justify-center items-center gap-3">
                    <DatabaseSearch />
                    {isPending ? (
                      <span className="text-gray-400">Pesquisando...</span>
                    ) : (
                      <span>Sem dados</span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </main>
    </section>
  );
}
