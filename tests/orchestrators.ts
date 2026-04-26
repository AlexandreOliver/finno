import db, { runMigrations } from "@/infra/database";
import { sql } from "drizzle-orm";
import retry from "async-retry";

async function clearDatabase() {
  await db.execute(sql`drop schema public cascade; create schema public`);
}

async function waitForAllServices() {
  await waitForWeb();
}

async function waitForWeb() {
  return retry(fetchAPI, { retries: 20 });

  async function fetchAPI() {
    const response = await fetch("http://localhost:3000/api");

    if (response.status != 200) throw Error();
  }
}

async function runPendingMigrations() {
  await runMigrations();
}

const orchestrator = {
  clearDatabase,
  runMigrations,
  waitForAllServices,
  runPendingMigrations,
};

export default orchestrator;
