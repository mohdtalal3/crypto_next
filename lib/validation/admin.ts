import { z } from "zod";
import { ASSIGNABLE_ROLES } from "@/lib/auth/roles";

export const createStaffSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(255),
  password: z.string().min(8, "Password must be at least 8 characters.").max(256),
  role: z.enum(ASSIGNABLE_ROLES),
});

export const updateStaffSchema = z.object({
  role: z.enum(ASSIGNABLE_ROLES).optional(),
  active: z.boolean().optional(),
});
