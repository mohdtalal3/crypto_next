import { date, number } from "@/lib/utils/format";
import type { JsonObject } from "@/types";

type Data = Record<string, unknown>;
const record = (value: unknown): Data => value && typeof value === "object" && !Array.isArray(value) ? value as Data : {};
const list = (value: unknown): Data[] => Array.isArray(value) ? value.map(record) : [];
const label = (value: unknown, fallback = "—") => value === undefined || value === null || value === "" ? fallback : String(value);
// The API formats larger monetary strings with spaces (for example "4 999.99").
const amount = (value: unknown) => {
  if (value === undefined || value === null || value === "") return "—";
  const raw = String(value).trim();
  const parsed = Number(raw.replace(/[\s,]/g, ""));
  return Number.isFinite(parsed) ? number(parsed) : raw;
};

const rankNames: Record<string, string> = { "1": "Bronze", "2": "Silver", "3": "Gold", "4": "Platinum", "5": "Diamond" };
const rank = (value: unknown) => rankNames[String(value ?? "")] ?? `#${label(value)}`;

export function AffiliatesView({ data }: { data: JsonObject }) {
  const stats = record(data.affiliateStats ?? data);
  const partners = list(data.partners);
  return <>
    <section className="stats">
      <div className="card stat"><span className="stat-label">Referral level</span><span className="stat-value">#{label(stats.referralLevelId)}</span><span className="stat-line">{number(stats.referralLevelPercent)}% bonus</span></div>
      <div className="card stat"><span className="stat-label">Referral rank</span><span className="stat-value">{rank(stats.referralRankId)}</span></div>
      <div className="card stat"><span className="stat-label">Turnover</span><span className="stat-value">{number(stats.turnover)}</span></div>
      <div className="card stat"><span className="stat-label">Premium turnover</span><span className="stat-value">{number(stats.premiumTurnover)}</span></div>
      <div className="card stat"><span className="stat-label">Shareholder percent</span><span className="stat-value">{number(stats.shareholderPercent, 4)}%</span></div>
      <div className="card stat"><span className="stat-label">Total accounts</span><span className="stat-value">{label(stats.totalAccounts, "0")}</span></div>
    </section>
    <section className="card table-card"><table><thead><tr><th>Partner</th><th>Pretty ID</th><th>Country</th><th>Contact</th><th>Joined</th><th className="num">Invested</th><th className="num">Turnover</th><th className="num">Rank</th></tr></thead><tbody>
      {partners.map((partner) => <tr key={label(partner.userId, label(partner.prettyId))}>
        <td data-label="Partner"><span className="profile"><span className="avatar">{partner.photo ? <img src={String(partner.photo)} alt=""/> : label(partner.nickname, label(partner.name, "P"))[0]?.toUpperCase()}</span><span><strong>{label(partner.name)}</strong><br/><span className="hint">@{label(partner.nickname)}</span></span></span></td>
        <td className="mono">{label(partner.prettyId)}</td>
        <td>{label(partner.country).toUpperCase()}</td>
        <td>{label(partner.email)}{partner.phone ? <><br/><span className="hint">{label(partner.phone)}</span></> : null}</td>
        <td>{date(partner.createdAt)}</td>
        <td className="num">{number(partner.investmentsAmount)}</td>
        <td className="num">{number(partner.turnover)}</td>
        <td><span className="badge">{rank(partner.rankId)}</span></td>
      </tr>)}
    </tbody></table>{!partners.length && <p className="empty">No partners were returned by Aurum yet.</p>}</section>
  </>;
}
