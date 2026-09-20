import { date, number } from "@/lib/utils/format";
import type { JsonObject } from "@/types";

type Data = Record<string, unknown>;
const record = (value: unknown): Data => value && typeof value === "object" && !Array.isArray(value) ? value as Data : {};
const list = (value: unknown): Data[] => Array.isArray(value) ? value.map(record) : [];
const first = (data: Data, keys: string[]) => keys.map((key) => data[key]).find((value) => value !== undefined && value !== null && value !== "");
const label = (value: unknown, fallback = "—") => value === undefined || value === null || value === "" ? fallback : String(value);
// The API formats larger monetary strings with spaces (for example "4 999.99").
// Normalize those values before using the shared numeric formatter.
const amount = (value: unknown) => {
  if (value === undefined || value === null || value === "") return "—";
  const raw = String(value).trim();
  const parsed = Number(raw.replace(/[\s,]/g, ""));
  return Number.isFinite(parsed) ? number(parsed) : raw;
};

function packageList(data: Data) {
  return list(data.packages ?? data.categoryShares ?? data.categories ?? data.investmentPackages ?? data.tariffs);
}

function depositList(data: Data) {
  return list(data.recentInvestments ?? data.investments ?? data.deposits ?? data.history ?? data.myInvestments);
}

const packageNames = ["START", "STANDARD", "COMFORT", "OPTIMAL", "PREMIUM", "ADVANCED", "ELITE", "VIP"];

export function ExAiBotDashboard({ data }: { data: JsonObject }) {
  const result = record(data.result);
  const root = Object.keys(result).length ? result : data;
  const balance = record(root.balance ?? root.depositBalance ?? root.summary);
  const packages = packageList(root);
  const deposits = depositList(root);
  const lastDeposit = record(balance.lastDeposit);
  const currency = label(first(balance, ["currency", "ticker", "asset"]), label(lastDeposit.ticker, "USDT"));
  const deposited = first(balance, ["totalDeposited", "totalDeposit", "deposited", "invested", "amount"]);
  const profit = first(balance, ["accumulatedProfit", "totalProfit", "profit", "income", "tokenBalance"]);
  const lastDepositAmount = first(lastDeposit, ["amount", "value"]) ?? first(balance, ["lastDepositAmount", "recentDeposit"]);

  return <>
    <section className="deposit-balance card"><h2>Deposit balance <span aria-hidden="true">◉</span></h2><div className="balance-columns"><div><span>Total deposited</span><strong>{amount(deposited)} <small>{currency}</small></strong>{lastDepositAmount !== undefined && <p>Last deposit <b>{amount(lastDepositAmount)} {currency}</b></p>}</div><div><span>Accumulated profit</span><strong className="profit">{amount(profit)} <small>{currency}</small></strong></div></div><div className="investment-actions"><button type="button" disabled>Create deposit</button><button type="button" disabled>Withdraw to WEB3 wallet</button></div><p className="hint">Deposit and withdrawal actions are shown for reference; this portal currently syncs investment data read-only.</p></section>
    <section className="investment-packages card"><h2>Deposit packages</h2><div className="package-grid">{packages.map((item, index) => {
      const name = label(first(item, ["name", "title", "category", "packageName", "type"]), packageNames[Number(item.index) || index] ?? `Package ${index + 1}`);
      const income = first(item, ["incomePercent", "annualPercent", "percent", "profitPercent", "apr"]);
      const clientShare = first(item, ["clientShare", "clientPercent", "userShare", "userPercent", "userValue"]);
      const companyShare = first(item, ["companyShare", "companyPercent", "platformShare", "referralsValue"]);
      const min = first(item, ["minInvestmentsAmount", "minDeposit", "minAmount", "minimum"]);
      const max = first(item, ["maxInvestmentsAmount", "maxDeposit", "maxAmount", "maximum"]);
      const selected = item.passed === true || Boolean(first(item, ["selected", "active", "current"]));
      return <div className="package-option" key={`${name}-${index}`}><article className={`package-card ${selected ? "selected" : ""}`}><div className="package-head"><strong>{name}</strong>{income !== undefined && <span className="income-pill">~{number(income, 2)}%</span>}</div><dl><div><dt>Client&apos;s share</dt><dd>{clientShare === undefined ? "—" : `${number(clientShare, 2)}%`}</dd></div><div><dt>Company&apos;s share</dt><dd>{companyShare === undefined ? "—" : `${number(companyShare, 2)}%`}</dd></div><div><dt>Min. deposit</dt><dd>{amount(min)} <small>USDT / USDC</small></dd></div><div><dt>Max. deposit</dt><dd>{amount(max)} <small>USDT / USDC</small></dd></div></dl></article><span className={selected ? "package-count selected" : "package-count"}>{amount(item.count)}</span></div>;
    })}</div>{!packages.length && <p className="empty">No deposit packages were returned by OrbitOne yet.</p>}</section>
    <section className="my-deposits card"><h2>My deposits</h2><div className="table-card investment-table"><table><thead><tr><th>ID</th><th>Created at</th><th>Deposit</th><th>Status</th><th>Received income</th><th>Reinvest</th></tr></thead><tbody>{deposits.map((item, index) => { const status = label(first(item, ["status", "state"]), item.withdrawalProfit ? "Waiting" : "—"); const reinvest = first(item, ["reinvest", "isReinvest", "reinvestment"]); const asset = label(first(item, ["ticker", "asset", "currency"]), currency); return <tr key={label(first(item, ["id", "investmentId", "uuid"]), String(index))}><td className="mono" data-label="ID">#{label(first(item, ["id", "investmentId", "uuid"])).slice(0, 8)}</td><td data-label="Created at">{date(first(item, ["createdAt", "created_at", "date", "created"]))}</td><td data-label="Deposit"><strong>{amount(first(item, ["deposit", "amount", "invested", "total"] ))} {asset}</strong></td><td data-label="Status"><span className={`badge ${status.toLowerCase()}`}>{status}</span></td><td className="income" data-label="Received income">+{amount(first(item, ["receivedIncome", "incomesTotal", "income", "profit", "earned"]))} {asset}</td><td data-label="Reinvest"><span className={reinvest ? "reinvest-switch on" : "reinvest-switch"} aria-label={reinvest ? "Reinvest enabled" : "Reinvest disabled"}><i/></span></td></tr>; })}</tbody></table>{!deposits.length && <p className="empty">No deposits were returned by OrbitOne yet.</p>}</div></section>
  </>;
}
