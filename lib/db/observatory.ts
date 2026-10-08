import "server-only";

import { dbClient } from "@/lib/db/client";
import { REGION_POINTS, regionForCountry, type Region } from "@/lib/utils/regions";
import type { MemberGeo } from "@/lib/auth/geo";

const DAY = 86400000;
const HISTORY_DAYS = 30;
const WINDOWS = { "24H": 1, "7D": 7, "100D": 100 } as const;
export type WindowKey = keyof typeof WINDOWS;

export interface RegionCount { region: Region | "Unknown"; count: number }
export interface ObservatoryData {
  members: number;
  newMembers7d: number;
  history: number[];
  windows: Record<WindowKey, RegionCount[]>;
  points: Record<string, { lon: number; lat: number; count: number }>;
}

interface DailyRow { day: string; members: number; new_members: number; by_country: Record<string, number> }

/** Stores a member's country on their profile at signup. */
export async function captureGeo(userId: string, geo: MemberGeo) {
  if (!geo.country) return;
  const result = await dbClient().from("profiles").update({ country: geo.country, updated_at: new Date().toISOString() }).eq("user_id", userId);
  if (result.error) throw new Error(`Supabase geo capture failed: ${result.error.message}`);
}

function regionCountsFromDays(days: DailyRow[]): RegionCount[] {
  const totals = new Map<Region | "Unknown", number>();
  for (const row of days) {
    for (const [code, count] of Object.entries(row.by_country ?? {})) {
      const region = regionForCountry(code);
      totals.set(region, (totals.get(region) ?? 0) + count);
    }
  }
  return [...totals.entries()]
    .map(([region, count]) => ({ region, count }))
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.count - a.count);
}

/** Pure read of the observatory_daily rows that the scheduled Supabase job
    (see migrations/021_observatory.sql) keeps up to date every 10 minutes. */
async function readObservatory(): Promise<ObservatoryData> {
  const stored = await dbClient().from("observatory_daily").select("day, members, new_members, by_country").order("day");
  if (stored.error) throw new Error(`Supabase observatory read failed: ${stored.error.message}`);
  const byDay = new Map<string, DailyRow>((stored.data as DailyRow[]).map((row) => [row.day, row]));
  const stamp = Date.now();

  const windowRows = (days: number) => {
    const rows: DailyRow[] = [];
    for (let index = 0; index < days; index += 1) {
      const row = byDay.get(new Date(stamp - index * DAY).toISOString().slice(0, 10));
      if (row) rows.push(row);
    }
    return rows;
  };

  const windows = Object.fromEntries(
    Object.entries(WINDOWS).map(([key, days]) => [key, regionCountsFromDays(windowRows(days))]),
  ) as Record<WindowKey, RegionCount[]>;

  const history: number[] = [];
  for (let index = HISTORY_DAYS - 1; index >= 0; index -= 1) {
    history.push(windowRows(index + 1)[0]?.members ?? 0);
  }

  const points: ObservatoryData["points"] = {};
  for (const { region, count } of windows["7D"]) {
    const point = REGION_POINTS[region];
    if (count && (point.lon || point.lat)) points[region] = { ...point, count };
  }

  const latest = windowRows(1)[0];
  return {
    members: latest?.members ?? 0,
    newMembers7d: windowRows(7).reduce((total, row) => total + row.new_members, 0),
    history,
    windows,
    points,
  };
}

/* The public page can take thousands of simultaneous hits; serve the aggregates
   from memory for a minute and collapse concurrent misses onto one read. */
const CACHE_TTL = 60_000;
let cache: { data: ObservatoryData; expires: number } | null = null;
let inflight: Promise<ObservatoryData> | null = null;

export function observatoryData(): Promise<ObservatoryData> {
  if (cache && Date.now() < cache.expires) return Promise.resolve(cache.data);
  if (!inflight) {
    inflight = readObservatory()
      .then((data) => {
        cache = { data, expires: Date.now() + CACHE_TTL };
        return data;
      })
      .finally(() => { inflight = null; });
  }
  return inflight;
}
