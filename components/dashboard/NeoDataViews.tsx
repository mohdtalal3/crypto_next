import { date, number, short } from "@/lib/utils/format";
import type { JsonObject } from "@/types";

type RecordValue = Record<string, unknown>;
const record = (value: unknown): RecordValue => value && typeof value === "object" && !Array.isArray(value) ? value as RecordValue : {};
const records = (value: unknown): RecordValue[] => Array.isArray(value) ? value.map(record) : [];
const text = (value: unknown, fallback = "—") => value === null || value === undefined || value === "" ? fallback : String(value);

export function ZeusProView({ data }: { data: JsonObject }) {
  const zeus = record(data);
  const active = Boolean(zeus.isActivated);
  const eligible = Boolean(zeus.isEoughtToActivate);
  const pairs = Array.isArray(zeus.proPairs) ? zeus.proPairs : [];
  return <>
    <h2 className="section-title">Current EX-AI Bot Status</h2>
    <section className="stats">
      <Stat label="EX-AI Bot deposit" value={number(zeus.depositAmount)} suffix="USDT" />
      <Stat label="EX-AI PRO limit" value={number(zeus.zeusProLimit)} suffix="USDT" tone="in" note={zeus.currentLimit === zeus.depositAmount ? "ⓘ Equal to your deposit" : undefined} />
      {zeus.minRequired != null && <Stat label="Min required" value={number(zeus.minRequired)} suffix="USDT" />}
    </section>
    <p className={active ? "alert alert-ok" : "alert alert-warn"}>{active ? "✅ EX-AI PRO is active on your account." : `ⓘ Make a deposit to start using EX-AI PRO${zeus.minRequired != null ? ` (min ${number(zeus.minRequired)} USDT)` : ""}.`}</p>
    <section className="stats">
      <Stat label="Current users now" value={number(zeus.zeusActivatedUsers, 0)} />
      <Stat label="Total trading amount" value={`+${number(zeus.totalTradingAmount, 0)}`} suffix="USDT" tone="in" />
      <Stat label="Eligible to activate" value={eligible ? "Yes" : "No"} tone={eligible ? "in" : "out"} />
    </section>
    {pairs.length > 0 && <section className="card"><span className="stat-label">Pro pairs</span><div className="chips">{pairs.map((pair) => <span className="badge" key={String(pair)}>{String(pair)}</span>)}</div></section>}
  </>;
}

function Stat({ label, value, suffix, tone, note }: { label: string; value: string; suffix?: string; tone?: "in" | "out"; note?: string }) {
  return <div className="card stat"><span className="stat-label">{label}</span><span className={`stat-value ${tone ?? ""}`}>{value}{suffix && <small> {suffix}</small>}</span>{note && <span className="stat-note">{note}</span>}</div>;
}

const walletTickers = ["usdt", "btc", "eth", "bnb", "sol", "doge", "pepe", "pol", "arm"];
export function WalletView({ data }: { data: JsonObject }) {
  const wallet = record(data.wallet);
  const cards = walletTickers.slice(0, 7).flatMap((ticker) => wallet[ticker] ? [[ticker, record(wallet[ticker])]] as const : []);
  const depositTickers = records(data.depositTickers);
  return <>
    <section className="stats">{cards.map(([ticker, item]) => <Stat key={ticker} label={`${ticker.toUpperCase()} balance`} value={number(item.amount)} suffix={ticker.toUpperCase()} />)}</section>
    <section className="card table-card"><table><thead><tr><th>Asset</th><th className="num">Balance</th><th>Deposit address</th><th className="num">Withdraw fee</th><th className="num">Min amount</th></tr></thead><tbody>{walletTickers.flatMap((ticker) => { const item = record(wallet[ticker]); return Object.keys(item).length ? <tr key={ticker}><td data-label="Asset"><strong>{ticker.toUpperCase()}</strong></td><td className="num" data-label="Balance">{number(item.amount)}</td><td className="mono address" data-label="Deposit address" title={text(item.address)}>{text(item.address)}</td><td className="num fee" data-label="Withdraw fee">{text(item.getAwayFee)}</td><td className="num fee" data-label="Min amount">{text(item.minAmount)}</td></tr> : []; })}</tbody></table></section>
    {depositTickers.length > 0 && <section className="card"><span className="stat-label">Deposit tickers</span><div className="chips">{depositTickers.map((item, index) => <span className="badge" key={`${text(item.ticker)}-${index}`}>{text(item.ticker)} · {text(item.blockchain).replaceAll("_", " ")}</span>)}</div></section>}
  </>;
}

