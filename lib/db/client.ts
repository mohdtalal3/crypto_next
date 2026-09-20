import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// The database schema is maintained as existing SQL migrations rather than a
// generated Supabase type file, so this is the one typed boundary to Supabase.
let serviceClient: SupabaseClient<any> | undefined;

function config() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY must be configured.");
  return { url, key };
}

/** Service-role client for data reads/writes only. Never authenticate a user on it. */
export function dbClient() {
  const { url, key } = config();
  if (!serviceClient) serviceClient = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  return serviceClient;
}

/** A disposable auth client prevents a sign-in JWT from replacing the service role. */
export function authClient() {
  const { url, key } = config();
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}
