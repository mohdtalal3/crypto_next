import "server-only";

import { upsertExAiBot, upsertLiveTrading, upsertOrbit, upsertOrbitPartnerProgram, upsertOrbitPartnerStatistics, upsertPartnerStats, upsertReferralBots, upsertTransactions, upsertUserInfo, upsertWallet, upsertZeusPro } from "@/lib/db/portal";
import { AppError } from "@/lib/utils/errors";
import { fetchNeoBank } from "@/scraping/neo-bank";
import { fetchOrbitOne } from "@/scraping/orbitone";
import { AurumUnauthorizedError } from "@/scraping/shared/http";
import type { JsonObject, PortalSession, Tool } from "@/types";

export class SyncUnauthorizedError extends AppError {
  constructor(tool: Tool) {
    super("TOKEN_EXPIRED", `${tool === "orbit" ? "OrbitOne" : "Aurum"} token expired or invalid — paste a fresh one.`, 401);
  }
}

export async function syncTool(session: PortalSession, tool: Tool) {
  const token = tool === "neo" ? session.aurumToken : session.orbitToken;
  if (!token) throw new AppError("TOKEN_REQUIRED", "Connect this account before syncing.", 400);
  try {
    if (tool === "orbit") {
      const data = await fetchOrbitOne(token);
      const { investments, partners, partnerReferrals, rankStatistics, ...orbitData } = data;
      if (Object.keys(orbitData).length) await upsertOrbit(session.userId, orbitData as JsonObject);
      if (investments) await upsertExAiBot(session.userId, investments);
      if (partners) await upsertOrbitPartnerProgram(session.userId, partners);
      if (partnerReferrals) {
        await upsertOrbitPartnerStatistics(session.userId, { ...partnerReferrals, ...(rankStatistics ? { rankStatistics } : {}) } as JsonObject);
      } else if (rankStatistics) await upsertOrbitPartnerStatistics(session.userId, { rankStatistics });
      return { tool, transactions: 0 };
    }
    const data = await fetchNeoBank(token);
    if (data.userInfo) await upsertUserInfo(session.userId, data.userInfo);
    if (data.zeusPro) await upsertZeusPro(session.userId, data.zeusPro);
    if (data.wallet) await upsertWallet(session.userId, data.wallet);
    if (data.liveTrading) await upsertLiveTrading(session.userId, data.liveTrading);
    const written = await upsertTransactions(session.userId, data.transactions);
    if (data.referralBots) await upsertReferralBots(session.userId, data.referralBots.bots);
    if (data.affiliate || data.referralBots) {
      const partner = { ...(data.affiliate ?? {}) };
      if (data.referralBots) partner.referralTrading = data.referralBots.summary;
      await upsertPartnerStats(session.userId, partner);
    }
    return { tool, transactions: written };
  } catch (error) {
    if (error instanceof AurumUnauthorizedError) throw new SyncUnauthorizedError(tool);
    throw error;
  }
}
