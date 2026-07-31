import { seeding } from "@/infrastructure/scripts/seed";

export async function GET() {
  try {
    await seeding();
  } catch (err) {
    const error = err as Error;
    console.log(error);

    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
    });
  }

  return Response.json({ message: "Seed feito com sucesso" });
}