export function LiveTradingView({ data }: { data: JsonObject }) {
  const balances = records(data.balances);
  const pairs = records(data.pairWithImgName);
  const bots = records(data.bots);
  return <>
    <section className="stats">{balances.map((balance) => { const asset = text(balance.asset, "").replace("MAIN-", ""); return <Stat key={asset} label={`${asset} balance`} value={number(balance.amount)} suffix={asset} />; })}</section>
    <section className="card table-card"><table><thead><tr><th>Pair</th><th>Status</th><th>Type</th><th className="num">Min price</th></tr></thead><tbody>{pairs.map((pair, index) => <tr key={text(pair.id, String(index))}><td data-label="Pair"><strong>{text(pair.pair)}</strong></td><td data-label="Status"><span className={pair.visible ? "badge done" : "badge pending"}>{pair.visible ? "Available" : "Hidden"}</span></td><td data-label="Type"><span className="badge">{pair.isPro ? "⚡ PRO" : "Standard"}</span></td><td className="num" data-label="Min price">{text(pair.minPrice)}</td></tr>)}</tbody></table></section>
    <section className="card pro-limit"><span className="stat-label">Current PRO limit</span><span className="stat-value">{number(data.currentProLimit)} <small>USDT</small></span></section>
    {bots.length > 0 && <section className="card table-card"><div className="table-heading">Active bots</div><table><thead><tr><th>Bot</th><th>Pair</th><th>Status</th></tr></thead><tbody>{bots.map((bot, index) => <tr key={text(bot.botId, String(index))}><td className="mono" data-label="Bot">{text(bot.botId)}</td><td data-label="Pair">{text(bot.pair)}</td><td data-label="Status"><span className="badge">{text(bot.status)}</span></td></tr>)}</tbody></table></section>}
  </>;
}

export function PartnerView({ data }: { data: JsonObject }) {
  const balances = record(data.partnerBalances);
  const withdrawn = record(data.withdrawn);
  const commissions = record(data.totalLiveTradingReferrals);
  return <>
    <section className="stats"><Stat label="Partners invited" value={number(data.totalPartnersInvited, 0)} /><Stat label="Referral rank" value={`#${text(data.referralRankId)}`} /><Stat label="Bonus from transactions" value={`${number(data.referralLevelPercent)}%`} tone="in" /><Stat label="Trading bot earnings bonus" value={`${number(data.bonusFromTransactions)}%`} /><Stat label="Extra bonus" value={number(data.totalReferralRankBonuses)} /></section>
    <section className="card table-card"><table><thead><tr><th>Asset</th><th className="num">Available commissions balance</th><th className="num">Withdrawn</th><th className="num">Partner bot commission</th></tr></thead><tbody>{Object.entries(balances).map(([ticker, balance]) => <tr key={ticker}><td data-label="Asset"><strong>{ticker.toUpperCase()}</strong></td><td className="num" data-label="Available commissions balance">{number(balance)}</td><td className="num fee" data-label="Withdrawn">{text(withdrawn[ticker])}</td><td className="num fee" data-label="Partner bot commission">{text(commissions[ticker])}</td></tr>)}</tbody></table></section>
  </>;
}

export function ProfileView({ data }: { data: JsonObject }) {
  const credentials = record(data.credentials); const personal = record(data.personal); const phone = record(credentials.parsedPhone);
  const rows: [string, React.ReactNode][] = [["Aurum ID", <span className="mono" key="id">{text(data.id)}</span>], ["Public ID", <span className="mono" key="public">#{text(data.prettyId)}</span>], ["Referral link", data.refLink ? <a href={String(data.refLink)} target="_blank" rel="noreferrer" key="link">{String(data.refLink)}</a> : "—"], ["Inviter ID", <span className="mono" key="inviter">{text(data.inviterId)}</span>], ["Member since", String(data.createdAt ?? "").slice(0, 10) || "—"], ["Full name", `${text(personal.name, "")} ${text(personal.surname, "")}`.trim() || "—"], ["Country", text(personal.country).toUpperCase()], ["Email", text(credentials.email)], ["Nickname", text(credentials.nickname)], ["Phone", credentials.phone ? <>{text(credentials.phone)} <small className="muted">({text(phone.countryCode, "")})</small></> : "—"], ["Telegram", credentials.tgNickname ? <>@{text(credentials.tgNickname)} <small className="muted">connected {String(credentials.tgConnectedDate ?? "").slice(0, 10)}</small></> : "—"], ["2FA (TOTP)", credentials.totpEnabled ? "Enabled" : "Disabled"], ["Account frozen", data.freezed ? "Yes" : "No"]];
  return <><section className="card profile"><div className="avatar">{text(credentials.nickname ?? credentials.email, "A")[0]?.toUpperCase()}</div><div><h2>{text(credentials.nickname ?? credentials.email, "Account")} {data.prettyId ? <span className="badge">#{text(data.prettyId)}</span> : null} <span className={credentials.totpEnabled ? "badge done" : "badge pending"}>{credentials.totpEnabled ? "2FA on" : "2FA off"}</span></h2><p className="subtitle">{text(credentials.email, "")} {credentials.tgNickname ? ` · TG @${text(credentials.tgNickname)}` : ""}</p></div></section><section className="card table-card detail-table"><table><tbody>{rows.map(([label, value]) => <tr key={label}><th>{label}</th><td>{value}</td></tr>)}</tbody></table></section></>;
}
