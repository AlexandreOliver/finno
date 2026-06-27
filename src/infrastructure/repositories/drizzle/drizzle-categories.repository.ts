import { categoriesProps, Categories } from "@/domain/entity/categories.entity";
import { categoriesGateway } from "@/domain/repositories/categories.gateway";

import { categories } from "@/infrastructure/database/schemas/categories";

import db from "@/infrastructure/database";
import { eq, SQL, or, isNull } from "drizzle-orm";

export class CategoriesRepositoryDrizzle implements categoriesGateway {
  private constructor(private readonly dbInstance: typeof db) {}

  public static create(dbInstance: typeof db) {
    return new CategoriesRepositoryDrizzle(dbInstance);
  }

  findById(id: string): Promise<Categories> {
    throw new Error("Method not implemented.");
  }

  save(props: categoriesProps): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  async list(userId?: string): Promise<Categories[]> {
    const filters: SQL[] = [];

    if (userId) {
      filters.push(eq(categories.userId, userId));
    }

    const categoriesDb = await this.dbInstance
      .select()
      .from(categories)
      .where(or(...filters, isNull(categories.userId)));

    const categoriesList = categoriesDb.map((ctg) => Categories.with(ctg));

    return categoriesList;
  }
  deleteById(id: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
}
