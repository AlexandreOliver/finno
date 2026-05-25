import "server-only";

import db from "@/infra/database";
import { wallets } from "@/infra/database/schemas/wallets";
import { eq, isNull, or } from "drizzle-orm";
import { cache } from "react";

type ColumnsTypes = typeof wallets.$inferSelect;

export type FunctionFindAllByOwner = <K extends keyof ColumnsTypes>({
  ownerId,
  returnFields,
}: {
  ownerId: string;
  returnFields: readonly K[];
}) => Promise<Pick<ColumnsTypes, K>[]>;

const findAllByOwner: FunctionFindAllByOwner = cache(
  async ({ returnFields, ownerId }) => {
    if (returnFields.length === 0) {
      return [];
    }

    const selectCollumns = returnFields.reduce(
      (acc, column) => {
        acc[column] = wallets[column];
        return acc;
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {} as any,
    );

    const walletsFromDb = await db
      .select(selectCollumns)
      .from(wallets)
      .where(or(isNull(wallets.ownerId), eq(wallets.ownerId, ownerId ?? "")));

    return walletsFromDb as unknown as Pick<
      ColumnsTypes,
      (typeof returnFields)[number]
    >[];
  },
);

const walletsModel = {
  findAllByOwner,
};

export default walletsModel;
