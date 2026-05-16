import {
  CardsKpis,
  ChartTransactions,
  FonteRenda,
} from "@/features/dasboard/components";

import { cookies } from "next/headers";

import { verifySession } from "@/features/authorization/services/verifysession";
import { formatNome } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const metadata = {
  title: "Dashboard",
};

export default async function Page() {
  const sessionCookie = (await cookies()).get("session_token");

  const authUser = await verifySession(sessionCookie?.value as string);

  const nomeCompleto = formatNome(
    authUser.user.firstName,
    authUser.user.lastName,
  );
  const dateFormated = format(new Date(), "EEEE, do MMMM yyyy", {
    locale: ptBR,
  });

  return (
    <section className="flex flex-col gap-2 w-full">
      <div>
        <div className="p-3 bg-card border-b-4">
          <p className="text-3xl tracking-tight font-medium">{nomeCompleto}</p>
          <p className="text-muted-foreground text-md"> {dateFormated}</p>
        </div>
        <div className="grid grid-cols-1 gap-2 xl:grid-cols-12">
          <div className="xl:col-span-6">
            <CardsKpis />
          </div>
          <div className="xl:col-span-6">
            <FonteRenda />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-2">
        <div className="col-span-7">
          <ChartTransactions />
        </div>
        <div className="col-span-5"></div>
      </div>
    </section>
  );
}
