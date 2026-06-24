import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/app/(dashboard)/dashboard/transaction/actions/getCategories";
import { categoriasQuerys } from "@/features/Provider/queryKeys";
import { categoriesProps } from "@/domain/categories/categories.entity";

export function useCategories<K extends keyof categoriesProps>({
  userId,
  returnFields,
}: {
  userId: string | undefined;
  returnFields: K[];
}) {
  return useQuery({
    ...categoriasQuerys.withOwned(userId as string),
    queryFn: () => getCategories({ userId: userId as string, returnFields }),
    enabled: !!userId,
  });
}
