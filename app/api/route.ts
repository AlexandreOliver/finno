import user from "@/models/user";

export async function GET() {
  const s = user.getAll();
  return new Response((await s).toString(), {
    status: 200,
  });
}
