"use server";

import { verifySession } from "@/features/authorization/services/verifysession";
import { DasboardDataQueryHandler } from "@/features/dashboard/query-dashboard-data/dashboard-data.query-handler";
import { DashboardDataQuery } from "@/features/dashboard/query-dashboard-data/dashboard-data.query";
import db from "@/infrastructure/database";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import * as zod from "zod";

const DashboardDataQuerySchema = zod.object({
  userId: zod.uuidv7(),
  referenceMonth: zod
    .stringFormat("YYYY-MM", /^[1-2]{1}[0-9]{3}-[0-1]{1}[0-9]$/, {
      error: "Envie no formato YYYY-MM",
    })
    .refine((val) => !Number.isNaN(new Date(`${val}-15T00:00:00.000Z`)))
    .transform((val) => new Date(`${val}-15T00:00:00.000Z`)),
});

export async function getDashboardData({
  userId,
  referenceMonth,
}: Pick<DashboardDataQuery, "userId"> & { referenceMonth: string }) {
  const cookiesJar = await cookies();
  const sessionCookie = cookiesJar.get("session_token");

  if (!sessionCookie) redirect("auth/signin");
  const auth = await verifySession(sessionCookie?.value);
  if (!auth.isAuth) redirect("auth/signin");

  const props = DashboardDataQuerySchema.safeParse({ userId, referenceMonth });
  // console.log(props);

  if (!props.success) {
    return null;
  }

  const sumaryHandler = DasboardDataQueryHandler.create(db);

  const response = await sumaryHandler.execute(props.data);

  return response;
}
