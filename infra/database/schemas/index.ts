import * as users from "./users";
import * as sessions from "./sessions";
import * as accounts from "./accounts";

export const schemas = {
  ...users,
  ...sessions,
  ...accounts,
};
