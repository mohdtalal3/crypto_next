import "server-only";

import { dbClient } from "@/lib/db/client";
import { REGIONS, REGION_POINTS, regionForCountry, type Region } from "@/lib/utils/regions";
import type { MemberGeo } from "@/lib/auth/geo";

const now = () => new Date().toISOString();
const DAY = 86400000;
const WINDOWS = { "24H": 1, "7D": 7, "100D": 100 } as const;
export type WindowKey = keyof typeof WINDOWS;

export interface RegionCount { region: Region | "Unknown"; count: number }
export interface MemberPoint { latitude: number; longitude: number }
export interface ObservatoryData {
  members: number;
  newMembers7d: number;
  history: number[];
  windows: Record<WindowKey, RegionCount[]>;
  points: Record<string, { lon: number; lat: number; count: number }>;
  memberPoints: MemberPoint[];
}

/** Stores a member's location on their profile. Overwrites only when asked; login uses it to backfill. */
export async function captureGeo(userId: string, geo: MemberGeo, overwrite = false) {
  if (!geo.country && !geo.city && geo.latitude == null && geo.longitude == null) return;
  const client = dbClient();
  const existing = overwrite ? null : await client.from("profiles").select("country").eq("user_id", userId).maybeSingle();
  if (existing?.data?.country) return;
  const patch: Record<string, unknown> = { country: geo.country || null, updated_at: now() };
  if (geo.city) patch.city = geo.city;
  if (geo.latitude != null) patch.latitude = geo.latitude;
  if (geo.longitude != null) patch.longitude = geo.longitude;
  const result = await client.from("profiles").update(patch).eq("user_id", userId);
  if (result.error) throw new Error(`Supabase geo capture failed: ${result.error.message}`);
}

function regionCounts(since: number, rows: Array<{ created_at: string; country: string | null }>): RegionCount[] {
  const counts = new Map<Region | "Unknown", number>();
  for (const row of rows) {
    if (new Date(row.created_at).getTime() < since) continue;
    const region = regionForCountry(row.country);
    counts.set(region, (counts.get(region) ?? 0) + 1);
  }
  const entries: RegionCount[] = REGIONS.map((region) => ({ region, count: counts.get(region) ?? 0 }));
  const unknown = counts.get("Unknown") ?? 0;
  if (unknown) entries.push({ region: "Unknown", count: unknown });
  return entries.filter((entry) => entry.count > 0).sort((a, b) => b.count - a.count);
}

/** Aggregates onboarding from profiles, stores today's snapshot in observatory_daily, returns the view model. */
export async function observatoryData(): Promise<ObservatoryData> {
  const result = await dbClient().from("profiles").select("created_at, country, latitude, longitude");
  if (result.error) throw new Error(`Supabase observatory query failed: ${result.error.message}`);
  const rows = result.data as Array<{ created_at: string; country: string | null; latitude: number | null; longitude: number | null }>;

  const stamp = Date.now();
  const created = rows.map((row) => new Date(row.created_at).getTime()).filter(Number.isFinite);
  const members = created.length;
  const newMembers7d = created.filter((time) => time >= stamp - 7 * DAY).length;

  const history: number[] = [];
  for (let day = 29; day >= 0; day -= 1) {
    const end = stamp - day * DAY;
    history.push(created.filter((time) => time <= end).length);
  }

  const windows = Object.fromEntries(
    Object.entries(WINDOWS).map(([key, days]) => [key, regionCounts(stamp - days * DAY, rows)]),
  ) as Record<WindowKey, RegionCount[]>;

  const points: ObservatoryData["points"] = {};
  for (const { region, count } of windows["7D"]) {
    const point = REGION_POINTS[region];
    if (count && (point.lon || point.lat)) points[region] = { ...point, count };
  }

  const memberPoints = rows
    .filter((row) => row.latitude != null && row.longitude != null)
    .map((row) => ({ latitude: Number(row.latitude), longitude: Number(row.longitude) }));

  const today = new Date().toISOString().slice(0, 10);
  const snapshot = {
    day: today, members, new_members: newMembers7d,
    by_region: Object.fromEntries((windows["7D"] ?? []).map((entry) => [entry.region, entry.count])),
    updated_at: now(),
  };
  const stored = await dbClient().from("observatory_daily").upsert(snapshot, { onConflict: "day" });
  if (stored.error) throw new Error(`Supabase observatory snapshot failed: ${stored.error.message}`);

  return { members, newMembers7d, history, windows, points, memberPoints };
}
