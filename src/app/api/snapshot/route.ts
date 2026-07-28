import { SnapshotWalletsCommandHanlder } from "@/features/Routines/create-snapshot-wallet/snapshot-wallet.command-handler";
import { FinanceSummaryQueryService } from "@/features/Services/finance-summary.service-query";
import { db } from "@/infrastructure/database";

export async function POST() {
  const genSnapshotWallets = new SnapshotWalletsCommandHanlder(
    db,
    new FinanceSummaryQueryService(db),
  );

  try {
    await genSnapshotWallets.execute();

    // await genSnapshotWallets.execute(new Date("2025-10-01T13:00:00"));
    // await genSnapshotWallets.execute(new Date("2025-11-01T13:00:00"));
    // await genSnapshotWallets.execute(new Date("2025-12-01T13:00:00"));
    // await genSnapshotWallets.execute(new Date("2026-01-01T13:00:00"));
    // await genSnapshotWallets.execute(new Date("2026-02-01T13:00:00"));
    // await genSnapshotWallets.execute(new Date("2026-03-01T13:00:00"));
    // await genSnapshotWallets.execute(new Date("2026-04-01T13:00:00"));
    // await genSnapshotWallets.execute(new Date("2026-05-01T13:00:00"));
    // await genSnapshotWallets.execute(new Date("2026-06-01T13:00:00"));
  } catch (err) {
    const error = err as Error;

    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
    });
  }

  return Response.json({ message: true });
}
