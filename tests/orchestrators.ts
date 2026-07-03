import db from "@/infrastructure/database";
import { sql } from "drizzle-orm";
import retry from "async-retry";
import { execSync } from "node:child_process";

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

async function seeding() {
  execSync("pnpm run db:seed", { stdio: "inherit" });
}

const orchestrator = {
  seeding,
  clearDatabase,
  waitForAllServices,
};

export default orchestrator;
