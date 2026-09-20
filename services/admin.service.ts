import "server-only";

import { authClient, dbClient } from "@/lib/db/client";
import { ASSIGNABLE_ROLES, FOUNDER_ROLE, STAFF_ROLES, type StaffRole } from "@/lib/auth/roles";
import { AppError } from "@/lib/utils/errors";
import type { PortalPerson, PortalRole } from "@/types";

const PAGE = 500;

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

/** Every portal person (Supabase Auth user) joined with their profile role/status. */
export async function portalPeople(): Promise<PortalPerson[]> {
  const client = authClient();
  const users: Array<{ id: string; email?: string; created_at?: string; last_sign_in_at?: string }> = [];
  for (let page = 1; ; page++) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage: PAGE });
    if (error) throw new AppError("PEOPLE_LOOKUP_FAILED", error.message, 500);
    users.push(...data.users);
    if (data.users.length < PAGE) break;
  }
  const { data: profiles, error } = await dbClient().from("profiles").select("user_id, role, active");
  if (error) throw new AppError("PEOPLE_LOOKUP_FAILED", error.message, 500);
  const byId = new Map((profiles as Array<{ user_id: string; role: string; active: boolean | null }>).map((row) => [row.user_id, row]));
  return users.map((user) => {
    const profile = byId.get(user.id);
    const role = (profile?.role as PortalRole | undefined) ?? "user";
    return {
      id: user.id,
      email: user.email ?? "—",
      role,
      active: profile ? profile.active !== false : true,
      createdAt: user.created_at ?? null,
      lastSignIn: user.last_sign_in_at ?? null,
    };
  });
}

export const staffRoles = ASSIGNABLE_ROLES;
