export const TYPES_TRANSACTION = ["debito", "credito"] as const;
export type TypesTransaction = (typeof TYPES_TRANSACTION)[number];

export const STATUS_TRANSACTION = [
  "ativo",
  "pausado",
  "terminado",
  "esperando",
] as const;
export type StatusTransaction = (typeof STATUS_TRANSACTION)[number];

export const FREQUENCIES_RECCURRENT = [
  "daily",
  "weekly",
  "monthly",
  "yearly",
] as const;
export type FrequenciesReccurrent = (typeof FREQUENCIES_RECCURRENT)[number];
