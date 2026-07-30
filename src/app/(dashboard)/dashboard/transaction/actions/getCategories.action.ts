"use server";

import { verifySession } from "@/features/authorization/services/verifysession";

import db from "@/infrastructure/database";

import { CategoriesRepositoryDrizzle } from "@/infrastructure/repositories/drizzle/drizzle-categories.repository";
import { GetCategoriesHandler } from "@/features/transactions/get-categories/get-categories.handler";
import { categoriesProps } from "@/domain/entity/categories.entity";

const categoriesRepository = CategoriesRepositoryDrizzle.create(db);
const GetCategories = GetCategoriesHandler.create(categoriesRepository);

export const getCategories = async <K extends keyof categoriesProps>({
  userId,
  returnFields,
}: {
  userId: string;
  returnFields: K[];
}) => {
  const { isAuth } = await verifySession();

  if (!isAuth) throw new Error("Não autorizado");

  const categoriesFromDb = await GetCategories.execute({
    userId,
    returnFields,
  });

  return categoriesFromDb;
};
