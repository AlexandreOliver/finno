import { Movement } from "../entity/movements.entity";

import {
  FunctionCount,
  FunctionDelete,
  FunctionList,
  FunctionSave,
} from "../entity/types";

export interface IMovementGateway {
  save: FunctionSave<Movement, boolean>;
  list: FunctionList<Movement>;
  deleteById: FunctionDelete<boolean>;
  count: FunctionCount;
}
