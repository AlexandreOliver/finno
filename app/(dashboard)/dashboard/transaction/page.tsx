import { Badge } from "@/components/ui/badge";
import { verifySession } from "@/features/authorization/services/verifysession";
import walletsModel from "@/features/models/walletsModel";
import getQueryClient from "@/features/Provider/QueryClientServer";
import { CreateDialog } from "@/features/transactions/components";
import { TableMovements } from "@/features/transactions/components/TableMovements";
import { getMovementsService } from "@/features/transactions/services/getMovements";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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

  const queryClient = getQueryClient();

  const wallets = await walletsModel.findAllByOwner({
    ownerId: authUser.user.id,
    returnFields: ["id"],
  });

  const wallets_Ids = wallets.map((w) => w.id);

  const hoje = new Date();

  const query = {
    date: {
      start: new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        1,
      ).toLocaleDateString("en-US"),
      end: new Date().toLocaleDateString("en-US"),
    },
  };

  await queryClient.prefetchQuery({
    queryKey: ["movements", wallets_Ids, { page: 1, limit: 10, query }],
    queryFn: () =>
      getMovementsService({
        walletId: wallets_Ids as string[],
        pagination: {
          page: 1,
          limit: 10,
        },
        query,
      }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <section className="flex flex-col gap-3 w-full">
        <div className="p-3 flex justify-between items-center">
          <div>
            <p className="text-muted-foreground text-md">{dateFormated}</p>
            <p className="text-3xl tracking-tight font-medium">Transações</p>
            <div className="flex gap-2 mt-1">
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
          <div className="flex gap-4">
            <CreateDialog type="Renda" label="Nova Receita" />
            <CreateDialog type="Despesa" label="Nova Despesa" />
          </div>
        </div>
        <div>
          <TableMovements />
        </div>
      </section>
    </HydrationBoundary>
  );
}
