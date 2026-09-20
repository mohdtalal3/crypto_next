import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createStaff } from "@/services/admin.service";
import { createStaffSchema } from "@/lib/validation/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "founder") return NextResponse.redirect(new URL("/tools", request.url), 303);
  const form = await request.formData();
  const parsed = createStaffSchema.safeParse({ email: form.get("email"), password: form.get("password"), role: form.get("role") });
  if (!parsed.success) return NextResponse.redirect(new URL(`/admin?error=${encodeURIComponent(parsed.error.issues[0].message)}`, request.url), 303);
  try {
    await createStaff(parsed.data.email, parsed.data.password, parsed.data.role, session.userId);
    return NextResponse.redirect(new URL("/admin?created=1", request.url), 303);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create the login.";
    return NextResponse.redirect(new URL(`/admin?error=${encodeURIComponent(message)}`, request.url), 303);
  }
}
