import "server-only";

import { aurumGet } from "@/scraping/shared/http";
import type { JsonObject } from "@/types";

const BASE = "https://mini.aurum.foundation";
const ORIGIN = "https://backoffice.aurum.foundation";

/** Fetches only the Backoffice affiliate endpoint (affiliateStats + partners). */
export async function fetchBackofficeAffiliates(token: string) {
  return aurumGet(token, `${BASE}/dashboard/affiliates`, ORIGIN) as Promise<JsonObject>;
}

/** Fetches only the Backoffice account settings (profile, credentials, inviter). */
export function fetchBackofficeProfile(token: string) {
  return aurumGet(token, `${BASE}/settings`, ORIGIN) as Promise<JsonObject>;
}
