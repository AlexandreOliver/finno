import { pgEnum } from "drizzle-orm/pg-core";
import {
  FREQUENCIES_RECCURRENT,
  STATUS_TRANSACTION,
  TYPES_TRANSACTION,
} from "@/domain/enums";

export const typesEnum = pgEnum("types", TYPES_TRANSACTION);

export const statusEnum = pgEnum("status", STATUS_TRANSACTION);

export const frequencyEnum = pgEnum("frequency", FREQUENCIES_RECCURRENT);
