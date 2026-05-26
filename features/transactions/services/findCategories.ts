"use server";

import { verifySession } from "@/features/authorization/services/verifysession";
import categoriesModel, {
  FunctionFindAll,
} from "@/features/models/categoriesModel";
import { cookies } from "next/headers";

type Category = {
  id: string;
  label: string;
  type: string;
};

export const findCategories: FunctionFindAll = async ({
  userId,
  returnFields,
}) => {
  const { isAuth } = await verifySession(
    (await cookies()).get("session_token")?.value as string,
  );

  if (!isAuth) throw new Error("Não autorizado");
  const categoriesFromDb = await categoriesModel.findAll({
    userId,
    returnFields,
  });

  return categoriesFromDb;
};
