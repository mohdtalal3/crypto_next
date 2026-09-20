import type { PortalRole } from "@/types";

export const PORTAL_ROLES = ["user", "admin", "founder", "ceo", "coo"] as const;

export const STAFF_ROLES = ["founder", "admin", "ceo", "coo"] as const;

export const ASSIGNABLE_ROLES = ["ceo", "coo", "admin"] as const;

export type StaffRole = (typeof ASSIGNABLE_ROLES)[number];

export const FOUNDER_ROLE: PortalRole = "founder";

export const roleLabel: Record<PortalRole, string> = { founder: "Founder", admin: "Admin", ceo: "CEO", coo: "COO", user: "User" };

export function isStaff(role: PortalRole) {
  return (STAFF_ROLES as readonly string[]).includes(role);
}

export function isPortalRole(value: unknown): value is PortalRole {
  return typeof value === "string" && (PORTAL_ROLES as readonly string[]).includes(value);
}
