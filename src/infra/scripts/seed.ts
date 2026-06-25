import { schemas } from "../database/schemas";
import {
  seed_categorias,
  seed_movements,
  seed_templateReccurent,
  seed_transfers,
  seed_users,
  seed_wallets,
} from "../defaultData";
import db from "../database/index";
import { sql } from "drizzle-orm";

async function sedding() {
  console.log("Iniciando seeding...");

  try {
    await db.insert(schemas.users).values(seed_users).onConflictDoNothing();

    await db
      .insert(schemas.categories)
      .values(seed_categorias)
      .onConflictDoNothing();

    await db.insert(schemas.wallets).values(seed_wallets).onConflictDoNothing();

    await db
      .insert(schemas.templateReccurent)
      .values(seed_templateReccurent)
      .onConflictDoUpdate({
        target: schemas.templateReccurent.id,
        set: {
          start_date: sql`excluded.start_date`,
          end_date: sql`excluded.end_date`,
        },
      });

    await db
      .insert(schemas.movements)
      .values(seed_movements)
      .onConflictDoUpdate({
        target: schemas.movements.id,
        set: {
          executedAt: sql`excluded.executed_at`,
        },
      });

    await db
      .insert(schemas.transfers)
      .values(seed_transfers)
      .onConflictDoNothing();
  } catch (err) {
    const erro = err as Error;
    console.error(erro);
    process.exit(1);
  } finally {
    await db.$client.end();
  }

  console.log("Sedding Completa\n");
}

sedding();
