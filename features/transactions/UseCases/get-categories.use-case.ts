import { categoriesProps } from "@/domain/categories/categories.entity";
import { categoriesGateway } from "@/domain/categories/categories.gateway";

export class GetCategoriesUseCase {
  private constructor(
    private readonly categoriesRepository: categoriesGateway,
  ) {}

  public static create(transactionRepository: categoriesGateway) {
    return new GetCategoriesUseCase(transactionRepository);
  }

  public async execute<K extends keyof categoriesProps>({
    userId,
    returnFields,
  }: {
    userId?: string;
    returnFields: readonly K[];
  }): Promise<Pick<categoriesProps, K>[]> {
    const categorias = await this.categoriesRepository.list(userId);

    const obj1 = categorias.map((ctg) => {
      const ctgObj = ctg.toJson() as categoriesProps;

      return returnFields.reduce(
        (obj, field) => {
          obj[field] = ctgObj[field];

          return obj;
        },
        {} as Pick<categoriesProps, K>,
      );
    });

    return obj1;
  }
}
