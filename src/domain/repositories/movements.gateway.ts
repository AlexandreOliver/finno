import { Movement } from "../entity/movements.entity";

import {
  FunctionCount,
  FunctionDelete,
  FunctionList,
  FunctionSave,
} from "../entity/types";

export interface IMovementGateway {
  saveOrUpdate: FunctionSave<Movement, boolean>;
  list: FunctionList<Movement>;
  getById: (id: string) => Promise<Movement | null>;
  deleteById: FunctionDelete<boolean>;
  count: FunctionCount;
}
