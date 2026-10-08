import { transactionsFor } from "@/lib/db/portal";
import { getSession } from "@/lib/auth/session";

export const runtime = "nodejs";

function csvCell(value: unknown) { return `"${String(value ?? "").replaceAll('"', '""')}"`; }

export async function GET() {
  const session = await getSession();
  if (!session) return new Response(null, { status: 302, headers: { Location: "/" } });
  const rows = await transactionsFor(session.userId);
  if (!rows.length) return new Response(null, { status: 302, headers: { Location: "/dashboard?error=Nothing%20to%20export%20%E2%80%94%20sync%20first." } });
  const columns = Object.keys(rows[0]);
  const body = [columns.join(","), ...rows.map((row) => columns.map((column) => csvCell(row[column as keyof typeof row])).join(","))].join("\n");
  return new Response(body, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="aurum_transactions_${new Date().toISOString().replace(/[:.]/g, "-")}.csv"` } });
}
