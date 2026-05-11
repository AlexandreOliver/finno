import * as users from "./users";
import * as sessions from "./sessions";
import * as accounts from "./accounts";
import * as categories from "./categories";
import * as transfers from "./transfers";
import * as movements from "./movements";
import * as templateReccurent from "./templateReccurent";

export const schemas = {
  ...users,
  ...sessions,
  ...accounts,
  ...categories,
  ...transfers,
  ...movements,
  ...templateReccurent,
};
