import user from "@/features/models/user";
import { sedding } from "@/infra/database/seed";

export async function GET() {
  await sedding();
  const s = await user.getAll();
  return new Response(JSON.stringify(s), { status: 200 });
}
