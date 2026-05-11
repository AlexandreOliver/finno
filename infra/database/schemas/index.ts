import * as users from "./users";
import * as sessions from "./sessions";
import * as accounts from "./accounts";
import * as categories from "./categories";

export const schemas = {
  ...users,
  ...sessions,
  ...accounts,
  ...categories,
};
