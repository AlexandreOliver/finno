"use server";

import categoriesModel, {
  FunctionFindAll,
} from "@/features/models/categoriesModel";

export type Category = {
  id: string;
  label: string;
  type: string;
};

export const findCategories: FunctionFindAll = async ({
  userId,
  returnFields,
}) => {
  const categoriesFromDb = await categoriesModel.findAll({
    userId,
    returnFields,
  });

  return categoriesFromDb;
};
