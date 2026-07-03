import { Categories } from "../entity/categories.entity";
import { FunctionSave } from "@/domain/entity/types";

export interface categoriesGateway {
  save: FunctionSave<Categories, boolean>;
  list: FunctionList;
  findById: FunctionGet;
  deleteById: FunctionDelete;
}

export type FunctionList = (userId?: string) => Promise<Categories[]>;
export type FunctionGet = (id: string) => Promise<Categories>;
export type FunctionDelete = (id: string) => Promise<boolean>;
