import "server-only";

import { dbClient, authClient } from "@/lib/db/client";
import { isPortalRole, STAFF_ROLES } from "@/lib/auth/roles";
import { summarizeTransactions, type TickerAggregate } from "@/lib/utils/summary";
import type { JsonObject, PortalRole, ReferralBot, Transaction } from "@/types";

const CHUNK = 500;
const now = () => new Date().toISOString();

async function assertResult<T>({ data, error }: { data: T; error: { message: string } | null }) {
  if (error) throw new Error(`Supabase request failed: ${error.message}`);
  return data;
}

export async function roleFor(userId: string): Promise<PortalRole> {
  const client = dbClient();
  const { data, error } = await client.from("profiles").select("role").eq("user_id", userId).maybeSingle();
  if (error) throw new Error(`Supabase profile lookup failed: ${error.message}`);
  if (!data) {
    const result = await client.from("profiles").upsert({ user_id: userId, role: "user", updated_at: now() });
    if (result.error) throw new Error(`Supabase profile backfill failed: ${result.error.message}`);
    return "user";
  }
  return isPortalRole(data.role) ? data.role : "user";
}

export async function activeFor(userId: string): Promise<boolean> {
  const { data, error } = await dbClient().from("profiles").select("active").eq("user_id", userId).maybeSingle();
  if (error) throw new Error(`Supabase profile lookup failed: ${error.message}`);
  return data ? data.active !== false : true;
}

export async function emailFor(userId: string): Promise<string> {
  try {
    const { data } = await authClient().auth.admin.getUserById(userId);
    return data.user?.email ?? userId;
  } catch {
    return userId;
  }
}

export async function staffList(): Promise<Array<{ user_id: string; role: PortalRole; active: boolean; created_at: string }>> {
  const result = await dbClient().from("profiles").select("user_id, role, active, created_at").in("role", [...STAFF_ROLES]).order("created_at");
  const rows = await assertResult(result) as Array<{ user_id: string; role: string; active: boolean | null; created_at: string }>;
  return rows.map((row) => ({ user_id: row.user_id, role: isPortalRole(row.role) ? row.role : "user", active: row.active !== false, created_at: row.created_at }));
}

export async function setStaffRole(userId: string, role: Exclude<PortalRole, "user">) {
  const result = await dbClient().from("profiles").update({ role, updated_at: now() }).eq("user_id", userId);
  if (result.error) throw new Error(`Supabase profile update failed: ${result.error.message}`);
}

export async function setStaffActive(userId: string, active: boolean) {
  const result = await dbClient().from("profiles").update({ active, updated_at: now() }).eq("user_id", userId);
  if (result.error) throw new Error(`Supabase profile update failed: ${result.error.message}`);
}

export async function transactionsFor(userId: string): Promise<Transaction[]> {
  const client = dbClient();
  const all: Transaction[] = [];
  for (let offset = 0; ; offset += 1000) {
    const result = await client.from("transactions").select("*").eq("user_id", userId)
      .order("tx_date", { ascending: false }).range(offset, offset + 999);
    const batch = await assertResult(result) as Transaction[];
    all.push(...batch);
    if (batch.length < 1000) return all;
  }
}

export async function upsertTransactions(userId: string, rows: JsonObject[]) {
  const client = dbClient();
  let written = 0;
  for (let index = 0; index < rows.length; index += CHUNK) {
    const chunk = rows.slice(index, index + CHUNK).map((row) => ({
      user_id: userId, id: String(row.id ?? ""), tx_date: row.date ?? null, kind: row.kind ?? null,
      status: row.status ?? null, amount: row.amount ?? null, fee: row.fee ?? null, ticker: row.ticker ?? null,
      direction: row.direction ?? null, blockchain: row.blockchain ?? null, address: row.address ?? null,
      hash: row.hash ?? null, explorer_address: row.explorer_address ?? null, explorer_tx: row.explorer_tx ?? null,
      email: row.email ?? null, updated_at: now(),
    }));
    if (!chunk.length) continue;
    const result = await client.from("transactions").upsert(chunk);
    if (result.error) throw new Error(`Supabase transaction upsert failed: ${result.error.message}`);
    written += chunk.length;
  }
  return written;
}

