import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import db from "@/infrastructure/database";

import { WalletsRepositoryDrizzle } from "@/infrastructure/repositories/drizzle/drizzle-wallets.repository";
import { GetFinanceSumaryHandler } from "@/features/dashboard/get-finance-sumary/get-finance-sumary.handler";
import { GetWalletsUseCase } from "@/features/dashboard/statement/UseCases/get-wallets.use-case";
import { DrizzleFinanceSumaryRepsitory } from "@/infrastructure/repositories/queries/drizzle-finance-suamary.repository";

const sumaryRepository = new DrizzleFinanceSumaryRepsitory();
const sumaryHandler = GetFinanceSumaryHandler.create(sumaryRepository);

const WalletsRepository = WalletsRepositoryDrizzle.create(db);
const getWallets = GetWalletsUseCase.create(WalletsRepository);

const card_Patrimonio = {
  totalPatrimonio: 34343.0,
  diff_lastMonth: "9.8K",
  percent_diff: 8.4,
};

const card_Disponivel = {
  total: 34343.1,
  diff_lastMonth: 123,
  percent_diff: 1.2,
};

const card_GastosMensais = {
  totalCurrent: 343.02,
  totalLastMonth: 121.0,
  diff_lastMonth: 123,
  percent_diff: 0.2,
};

const card_EntradaMensais = {
  totalCurrent: 343.02,
  totalLastMonth: 121.0,
  diff_lastMonth: 123,
  percent_diff: 0.2,
};

interface CardsKpisProps {
  userId: string;
}

export async function CardsKpis(props: CardsKpisProps) {
  const wallets = await getWallets.execute({ ownerId: props.userId });

  const sumary = await sumaryHandler.execute({
    walletId: wallets.find((w) => w.labelName === "Principal")?.id as string,
    currentDate: new Date(),
  });

  console.log(sumary);
  return (
    <div className="overflow-hidden rounded-xl">
      <div className="grid grid-cols-1 xl:grid-cols-8">
        <Card className="overflow-hidden rounded-none xl:col-span-4 ">
          <CardHeader>
            <CardTitle>Gastos Mensais</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-medium">
                {sumary
                  ? sumary.gastoMensal.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })
                  : "R$  ---,--"}
              </p>
              <p className="text-muted-foreground text-xs">
                R${" "}
                {card_GastosMensais.diff_lastMonth > 1
                  ? `${card_GastosMensais.diff_lastMonth.toFixed(2)} mais do que no mês passado`
                  : `${card_GastosMensais.diff_lastMonth.toFixed(2)} menos do que no mês passado`}
              </p>
            </div>
            <Badge
              variant="secondary"
              className={cn({
                "bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-300":
                  card_GastosMensais.percent_diff >= 1,
                "bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-500":
                  card_GastosMensais.percent_diff < 1,
              })}
            >
              {card_GastosMensais.percent_diff}%
            </Badge>
          </CardContent>
        </Card>
        <Card className="overflow-hidden rounded-none xl:col-span-4 ">
          <CardHeader>
            <CardTitle>Entradas Mensais</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-medium">
                {sumary
                  ? sumary.entradaMensal.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })
                  : "R$ ---,--"}
              </div>
              <p className="text-muted-foreground text-xs">
                R${" "}
                {card_EntradaMensais.diff_lastMonth > 1
                  ? `${card_EntradaMensais.diff_lastMonth.toFixed(2)} mais do que no mês passado`
                  : `${card_EntradaMensais.diff_lastMonth.toFixed(2)} menos do que no mês passado`}
              </p>
            </div>
            <Badge
              variant="secondary"
              className={cn({
                "bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-300":
                  card_EntradaMensais.percent_diff >= 1,
                "bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-500":
                  card_EntradaMensais.percent_diff < 1,
              })}
            >
              {card_EntradaMensais.percent_diff}%
            </Badge>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-none xl:col-span-4">
          <CardHeader>
            <CardTitle>Patrimônio Líquido</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-medium">
                {sumary
                  ? sumary.saldoGeral.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })
                  : "R$ ---,--"}
              </div>
              <p className="text-muted-foreground text-xs">
                {card_Patrimonio.diff_lastMonth} a mais que o último mês
              </p>
            </div>
            <Badge
              variant="secondary"
              className={cn({
                "bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-300":
                  card_Patrimonio.percent_diff >= 1,
                "bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-500":
                  card_Patrimonio.percent_diff < 1,
              })}
            >
              {card_Patrimonio.percent_diff}%
            </Badge>
          </CardContent>
        </Card>
        <Card className="overflow-hidden rounded-none xl:col-span-4">
          <CardHeader>
            <CardTitle>Dísponivel</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-medium">
                {sumary
                  ? sumary.saldoMensal.toLocaleString("pt-BR", {
                      currency: "BRL",
                      style: "currency",
                    })
                  : "R$ ---,--"}
              </div>
              <p className="text-muted-foreground text-xs">
                {`
                ${card_Disponivel.diff_lastMonth.toLocaleString("pt-BR", {
                  currency: "BRL",
                  style: "currency",
                })} 
                acima de sua média de 30 dias`}
              </p>
            </div>
            <Badge
              variant="secondary"
              className={cn({
                "bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-300":
                  card_Disponivel.percent_diff >= 1,
                "bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-500":
                  card_Disponivel.percent_diff < 1,
              })}
            >
              {card_Disponivel.percent_diff}%
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
