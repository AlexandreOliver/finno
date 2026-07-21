import { Badge } from "@/components/ui/badge";
import { verifySession } from "@/features/authorization/services/verifysession";
import { CreateMovementDialog } from "@/app/(dashboard)/dashboard/transaction/_components/CreateMovementDialog";
import { TableMovements } from "@/app/(dashboard)/dashboard/transaction/_components/TableMovements";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { TableReccurrent } from "./_components/TableReccurrent";

import { RangeDateProvider } from "@/features/transactions/contexts/rangeDateProvider";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Transações",
};

export default async function Page() {
  const dateFormated = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });
  const sessionCookie = (await cookies()).get("session_token");

  const authUser = await verifySession(sessionCookie?.value as string);
  if (!authUser.isAuth) redirect("/auth/signin");

  return (
    <RangeDateProvider>
      <section className="flex flex-col gap-2 w-full">
        <div className="p-3 flex flex-col justify-center items-center gap-3 md:flex-row md:justify-between">
          <div>
            <p className="text-muted-foreground text-md">{dateFormated}</p>
            <p className="text-3xl tracking-tight font-medium text-center md:text-start">
              Transações
            </p>
            <div className="flex gap-2 mt-4 md:mt-1">
              <Badge className="dark:bg-green-800 dark:text-green-200 bg-green-400/30 text-green-800">
                Entradas
              </Badge>
              <Badge className="dark:bg-red-800 dark:text-red-200 bg-red-400/30 text-red-600">
                Saidas
              </Badge>
              <Badge className="dark:bg-[#df5e3a] dark:text-[#f3e2dd] bg-[#db7c61]/20 text-[#8f3820]">
                Transferências
              </Badge>
            </div>
          </div>
          <div className="flex gap-2 justify-center flex-row md:gap-4">
            <CreateMovementDialog type="Renda" label="Nova Receita" />
            <CreateMovementDialog type="Despesa" label="Nova Despesa" />
          </div>
        </div>
        <div>
          <Suspense fallback={<div></div>}>
            <TableMovements />
          </Suspense>
        </div>
        <Separator className="my-4" />
        <div>
          <TableReccurrent />
        </div>
      </section>
    </RangeDateProvider>
  );
}
