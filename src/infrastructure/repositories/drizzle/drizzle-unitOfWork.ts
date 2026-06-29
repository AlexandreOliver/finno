import { IUnitOfWork } from "@/features/unitOfWork";
import { databaseGlobal, transactionStorage } from "@/infrastructure/database";

export class DrizzleUnitOfWork implements IUnitOfWork {
  public async runInTransaction<T>(work: () => Promise<T>): Promise<T> {
    return databaseGlobal.transaction(async (tx) => {
      return transactionStorage.run(tx, work);
    });
  }
}
