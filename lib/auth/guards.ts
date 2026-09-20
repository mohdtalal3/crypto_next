import "server-only";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { isStaff } from "@/lib/auth/roles";
import { activeFor, emailFor } from "@/lib/db/portal";
import type { PortalSession } from "@/types";

export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/");
  if (isStaff(session.role) && !(await activeFor(session.userId))) redirect("/?error=Your%20portal%20access%20has%20been%20revoked.");
  return session;
}

export async function requireStaff() {
  const session = await requireSession();
  if (!isStaff(session.role)) redirect("/tools");
  return session;
}

export async function requireFounder() {
  const session = await requireSession();
  if (session.role !== "founder") redirect("/admin/users");
  return session;
}

export interface ViewAs {
  session: PortalSession;
  userId: string;
  /** Set when staff browse another person's data via ?user=. */
  viewing: { id: string; email: string } | null;
}

/** Resolves whose data a page shows: the signed-in user, or another person for staff. */
export async function viewAs(searchParams: { user?: string }): Promise<ViewAs> {
  const session = await requireSession();
  const requested = typeof searchParams.user === "string" ? searchParams.user : "";
  if (!requested || requested === session.userId || !isStaff(session.role)) return { session, userId: session.userId, viewing: null };
  return { session, userId: requested, viewing: { id: requested, email: await emailFor(requested) } };
}
