import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { updateStaff } from "@/services/admin.service";
import { updateStaffSchema } from "@/lib/validation/admin";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "founder") return NextResponse.redirect(new URL("/tools", request.url), 303);
  const { id } = await params;
  const form = await request.formData();
  const role = form.get("role");
  const active = form.get("active");
  const parsed = updateStaffSchema.safeParse({
    role: typeof role === "string" && role ? role : undefined,
    active: active === null ? undefined : active === "true",
  });
  if (!parsed.success) return NextResponse.redirect(new URL(`/admin?error=${encodeURIComponent(parsed.error.issues[0].message)}`, request.url), 303);
  try {
    await updateStaff(id, parsed.data, session.userId);
    return NextResponse.redirect(new URL("/admin?updated=1", request.url), 303);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update the staff member.";
    return NextResponse.redirect(new URL(`/admin?error=${encodeURIComponent(message)}`, request.url), 303);
  }
}