async function upsertDocument(table: string, userId: string, data: JsonObject) {
  const result = await dbClient().from(table).upsert({ user_id: userId, data, updated_at: now() });
  if (result.error) throw new Error(`Supabase ${table} upsert failed: ${result.error.message}`);
}

async function documentFor(table: string, userId: string): Promise<JsonObject | null> {
  const result = await dbClient().from(table).select("data").eq("user_id", userId).maybeSingle();
  const row = await assertResult(result) as { data?: JsonObject } | null;
  return row?.data ?? null;
}

export const userInfoFor = (userId: string) => documentFor("user_info", userId);
export const partnerStatsFor = (userId: string) => documentFor("partner_stats", userId);
export const zeusProFor = (userId: string) => documentFor("zeus_pro", userId);
export const walletFor = (userId: string) => documentFor("wallet", userId);
export const liveTradingFor = (userId: string) => documentFor("live_trading", userId);
export const orbitFor = (userId: string) => documentFor("orbit", userId);
export const exAiBotFor = (userId: string) => documentFor("ex_ai_bot", userId);
export const orbitPartnerProgramFor = (userId: string) => documentFor("orbit_partner_program", userId);
export const upsertUserInfo = (userId: string, data: JsonObject) => upsertDocument("user_info", userId, data);
export const upsertPartnerStats = (userId: string, data: JsonObject) => upsertDocument("partner_stats", userId, data);
export const upsertZeusPro = (userId: string, data: JsonObject) => upsertDocument("zeus_pro", userId, data);
export const upsertWallet = (userId: string, data: JsonObject) => upsertDocument("wallet", userId, data);
export const upsertLiveTrading = (userId: string, data: JsonObject) => upsertDocument("live_trading", userId, data);
export const upsertOrbit = (userId: string, data: JsonObject) => upsertDocument("orbit", userId, data);
export const upsertExAiBot = (userId: string, data: JsonObject) => upsertDocument("ex_ai_bot", userId, data);
export const upsertOrbitPartnerProgram = (userId: string, data: JsonObject) => upsertDocument("orbit_partner_program", userId, data);
function jsonRows(value: unknown): JsonObject[] {
  return Array.isArray(value) ? value.filter((item): item is JsonObject => Boolean(item) && typeof item === "object" && !Array.isArray(item)) : [];
}

