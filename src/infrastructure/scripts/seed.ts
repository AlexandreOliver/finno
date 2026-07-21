import { schemas } from "../database/schemas";
import {
  seed_categorias,
  seed_movements,
  seed_templatereccurrent,
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

    await db
      .insert(schemas.wallets)
      .values(seed_wallets)
      .onConflictDoUpdate({
        target: schemas.wallets.id,
        set: {
          createdAt: sql`excluded.created_at`,
          balance: sql`excluded.balance`,
          updatedAt: sql`excluded.updated_at`,
          labelName: sql`excluded.label_name`,
        },
      });

    await db
      .insert(schemas.templateReccurrent)
      .values(seed_templatereccurrent)
      .onConflictDoUpdate({
        target: schemas.templateReccurrent.id,
        set: {
          start_date: sql`excluded.start_date`,
          end_date: sql`excluded.end_date`,
          next_due_date: sql`excluded.next_due_date`,
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
