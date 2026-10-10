import "server-only";

// Neo Bank disabled — see migrations/020_drop_neo_bank.sql. Commented out, restore when re-enabling:
// import { refreshTransactionSummary, upsertBackofficeAffiliates, upsertBackofficeProfile, upsertExAiBot, upsertLiveTrading, upsertOrbit, upsertOrbitPartnerProgram, upsertOrbitPartnerStatistics, upsertPartnerStats, upsertReferralBots, upsertTransactions, upsertUserInfo, upsertWallet, upsertZeusPro } from "@/lib/db/portal";
import { upsertBackofficeAffiliates, upsertBackofficeProfile, upsertExAiBot, upsertOrbit, upsertOrbitPartnerProgram, upsertOrbitPartnerStatistics, upsertPartnerStats, upsertUserBalances } from "@/lib/db/portal";
import { ensureFirstClaim } from "@/services/claim.service";
import { AppError } from "@/lib/utils/errors";
import { fetchBackofficeAffiliates, fetchBackofficeProfile } from "@/scraping/backoffice";
// import { fetchNeoBank } from "@/scraping/neo-bank";
import { fetchOrbitOne } from "@/scraping/orbitone";
import { AurumUnauthorizedError } from "@/scraping/shared/http";
import type { JsonObject, PortalSession, Tool } from "@/types";

const toolName = (tool: Tool) => (tool === "orbit" ? "OrbitOne" : tool === "backoffice" ? "Backoffice.aurum" : "Aurum");

// Balance strings arrive space-formatted ("4 650.68", sometimes with
// non-breaking spaces) — mirrors the stripping in migrations/022 and 023.
const record = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const numeric = (value: unknown) => {
  const parsed = Number(String(value ?? "").replace(/[\s,\u00a0]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

export class SyncUnauthorizedError extends AppError {
  constructor(tool: Tool) {
    super("TOKEN_EXPIRED", `${toolName(tool)} token expired or invalid — paste a fresh one.`, 401);
  }
}

export async function syncTool(session: PortalSession, tool: Tool) {
  const token = tool === "neo" ? session.aurumToken : tool === "backoffice" ? session.backofficeToken : session.orbitToken;
  if (!token) throw new AppError("TOKEN_REQUIRED", "Connect this account before syncing.", 400);
  try {
    if (tool === "backoffice") {
      const [affiliates, profile] = await Promise.all([fetchBackofficeAffiliates(token), fetchBackofficeProfile(token)]);
      await upsertBackofficeAffiliates(session.userId, affiliates);
      await upsertBackofficeProfile(session.userId, profile);
      try {
        await ensureFirstClaim(session.userId);
      } catch {
        // The claim number is best-effort; it needs a synced profile with a pretty ID.
      }
      return { tool, transactions: 0 };
    }
    if (tool === "orbit") {
      const data = await fetchOrbitOne(token);
      const { investments, partners, partnerReferrals, rankStatistics, ...orbitData } = data;
      if (Object.keys(orbitData).length) await upsertOrbit(session.userId, orbitData as JsonObject);
      if (investments) await upsertExAiBot(session.userId, investments);
      if (partners) await upsertOrbitPartnerProgram(session.userId, partners);
      if (partnerReferrals) {
        await upsertOrbitPartnerStatistics(session.userId, { ...partnerReferrals, ...(rankStatistics ? { rankStatistics } : {}) } as JsonObject);
      } else if (rankStatistics) await upsertOrbitPartnerStatistics(session.userId, { rankStatistics });
      // Per-user claimable balances (migrations/023_user_balances.sql), kept in
      // step with the documents this sync just rewrote. Sources mirror the
      // refresh_claimable_balances job: ex_ai_bot balance.totalDeposit, orbit
      // overview.balance.total, orbit_partner_program partnerBalance.
      const exAiRoot = record(record(investments).result ?? investments);
      const exAiBalance = record(exAiRoot.balance ?? exAiRoot.depositBalance ?? exAiRoot.summary);
      const overview = record(orbitData.overview);
      await upsertUserBalances(session.userId, session.email, {
        exAiBot: numeric(exAiBalance.totalDeposit),
        mainWallet: numeric(record(overview.balance).total),
        partnerWallet: numeric(record(partners).partnerBalance),
      });
      return { tool, transactions: 0 };
    }
    // Neo Bank disabled — see migrations/020_drop_neo_bank.sql. Commented out, restore when re-enabling:
    /*
    const data = await fetchNeoBank(token);
    if (data.userInfo) await upsertUserInfo(session.userId, data.userInfo);
    if (data.zeusPro) await upsertZeusPro(session.userId, data.zeusPro);
    if (data.wallet) await upsertWallet(session.userId, data.wallet);
    if (data.liveTrading) await upsertLiveTrading(session.userId, data.liveTrading);
    const written = await upsertTransactions(session.userId, data.transactions);
    try {
      await refreshTransactionSummary(session.userId);
    } catch {
      // The summary is a cache — the dashboard falls back to computing it.
    }
    if (data.referralBots) await upsertReferralBots(session.userId, data.referralBots.bots);
    if (data.affiliate) await upsertBackofficeAffiliates(session.userId, data.affiliate);
    if (data.affiliate || data.referralBots) {
      const partner = { ...(data.affiliate ?? {}) };
      if (data.referralBots) partner.referralTrading = data.referralBots.summary;
      await upsertPartnerStats(session.userId, partner);
    }
    return { tool, transactions: written };
    */
    if (tool === "neo") throw new AppError("TOOL_DISABLED", "Neo Bank sync is disabled.", 400);
    return { tool, transactions: 0 };
  } catch (error) {
    if (error instanceof AurumUnauthorizedError) throw new SyncUnauthorizedError(tool);
    throw error;
  }
}
