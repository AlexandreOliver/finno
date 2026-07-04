import { Badge } from "@/components/ui/badge";
import { verifySession } from "@/features/authorization/services/verifysession";
import { CreateDialog } from "@/app/(dashboard)/dashboard/transaction/_components/CreateDialog";
import { TableMovements } from "@/app/(dashboard)/dashboard/transaction/_components/TableMovements";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

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
          <CreateDialog type="Renda" label="Nova Receita" />
          <CreateDialog type="Despesa" label="Nova Despesa" />
        </div>
      </div>
      <div>
        <Suspense fallback={<div></div>}>
          <TableMovements />
        </Suspense>
      </div>
    </section>
  );
}
