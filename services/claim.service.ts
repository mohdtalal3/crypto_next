import "server-only";

import { dbClient } from "@/lib/db/client";
import { AppError } from "@/lib/utils/errors";

export interface ClaimRow {
  id: number;
  pretty_id: string | null;
  claim_number: string;
  created_at: string;
}

/** Claim numbers are Aurum-<backoffice pretty_id>-MCA001, MCA002, ... per person. */
export async function createClaimNumber(userId: string): Promise<ClaimRow> {
  const client = dbClient();
  const profile = await client.from("backoffice_profile").select("pretty_id").eq("user_id", userId).maybeSingle();
  if (profile.error) throw new AppError("CLAIM_FAILED", profile.error.message, 500);
  const prettyId = profile.data?.pretty_id as string | undefined;
  if (!prettyId) throw new AppError("CLAIM_NO_PROFILE", "No Backoffice profile yet — sync Backoffice.aurum first so the claim number can use your pretty ID.", 400);

  const existing = await client.from("claim").select("claim_number").eq("user_id", userId).order("created_at", { ascending: false }).limit(1);
  if (existing.error) throw new AppError("CLAIM_FAILED", existing.error.message, 500);
  const last = (existing.data?.[0]?.claim_number as string | undefined) ?? "";
  const match = last.match(/MCA(\d+)$/);
  const next = match ? Number(match[1]) + 1 : 1;
  const claimNumber = `Aurum-${prettyId}-MCA${String(next).padStart(3, "0")}`;

  const inserted = await client.from("claim").insert({ user_id: userId, pretty_id: prettyId, claim_number: claimNumber }).select("id, pretty_id, claim_number, created_at").single();
  if (inserted.error) throw new AppError("CLAIM_FAILED", inserted.error.message, 500);
  return inserted.data as ClaimRow;
}

/** Creates the first claim number during the Backoffice sync; a no-op once one exists. */
export async function ensureFirstClaim(userId: string) {
  const existing = await dbClient().from("claim").select("id").eq("user_id", userId).limit(1);
  if (existing.error) throw new AppError("CLAIM_FAILED", existing.error.message, 500);
  if (existing.data?.length) return null;
  return createClaimNumber(userId);
}

export async function claimsFor(userId: string): Promise<ClaimRow[]> {
  const result = await dbClient().from("claim").select("id, pretty_id, claim_number, created_at").eq("user_id", userId).order("created_at", { ascending: false });
  if (result.error) throw new AppError("CLAIM_LOOKUP_FAILED", result.error.message, 500);
  return result.data as ClaimRow[];
}
