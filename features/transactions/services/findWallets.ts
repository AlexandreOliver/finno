"use server";

import walletsModel, {
  FunctionFindAllByOwner,
} from "@/features/models/walletsModel";

export type Wallet = {
  id: string;
  label: string;
};

export const findWallets: FunctionFindAllByOwner = async ({
  ownerId,
  returnFields,
}) => {
  const result = await walletsModel.findAllByOwner({
    ownerId,
    returnFields,
  });

  return result;
};
