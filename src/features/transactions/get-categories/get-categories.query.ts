import { categoriesProps } from "@/domain/entity/categories.entity";

export type GetCategoriesQuery<K extends keyof categoriesProps> = {
  userId?: string;
  returnFields: readonly K[];
};
