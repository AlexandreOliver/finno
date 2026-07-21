import * as users from "./users";
import * as sessions from "./sessions";
import * as accounts from "./wallets";
import * as categories from "./categories";
import * as transfers from "./transfers";
import * as movements from "./movements";
import * as templateReccurrent from "./templateReccurrent";

export const schemas = {
  ...users,
  ...sessions,
  ...accounts,
  ...categories,
  ...transfers,
  ...movements,
  ...templateReccurrent,
};