function mostCommonInviterPrettyId(referrals: JsonObject[]) {
  const counts = new Map<string, number>();
  for (const referral of referrals) {
    const value = referral.inviterPrettyId;
    if (typeof value === "string" && value) counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

export async function upsertOrbitPartnerStatistics(userId: string, source: JsonObject) {
  const referrals = jsonRows(source.referrals);
  const result = await dbClient().from("orbit_partner_statistics").upsert({
    user_id: userId, inviter_name: source.inviterName ?? null, inviter_pretty_id: source.inviterPrettyId ?? null,
    my_pretty_id: mostCommonInviterPrettyId(referrals), total: Number(source.total) || referrals.length,
    search: source.search ?? null, referrals, referrals_line: source.referralsLine ?? [],
    rank_statistics: source.rankStatistics ?? {}, updated_at: now(),
  });
  if (result.error) throw new Error(`Supabase OrbitOne partner statistics upsert failed: ${result.error.message}`);
}

export async function orbitPartnerStatisticsFor(userId: string): Promise<JsonObject | null> {
  const result = await dbClient().from("orbit_partner_statistics").select("*").eq("user_id", userId).maybeSingle();
  const row = await assertResult(result) as Record<string, unknown> | null;
  if (!row) return null;
  return {
    inviterName: row.inviter_name, inviterPrettyId: row.inviter_pretty_id,
    ownPrettyId: row.my_pretty_id, total: row.total, search: row.search, referrals: row.referrals,
    referralsLine: row.referrals_line, rankStatistics: row.rank_statistics,
  };
}

function periodSeconds(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const source = value as Record<string, unknown>;
  return Number(source.days ?? 0) * 86400 + Number(source.hours ?? 0) * 3600 + Number(source.minutes ?? 0) * 60 + Number(source.seconds ?? 0) + Number(source.milliseconds ?? 0) / 1000;
}

export async function upsertReferralBots(userId: string, bots: JsonObject[]) {
  const client = dbClient();
  let written = 0;
  for (let index = 0; index < bots.length; index += CHUNK) {
    const chunk = bots.slice(index, index + CHUNK).map((bot) => ({
      user_id: userId, bot_id: bot.botId, user_name: bot.userName ?? null, pretty_id: bot.prettyId ?? null,
      pair: bot.pair ?? null, trading_start: bot.tradingStart ?? null, last_trade: bot.lastTrade ?? null,
      asset_in_trading: bot.assetInTrading ?? null, profit: bot.profit ?? null, positive_orders: bot.positiveOrders ?? null,
      negative_orders: bot.negativeOrders ?? null, status: bot.status ?? null, referral_reward: bot.referralReward ?? null,
      trading_period_seconds: periodSeconds(bot.tradingPeriod), updated_at: now(),
    }));
    if (!chunk.length) continue;
    const result = await client.from("referral_bots").upsert(chunk);
    if (result.error) throw new Error(`Supabase referral-bot upsert failed: ${result.error.message}`);
    written += chunk.length;
  }
  return written;
}

export async function referralBotsFor(userId: string): Promise<ReferralBot[]> {
  const client = dbClient();
  const all: ReferralBot[] = [];
  for (let offset = 0; ; offset += 1000) {
    const result = await client.from("referral_bots").select("*").eq("user_id", userId)
      .order("trading_start", { ascending: false, nullsFirst: false }).range(offset, offset + 999);
    const batch = await assertResult(result) as ReferralBot[];
    all.push(...batch);
    if (batch.length < 1000) return all;
  }
}

export async function refreshTransactionSummary(userId: string) {
  const summary = summarizeTransactions(await transactionsFor(userId));
  const client = dbClient();
  const cleared = await client.from("transaction_summary").delete().eq("user_id", userId);
  if (cleared.error) throw new Error(`Supabase transaction summary reset failed: ${cleared.error.message}`);
  if (!summary.length) return;
  const result = await client.from("transaction_summary").upsert(summary.map((s) => ({
    user_id: userId, ticker: s.ticker, tx_count: s.count, total_in: s.in, total_out: s.out, updated_at: now(),
  })));
  if (result.error) throw new Error(`Supabase transaction summary upsert failed: ${result.error.message}`);
}

export async function transactionSummaryFor(userId: string): Promise<TickerAggregate[]> {
  const result = await dbClient().from("transaction_summary").select("ticker, tx_count, total_in, total_out")
    .eq("user_id", userId).order("tx_count", { ascending: false });
  const rows = await assertResult(result) as Array<{ ticker: string; tx_count: number; total_in: string | number; total_out: string | number }>;
  return rows.map((row) => ({ ticker: row.ticker, count: row.tx_count, in: Number(row.total_in), out: Number(row.total_out) }));
}

export async function transactionSummaryEveryone(): Promise<{ people: number; transactions: number; tickers: TickerAggregate[] }> {
  const result = await dbClient().from("transaction_summary").select("user_id, ticker, tx_count, total_in, total_out");
  const rows = await assertResult(result) as Array<{ user_id: string; ticker: string; tx_count: number; total_in: string | number; total_out: string | number }>;
  const merged = new Map<string, { in: number; out: number; count: number }>();
  const people = new Set<string>();
  for (const row of rows) {
    people.add(row.user_id);
    const slot = merged.get(row.ticker) ?? { in: 0, out: 0, count: 0 };
    slot.in += Number(row.total_in);
    slot.out += Number(row.total_out);
    slot.count += row.tx_count;
    merged.set(row.ticker, slot);
  }
  const tickers = [...merged.entries()].map(([ticker, s]) => ({ ticker, ...s })).sort((a, b) => b.count - a.count);
  return { people: people.size, transactions: tickers.reduce((total, t) => total + t.count, 0), tickers };
}
