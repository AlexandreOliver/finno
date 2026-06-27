import { User } from "../entity/user.entity";
import { FunctionSave } from "../entity/types";

export interface IUserGateway {
  save: FunctionSave<User, boolean>;
  list: () => Promise<User[]>;
  getById: () => Promise<User | null>;
  getByEmail: (props: { email: string }) => Promise<User | null>;
  deleteById: () => Promise<boolean>;
}
