"use server";

import { verifySession } from "@/features/authorization/services/verifysession";
import { cookies } from "next/headers";

import db from "@/infra/database";

import { CategoriesRepositoryDrizzle } from "@/infra/repositories/drizzle/drizzle-categories.repository";
import { GetCategoriesUseCase } from "@/features/transactions/UseCases/get-categories.use-case";
import { categoriesProps } from "@/domain/categories/categories.entity";

const categoriesRepository = CategoriesRepositoryDrizzle.create(db);
const GetCategories = GetCategoriesUseCase.create(categoriesRepository);

export const getCategories = async <K extends keyof categoriesProps>({
  userId,
  returnFields,
}: {
  userId: string;
  returnFields: K[];
}) => {
  const { isAuth } = await verifySession(
    (await cookies()).get("session_token")?.value as string,
  );

  if (!isAuth) throw new Error("Não autorizado");

  const categoriesFromDb = await GetCategories.execute({
    userId,
    returnFields,
  });

  return categoriesFromDb;
};
