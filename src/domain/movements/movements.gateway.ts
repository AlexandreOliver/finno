import { Movement } from "./movements.entity";

import {
  FunctionCount,
  FunctionDelete,
  FunctionList,
  FunctionSave,
} from "./types";

export interface IMovementGateway {
  save: FunctionSave<Movement, boolean>;
  list: FunctionList<Movement>;
  deleteById: FunctionDelete<boolean>;
  count: FunctionCount;
}
