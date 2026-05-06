import user from "@/features/models/user";

export async function GET() {
  const s = user.getAll();
  return new Response((await s).toString(), {
    status: 200,
  });
}
