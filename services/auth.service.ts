import "server-only";

import { authClient } from "@/lib/db/client";
import { roleFor } from "@/lib/db/portal";
import { AppError } from "@/lib/utils/errors";
import type { PortalSession } from "@/types";

async function sessionFor(id: string, email: string): Promise<PortalSession> {
  return { userId: id, email, role: await roleFor(id) };
}

export async function signUp(email: string, password: string) {
  const { data, error } = await authClient().auth.signUp({ email: email.toLowerCase(), password });
  if (error || !data.user) throw new AppError("SIGNUP_FAILED", error?.message || "Signup failed — check the email and try again.", 400);
  if (!data.session) throw new AppError("EMAIL_CONFIRMATION_REQUIRED", "Account created — confirm your email, then log in.", 400);
  return sessionFor(data.user.id, data.user.email ?? email);
}

export async function signIn(email: string, password: string) {
  const { data, error } = await authClient().auth.signInWithPassword({ email, password });
  if (error || !data.user) throw new AppError("INVALID_CREDENTIALS", "Wrong email or password.", 401);
  return sessionFor(data.user.id, data.user.email ?? email);
}
