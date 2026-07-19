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
import { useIsMobile } from "@/hooks/use-mobile";

export function TableReccurent() {
  const { user } = useSession();
  const { range } = useRangeDate();
  const isMobile = useIsMobile();

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
        const labels_reccurent = {
          label_interval: "",
          label_installments: "",
        };

        switch (re.frequency) {
          case "monthly": {
            if (re.installments) {
              labels_reccurent.label_installments = `por ${re.installments} meses`;
            }

            if (re.interval === 1) {
              labels_reccurent.label_interval = "A cada mês";

              break;
            }
            labels_reccurent.label_interval = `A cada ${re.interval} Meses`;
            break;
          }
          case "daily": {
            if (re.installments) {
              labels_reccurent.label_installments = `por ${re.installments} dias`;
            }

            if (re.interval === 1) {
              labels_reccurent.label_interval = "A cada dia";
              break;
            }
            labels_reccurent.label_interval = `A cada ${re.interval} dias`;
            break;
          }
          case "weekly": {
            if (re.installments) {
              labels_reccurent.label_installments = `por ${re.installments} semanas`;
            }

            if (re.interval === 1) {
              labels_reccurent.label_interval = "A cada semana";
              break;
            }

            labels_reccurent.label_interval = `A cada ${re.interval} semanas`;
            break;
          }
          case "yearly": {
            if (re.installments) {
              labels_reccurent.label_installments = `por ${re.installments} anos`;
            }

            if (re.interval === 1) {
              labels_reccurent.label_interval = "A cada ano";
              break;
            }
            labels_reccurent.label_interval = `A cada ${re.interval} anos`;
            break;
          }
        }

        return {
          ...re,
          labels_reccurent,
        };
      }) ?? [];

    return onlyReccurent;
  }, [mov?.payload?.reccurents]);

  return (
    <section>
      <header className="mb-2">
        <p className="text-2xl px-2">Transações Recorrentes</p>
      </header>
      <main>
        <div className="rounded-md overflow-hidden border border-[#3a3f4d] min-h-174 bg-[#2A3040]/20">
          <Table>
            <TableHeader className="bg-[#0e1738]">
              <TableRow className="font-bold text-[12px] md:text-lg">
                <TableHead className="md:w-auto text-center p-2">
                  Descrição
                </TableHead>
                <TableHead
                  className="md:w-20 text-center p-2"
                  hidden={isMobile}
                >
                  Status
                </TableHead>
                <TableHead className="md:w-40 text-center p-2">
                  Reccorência
                </TableHead>
                <TableHead className="md:w-36 text-center px-2 py-1">
                  <p className="text-xs md:text-[18px] text-balance">
                    Próximo Pagamento
                  </p>
                </TableHead>
                <TableHead className="text-center w-20 p-2">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="">
              {dataTable?.length > 0 ? (
                dataTable.map((rec) => (
                  <TableRow
                    id={rec.id}
                    key={rec.id}
                    className="border-[#323A4D] text-[10px] md:text-lg"
                  >
                    <TableCell className="pl-4">
                      {isMobile && (
                        <Badge
                          className={clsx(
                            "text-[8px] md:text-base h-3.5 w-7 md:h-6 md:w-14 mb-1",
                            {
                              "bg-blue-600/40": rec.status === "ativo",
                              "bg-gray-600": rec.status === "terminado",
                              "bg-yellow-600/80": rec.status === "pausado",
                            },
                          )}
                        >
                          {rec?.status.charAt(0).toUpperCase() +
                            rec.status.slice(1)}
                        </Badge>
                      )}
                      <p>{rec.description}</p>
                      <p className="text-muted-foreground ">
                        {`${format(rec.start_date as Date, "MMMM 'de' yyyy", {
                          locale: ptBR,
                        })} - ${format(rec.end_date as Date, "MMMM 'de' yyyy", {
                          locale: ptBR,
                        })}`}
                      </p>
                    </TableCell>
                    <TableCell className="text-center" hidden={isMobile}>
                      <Badge
                        className={clsx(
                          "text-[8px] md:text-base h-3.5 w-7 md:h-6 md:w-14",
                          {
                            "bg-blue-600/40": rec.status === "ativo",
                            "bg-gray-600": rec.status === "terminado",
                            "bg-yellow-600/80": rec.status === "pausado",
                          },
                        )}
                      >
                        {rec?.status.charAt(0).toUpperCase() +
                          rec.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <p className="">{rec.labels_reccurent.label_interval}</p>
                      <p className="">
                        {rec.labels_reccurent.label_installments}
                      </p>
                    </TableCell>
                    <TableCell className="text-center">
                      {rec.next_due_date ? (
                        <p className="text-balance">
                          {format(rec.next_due_date, "dd/MM/yyyy")}
                        </p>
                      ) : (
                        <p className="text-balance">--/--/--</p>
                      )}
                    </TableCell>
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
        </div>
      </main>
    </section>
  );
}
