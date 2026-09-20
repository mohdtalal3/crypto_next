import { number } from "@/lib/utils/format";
import type { JsonObject } from "@/types";

type Data = Record<string, unknown>;
const record = (value: unknown): Data => value && typeof value === "object" && !Array.isArray(value) ? value as Data : {};
const list = (value: unknown): Data[] => Array.isArray(value) ? value.map(record) : [];
const text = (value: unknown, fallback = "—") => value === undefined || value === null || value === "" ? fallback : String(value);
const money = (value: unknown) => {
  if (value === undefined || value === null || value === "") return "—";
  const raw = String(value).trim();
  const parsed = Number(raw.replace(/[\s,]/g, ""));
  return Number.isFinite(parsed) ? number(parsed, 2) : raw;
};
const percent = (value: unknown) => value === undefined || value === null || value === "" ? "—" : `${number(value, 2)}%`;
const dateOnly = (value: unknown) => {
  const parsed = new Date(String(value ?? ""));
  return Number.isNaN(parsed.getTime()) ? text(value) : parsed.toLocaleDateString("en-CA", { timeZone: "UTC" });
};

const legacyNames: Record<number, string> = { 1: "NOVA", 2: "VOYAGER", 3: "VANGUARD", 4: "VANGUARD PRO", 5: "NEXUS", 6: "ORACLE" };
const rankName = (id: unknown, prefix = "RANK") => legacyNames[Number(id)] ?? `${prefix} ${text(id)}`;
const bonusType = (value: unknown) => String(value ?? "").toUpperCase() === "REFERRAL_FUND" ? "Referral reward" : text(value).replaceAll("_", " ");

function requirementText(item: Data) {
  const minimum = rankName(item.minRank);
  const line = item.firstLine ? "first-line" : "team";
  return `${text(item.count, "0")} × ${minimum} (${line})`;
}

function IncomeCard({ title, data }: { title: string; data: Data }) {
  const changes = record(data.incomeStats);
  return <article className="partner-income-card"><h3>{title}</h3><strong>{money(data.summedTeamEarnings)} <small>USDT</small></strong><dl><div><dt>Profitshare rate</dt><dd>{percent(data.referralLevelPercent)}</dd></div><div><dt>Expected daily</dt><dd>{money(data.dailyExpexted)} USDT</dd></div>{[["Day", "dayChange"], ["Week", "weekChange"], ["Month", "monthChange"], ["3 months", "threeMonthChange"], ["6 months", "sixMonthChange"]].map(([label, key]) => <div key={key}><dt>{label} change</dt><dd>{money(changes[key])} USDT</dd></div>)}</dl></article>;
}

