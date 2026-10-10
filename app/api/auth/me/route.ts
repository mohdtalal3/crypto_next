import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession().catch(() => null);
  return Response.json(
    { authenticated: Boolean(session) },
    { headers: { "cache-control": "no-store" } },
  );
}
