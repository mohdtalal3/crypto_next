import "server-only";

import type { JsonObject } from "@/types";
import { aurumGet } from "@/scraping/shared/http";
import type { OrbitSyncData } from "./types";

const BASE = "https://mini.aurum.foundation";
const ORIGIN = "https://app.orbitone.finance";
const REFERRAL_LIMIT = 15;
const object = (value: unknown): JsonObject => value && typeof value === "object" && !Array.isArray(value) ? value as JsonObject : {};

async function fetchPartnerReferrals(token: string) {
  const page = (number: number) => aurumGet(token, `${BASE}/partners/referrals?limit=${REFERRAL_LIMIT}&page=${number}&search=&prettyId=`, ORIGIN);
  const first = object(await page(1));
  const total = Number(first.total) || 0;
  const pages = Math.max(1, Math.ceil(total / REFERRAL_LIMIT));
  const batches = [first];
  for (let current = 2; current <= pages; current += 1) batches.push(object(await page(current)));
  const referrals = batches.flatMap((batch) => Array.isArray(batch.referrals) ? batch.referrals : []);
  return { ...first, referrals } as JsonObject;
}

export async function fetchOrbitOne(token: string): Promise<OrbitSyncData> {
  const [overview, exAiStatistics, investments, partners, partnerReferrals, rankStatistics] = await Promise.allSettled([
    aurumGet(token, `${BASE}/dashboard/overview`, ORIGIN),
    aurumGet(token, `${BASE}/ex-ai-statistics`, ORIGIN),
    aurumGet(token, `${BASE}/investments`, ORIGIN),
    aurumGet(token, `${BASE}/partners`, ORIGIN),
    fetchPartnerReferrals(token),
    aurumGet(token, `${BASE}/partners/rank-statistics`, ORIGIN),
  ]);
  const result: OrbitSyncData = {};
  if (overview.status === "fulfilled") {
    result.overview = object(overview.value);
    delete result.overview.categoryShares;
  }
  if (exAiStatistics.status === "fulfilled") result.exAiStatistics = object(exAiStatistics.value);
  if (investments.status === "fulfilled") result.investments = object(investments.value);
  if (partners.status === "fulfilled") result.partners = object(partners.value);
  if (partnerReferrals.status === "fulfilled") result.partnerReferrals = object(partnerReferrals.value);
  if (rankStatistics.status === "fulfilled") result.rankStatistics = object(rankStatistics.value);
  if (!result.overview && !result.exAiStatistics && !result.investments && !result.partners && !result.partnerReferrals && !result.rankStatistics) throw (overview.status === "rejected" ? overview.reason : exAiStatistics.status === "rejected" ? exAiStatistics.reason : investments.status === "rejected" ? investments.reason : partners.status === "rejected" ? partners.reason : partnerReferrals.status === "rejected" ? partnerReferrals.reason : rankStatistics.status === "rejected" ? rankStatistics.reason : new Error("OrbitOne sync failed."));
  return result;
}