export function PartnerProgramDashboard({ data }: { data: JsonObject }) {
  const root = record(data.result);
  const partner = Object.keys(root).length ? root : data;
  const withdrawal = record(partner.withdrawLimit);
  const team = record(partner.teamEarning);
  const teamRwa = record(partner.teamEarningRwa);
  const levels = list(partner.referralLevels);
  const ranks = list(partner.referralRanks);
  const transactions = list(partner.transactions);
  const branch = record(partner.referralBranchRequirements);
  const failedRequirements = list(branch.failedRequirements);
  const currentLevelId = partner.referralLevelId;
  const currentRankId = partner.referralRankId;
  const progress = Math.max(0, Math.min(100, Number(partner.nextReferralLevelPercent) || 0));

  return <>
    <section className="partner-summary-grid">
      <article className="card partner-balance"><span className="partner-icon" aria-hidden="true">▣</span><div><span>Partner balance</span><strong>{money(partner.partnerBalance)} <small>USDT</small></strong><p>Available to withdraw: <b>{money(withdrawal.available)} USDT</b> · Used: {money(withdrawal.used)} USDT</p></div></article>
      <article className="card partner-bonuses"><div className="partner-metric"><span>♧</span><p>Referral bonus earned<strong>{money(partner.totalReferralFunds)} <small>USDT</small></strong></p></div><div className="partner-metric"><span>♜</span><p>Extra bonus earned<strong>{money(partner.totalReferralRankBonuses)} <small>USDT</small></strong></p></div><div className="partner-metric"><span>✧</span><p>EX-AI Profitshare<strong>{money(team.summedTeamEarnings)} <small>USDT</small></strong></p></div><div className="partner-metric"><span>◉</span><p>Total bonuses earned<strong>{money(partner.totalReferralIncome)} <small>USDT</small></strong></p></div></article>
    </section>

    <section className="card legacy-card"><div className="partner-section-head"><div><h2>Legacy Levels</h2><span>Your referral rate</span><strong>{percent(partner.referralLevelPercent)}</strong></div><span className="current-level">✦ {rankName(currentLevelId)}</span></div><div className="volume-row"><span>Total Legacy Volume</span><strong>{money(partner.turnover)} <small>LV</small></strong></div><div className="legacy-progress" aria-label={`${progress}% progress to next legacy level`}><i style={{ width: `${progress}%` }}/></div><div className="next-level-grid"><div><span>↗ To the next level</span><strong>{money(partner.turnoverLeftToNextReferralLevel)} <small>LV remaining</small></strong></div><div><span>⌛ Next level</span><strong>{percent(partner.nextReferralLevelFraction ?? partner.nextReferralLevelPercent)}</strong><small>Required volume: {money(partner.nextReferralLevelTurnover)} LV</small></div></div><div className="table-card partner-table"><table><thead><tr><th>Rank</th><th>Referral income</th><th>Required volume</th></tr></thead><tbody>{levels.map((level, index) => { const selected = level.current === true || Number(level.id) === Number(currentLevelId); return <tr className={selected ? "selected-row" : ""} key={text(level.id, String(index))}><td data-label="Rank"><strong>{rankName(level.id)}</strong>{selected && <span className="current-tag">Current</span>}</td><td data-label="Referral income">{percent(level.percent ?? (Number(level.fraction) * 100))}</td><td data-label="Required volume">{money(level.turnover)} LV</td></tr>; })}</tbody></table></div></section>

    <section className="card premium-card"><div className="partner-section-head"><div><h2>Premium ranks & rewards</h2><span>Current premium rank: <b>{rankName(currentRankId)}</b></span></div><span className={branch.requirementsCompleted ? "current-level completed" : "current-level incomplete"}>{branch.requirementsCompleted ? "✓ Requirements complete" : "• Requirements pending"}</span></div><div className="premium-overview"><div><span>Premium turnover</span><strong>{money(partner.premiumTurnover)} <small>LV</small></strong></div><div><span>To next premium rank</span><strong>{money(partner.premiumTurnoverLeftToNextReferralRank)} <small>LV</small></strong></div><div><span>Personal investments</span><strong>{money(partner.investmentsAmount)} <small>USDT</small></strong><small>{partner.investmentsAmountMoreThenRequired ? "Requirement met" : `Next requirement: ${money(partner.nextReferralRankInvestmentsAmount)} USDT`}</small></div><div><span>Next rank bonus</span><strong>{money(partner.nextRankWithBonusAmount)} <small>USDT</small></strong><small>Rank {text(partner.nextRankWithBonusId)}</small></div></div>{failedRequirements.length > 0 && <div className="requirements-note"><strong>Outstanding branch requirements</strong>{failedRequirements.map((item, index) => <span key={index}>{requirementText(item)} — {text(item.actualCount, "0")} of {text(item.count, "0")} reached</span>)}</div>}<div className="table-card partner-table premium-ranks"><table><thead><tr><th>Rank</th><th>Required turnover</th><th>Personal investment</th><th>Profitshare</th><th>Shareholder rate</th><th>Rank bonus & branch requirement</th></tr></thead><tbody>{ranks.map((rank, index) => { const bonus = record(rank.bonus); const requirements = list(bonus.requirements); const selected = rank.current === true || Number(rank.id) === Number(currentRankId); return <tr className={selected ? "selected-row" : ""} key={text(rank.id, String(index))}><td data-label="Rank"><strong>{rankName(rank.id)}</strong>{selected && <span className="current-tag">Current</span>}</td><td data-label="Required turnover">{money(rank.premiumTurnover)} LV</td><td data-label="Personal investment">{money(rank.investmentsAmount)} USDT</td><td data-label="Profitshare">{percent(rank.profitShare)}</td><td data-label="Shareholder rate">{percent(Number(rank.shareholderPercent) * 100)}</td><td data-label="Rank bonus & branch requirement">{bonus.amount !== undefined && <strong>{money(bonus.amount)} USDT</strong>}{requirements.length > 0 ? requirements.map((requirement, requirementIndex) => <small className="rank-requirement" key={requirementIndex}>{requirementText(requirement)}</small>) : <small className="rank-requirement">No branch requirement</small>}</td></tr>; })}</tbody></table></div></section>

    <section className="partner-income-grid"><IncomeCard title="EX-AI team profitshare" data={team}/><IncomeCard title="RWA team profitshare" data={teamRwa}/></section>

    <section className="card accrual-card"><h2>Accrual history</h2><div className="table-card partner-table accrual-table"><table><thead><tr><th>Partner</th><th>Date</th><th>Bonus type</th><th>Deposit</th><th>Reward</th></tr></thead><tbody>{transactions.map((transaction, index) => <tr key={`${text(transaction.referralPrettyId)}-${index}`}><td data-label="Partner"><strong>{text(transaction.referralPrettyId)}</strong><small className="partner-detail">{[transaction.referralName, transaction.referralSurname].filter(Boolean).join(" ") || text(transaction.referralTelegram)}</small><small className="partner-detail">{text(transaction.referralTelegram, "—")} · {text(transaction.referralCountryName, text(transaction.referralCountry))}</small><small className="partner-detail">{text(transaction.referralPhone)}</small></td><td data-label="Date">{dateOnly(transaction.date)}</td><td data-label="Bonus type">{bonusType(transaction.type)}</td><td data-label="Deposit">{money(transaction.deposit)} USDT</td><td className={transaction.isRewardZero ? "" : "income"} data-label="Reward">{transaction.isRewardZero ? "—" : `+${money(transaction.reward)} USDT`}</td></tr>)}</tbody></table>{!transactions.length && <p className="empty">No partner accruals were returned by OrbitOne yet.</p>}</div></section>
  </>;
}
