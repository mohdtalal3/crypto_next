import "server-only";

import type { JsonObject } from "@/types";
import { aurumGet, aurumPost } from "@/scraping/shared/http";
import type { NeoSyncData } from "./types";

const BASE = "https://api.aurum.foundation";
const ORIGIN = "https://tgapp.aurum.foundation";
const PAYMENT_LIMIT = 1000;
const BOT_LIMIT = 1000;
const labels: Record<string, string> = { replenishment: "Topup", transfer: "Referral Transfer to Balance" };

const object = (value: unknown): JsonObject => value && typeof value === "object" && !Array.isArray(value) ? value as JsonObject : {};
const array = (value: unknown): JsonObject[] => Array.isArray(value) ? value.filter((item): item is JsonObject => Boolean(item) && typeof item === "object") : [];

function kindLabel(value: unknown) {
  const kind = String(value ?? "");
  return labels[kind.toLowerCase()] ?? kind.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

async function payments(token: string) {
  const first = await aurumGet(token, `${BASE}/tg/payments?limit=${PAYMENT_LIMIT}&page=0`, ORIGIN);
  const pages = Number(first.pages ?? 1);
  const raw = array(first.payments);
  for (let page = 1; page < pages; page += 1) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    raw.push(...array((await aurumGet(token, `${BASE}/tg/payments?limit=${PAYMENT_LIMIT}&page=${page}`, ORIGIN)).payments));
  }
  const seen = new Set<string>();
  return raw.flatMap((payment) => {
    const id = payment.id == null ? "" : String(payment.id);
    if (!id || seen.has(id)) return [];
    seen.add(id);
    return [{ id, date: payment.date ?? "", kind: kindLabel(payment.kind), status: payment.status ?? "", amount: payment.amount ?? "", fee: payment.fee ?? "", ticker: payment.ticker ?? "", direction: payment.positive ? "in" : "out", blockchain: payment.blockchain ?? "", address: payment.address ?? "", hash: payment.hash ?? "", explorer_address: payment.explorerAddress ?? "", explorer_tx: payment.explorerHash ?? payment.explorerTransaction ?? "", email: payment.email ?? "" }];
  }).sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

async function referralBots(token: string) {
  const bots: JsonObject[] = [];
  let offset = 0;
  let summary: JsonObject = {};
  while (true) {
    const response = await aurumGet(token, `${BASE}/tg/referral_trading?limit=${BOT_LIMIT}&offset=${offset}`, ORIGIN);
    const batch = array(response.bots);
    bots.push(...batch);
    summary = Object.fromEntries(["totalBots", "startedBots", "total", "totalUsers", "partnerPercent"].map((key) => [key, response[key]]));
    const total = Number(response.total);
    if (!batch.length || (Number.isFinite(total) && offset + batch.length >= total) || batch.length < BOT_LIMIT) return { summary, bots };
    offset += BOT_LIMIT;
  }
}

/** Fetches every Neo Bank endpoint. Persistence and non-fatal job policy live in services/sync.ts. */
export async function fetchNeoBank(token: string): Promise<NeoSyncData> {
  // Keep Flask's job ordering and failure policy: all jobs except payments are
  // best-effort; payments are the one fatal, historical-data job.
  const data: NeoSyncData = { transactions: [] };
  try { data.userInfo = object(await aurumPost(token, `${BASE}/tg/user`, ORIGIN, {})); } catch { /* non-fatal */ }
  try { data.affiliate = object(await aurumGet(token, `${BASE}/tg/affiliateProgram`, ORIGIN)); } catch { /* non-fatal */ }
  const aurumId = data.userInfo?.id;
  if (aurumId) {
    try { data.zeusPro = object(await aurumGet(token, `${BASE}/tg/zeus-pro?userId=${encodeURIComponent(String(aurumId))}`, ORIGIN)); } catch { /* non-fatal */ }
  }
  try {
    const wallet = object(await aurumGet(token, `${BASE}/tg/wallet`, ORIGIN));
    for (const value of Object.values(object(wallet.wallet))) if (value && typeof value === "object") delete (value as JsonObject).addressQr;
    data.wallet = wallet;
  } catch { /* non-fatal */ }
  try { data.liveTrading = object(await aurumGet(token, `${BASE}/tg/live-trading`, ORIGIN)); } catch { /* non-fatal */ }
  data.transactions = await payments(token); // deliberately fatal
  try { data.referralBots = await referralBots(token); } catch { /* non-fatal */ }
  return data;
}
