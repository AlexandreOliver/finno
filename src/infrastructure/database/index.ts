import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { schemas } from "./schemas";
import "dotenv/config";
import { AsyncLocalStorage } from "async_hooks";

const configConnection = {
  connectionString: process.env.DATABASE_URL!,
  ssl: process.env.NODE_ENV === "production",
};

const pool = new Pool({
  ...configConnection,
  application_name: "finn_web",
  idleTimeoutMillis: 3000,
});

export const transactionStorage = new AsyncLocalStorage();

export const databaseGlobal = drizzle({
  client: pool,
  casing: "snake_case",
  schema: schemas,
});

export const db = new Proxy(databaseGlobal, {
  get(target, prop, receiver) {
    const activeTransaction = transactionStorage.getStore();
    const currentInstance = activeTransaction ?? target;
    return Reflect.get(currentInstance, prop, receiver);
  },
});

export default db;
