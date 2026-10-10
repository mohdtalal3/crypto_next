import "server-only";

import { authClient, dbClient } from "@/lib/db/client";
import { ASSIGNABLE_ROLES, FOUNDER_ROLE, STAFF_ROLES, type StaffRole } from "@/lib/auth/roles";
import { AppError } from "@/lib/utils/errors";
import type { PortalPerson, PortalRole } from "@/types";

export async function createStaff(email: string, password: string, role: StaffRole, creatorId: string) {
  const { data, error } = await authClient().auth.admin.createUser({ email: email.toLowerCase(), password, email_confirm: true });
  if (error || !data.user) throw new AppError("STAFF_CREATE_FAILED", error?.message || "Could not create the login.", 400);
  const result = await dbClient().from("profiles").upsert({ user_id: data.user.id, role, active: true, created_by: creatorId, updated_at: new Date().toISOString() });
  if (result.error) throw new AppError("STAFF_CREATE_FAILED", `Login created but role setup failed: ${result.error.message}`, 500);
  return data.user;
}

export async function updateStaff(targetId: string, patch: { role?: StaffRole; active?: boolean }, actorId: string) {
  if (targetId === actorId) throw new AppError("STAFF_SELF", "You cannot change your own access.", 400);
  const { data: existing, error } = await dbClient().from("profiles").select("role").eq("user_id", targetId).maybeSingle();
  if (error) throw new AppError("STAFF_UPDATE_FAILED", error.message, 500);
  if (!existing || !(STAFF_ROLES as readonly string[]).includes(existing.role)) throw new AppError("STAFF_NOT_FOUND", "Staff member not found.", 404);
  if (existing.role === FOUNDER_ROLE) throw new AppError("STAFF_FOUNDER", "The founder account cannot be modified.", 400);
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.role) updates.role = patch.role;
  if (patch.active !== undefined) updates.active = patch.active;
  const result = await dbClient().from("profiles").update(updates).eq("user_id", targetId);
  if (result.error) throw new AppError("STAFF_UPDATE_FAILED", result.error.message, 500);
}

const PEOPLE_PAGE_SIZE = 20;

/** One server-side page of people, straight from profiles (which carries the
    denormalized email and last sign-in — see migrations/024). `hideFounder`
    removes the founder row for non-founder staff and adjusts the total so
    pagination stays honest. */
export async function peoplePage(page: number, hideFounder: boolean, search: string): Promise<{ rows: PortalPerson[]; total: number }> {
  const db = dbClient();
  const from = (page - 1) * PEOPLE_PAGE_SIZE;
  let query = db.from("profiles").select("user_id, role, active, created_at, email, last_sign_in_at", { count: "exact" });
  if (search) query = query.ilike("email", `%${search}%`);
  const result = await query.order("created_at").range(from, from + PEOPLE_PAGE_SIZE - 1);
  if (result.error) throw new AppError("PEOPLE_LOOKUP_FAILED", result.error.message, 500);
  let total = result.count ?? 0;
  let founderId: string | null = null;
  if (hideFounder) {
    const founderResult = await db.from("profiles").select("user_id").eq("role", FOUNDER_ROLE).maybeSingle();
    if (founderResult.error) throw new AppError("PEOPLE_LOOKUP_FAILED", founderResult.error.message, 500);
    founderId = (founderResult.data as { user_id: string } | null)?.user_id ?? null;
    if (founderId) total = Math.max(0, total - 1);
  }
  const rows = (result.data as Array<{ user_id: string; role: string; active: boolean | null; created_at: string | null; email: string | null; last_sign_in_at: string | null }>)
    .filter((row) => row.user_id !== founderId)
    .map((row) => ({
      id: row.user_id,
      email: row.email ?? "—",
      role: (row.role as PortalRole) ?? "user",
      active: row.active !== false,
      createdAt: row.created_at,
      lastSignIn: row.last_sign_in_at,
    }));
  return { rows, total };
}

export const staffRoles = ASSIGNABLE_ROLES;
