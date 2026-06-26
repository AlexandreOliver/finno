import { User } from "./user.entity";
import { FunctionSave } from "../movements/types";

export interface IUserGateway {
  save: FunctionSave<User, boolean>;
  list: () => Promise<User[]>;
  getById: () => Promise<User[]>;
  getByEmail: (props: { email: string }) => Promise<User | null>;
  deleteById: () => Promise<boolean>;
}
