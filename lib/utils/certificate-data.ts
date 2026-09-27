import type { JsonObject } from "@/types";

type Data = Record<string, unknown>;
const record = (value: unknown): Data => value && typeof value === "object" && !Array.isArray(value) ? value as Data : {};
const list = (value: unknown): Data[] => Array.isArray(value) ? value.map(record) : [];
const first = (data: Data, keys: string[]) => keys.map((key) => data[key]).find((value) => value !== undefined && value !== null && value !== "");
const label = (value: unknown, fallback = "—") => value === undefined || value === null || value === "" ? fallback : String(value);
// The API formats larger monetary strings with spaces (for example "4 999.99").
const amount = (value: unknown) => {
  if (value === undefined || value === null || value === "") return "—";
  const raw = String(value).trim();
  const parsed = Number(raw.replace(/[\s,]/g, ""));
  return Number.isFinite(parsed) ? parsed.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : raw;
};

export function parseExAi(data: JsonObject) {
  const result = record(data.result);
  const root = Object.keys(result).length ? result : data;
  return {
    balance: record(root.balance ?? root.depositBalance ?? root.summary),
    packages: list(root.packages ?? root.categoryShares ?? root.categories ?? root.investmentPackages ?? root.tariffs),
    deposits: list(root.recentInvestments ?? root.investments ?? root.deposits ?? root.history ?? root.myInvestments),
  };
}

export function depositShortId(deposit: Data) {
  return label(first(deposit, ["id", "investmentId", "uuid"]), "").replace(/^#/, "").slice(0, 8);
}

export interface PartnerCertificateData {
  memberName: string;
  accountId: string;
  claimNumber: string;
  status: string;
  claimable: string;
  balanceType: string;
  available: string;
  used: string;
  sourceSystem: string;
  balanceCategory: string;
  availableStatus: string;
  claimAsset: string;
  claimableAmount: string;
  usedAmount: string;
  certificateId: string;
  generatedOn: string;
  asset: string;
}

/** Collects the Partner Balance certificate fields from the stored /partners snapshot. */
export function buildPartnerCertificateData({ data, profile, claimNumber }: { data: JsonObject; profile: JsonObject | null; claimNumber: string | null }): PartnerCertificateData | null {
  const result = record(data.result);
  const partner = Object.keys(result).length ? result : data;
  const withdrawal = record(partner.withdrawLimit);
  const available = Number(String(withdrawal.available ?? "0").replace(/[\s,]/g, "")) || 0;
  if (partner.partnerBalance === undefined && partner.partnerBalance === null) return null;
  const personal = record(profile?.personal);
  const credentials = record(profile?.credentials);
  const accountId = label(profile?.prettyId);
  const asset = "USDT";
  const status = "Waiting";
  return {
    memberName: `${label(personal.name, "")} ${label(personal.surname, "")}`.trim() || label(credentials.nickname, "Member"),
    accountId,
    claimNumber: claimNumber ?? "—",
    status,
    claimable: `${amount(partner.partnerBalance)} ${asset}`,
    balanceType: "Partner balance",
    available: `${amount(withdrawal.available)} ${asset}`,
    used: `${amount(withdrawal.used)} ${asset}`,
    sourceSystem: "Ecosystem Wallet",
    balanceCategory: "Partner balance",
    availableStatus: available > 0 ? "Withdrawable" : "None",
    claimAsset: asset,
    claimableAmount: `${amount(partner.partnerBalance)} ${asset}`,
    usedAmount: `${amount(withdrawal.used)} ${asset}`,
    certificateId: `PRTN-${accountId}`,
    generatedOn: new Date().toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" }),
    asset,
  };
}

export interface CertificateData {
  memberName: string;
  accountId: string;
  claimNumber: string;
  status: string;
  claimable: string;
  totalDeposited: string;
  depositId: string;
  createdAt: string;
  source: string;
  tier: string;
  earningRate: string;
  compounding: string;
  payouts: string;
  principalRange: string;
  quantity: string;
  clientShare: string;
  companyShare: string;
  receivedIncome: string;
  accumulatedProfit: string;
  certificateId: string;
  generatedOn: string;
  asset: string;
}

/** Collects everything the EX-AI certificate needs from the stored snapshots. */
// The API returns packages without names; the Ex-AI Bot view names them by position.
const packageNames = ["START", "STANDARD", "COMFORT", "OPTIMAL", "PREMIUM", "ADVANCED", "ELITE", "VIP"];

export function buildExAiCertificateData({ data, profile, claimNumber, depositId }: { data: JsonObject; profile: JsonObject | null; claimNumber: string | null; depositId?: string }): CertificateData | null {
  const { balance, packages, deposits } = parseExAi(data);
  const deposit = deposits.find((item) => depositShortId(item) === (depositId ?? "").replace(/^#/, "")) ?? deposits[0];
  if (!deposit) return null;
  const selectedIndex = packages.findIndex((item) => item.passed === true);
  const selected = selectedIndex >= 0 ? packages[selectedIndex] : packages[0];
  const tierIndex = selected ? (Number(selected.index) || (selectedIndex >= 0 ? selectedIndex : 0)) : -1;
  const tier = selected ? label(first(selected, ["name", "title", "category", "packageName", "type"]), packageNames[tierIndex] ?? `Package ${tierIndex + 1}`) : "—";
  const personal = record(profile?.personal);
  const credentials = record(profile?.credentials);
  const currency = label(first(balance, ["currency", "ticker", "asset"]), "USDT");
  const asset = label(first(deposit, ["ticker", "asset", "currency"]), currency);
  const shortId = depositShortId(deposit);
  const created = first(deposit, ["createdAt", "created_at", "date", "created"]);
  return {
    memberName: `${label(personal.name, "")} ${label(personal.surname, "")}`.trim() || label(credentials.nickname, "Member"),
    accountId: label(profile?.prettyId),
    claimNumber: claimNumber ?? "—",
    status: label(first(deposit, ["status", "state"]), deposit.withdrawalProfit ? "Waiting" : "—"),
    claimable: `${amount(first(deposit, ["deposit", "amount", "invested", "total"]))} ${asset}`,
    totalDeposited: `${amount(first(balance, ["totalDeposited", "totalDeposit", "deposited", "invested", "amount"]))} ${asset}`,
    depositId: `#${shortId}`,
    createdAt: created ? new Date(String(created)).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" }) : "—",
    source: "EX-AI Bot",
    tier,
    earningRate: selected ? `~${label(first(selected, ["incomePercent", "annualPercent", "percent", "profitPercent", "apr"]), "0")}% monthly` : "—",
    compounding: "Monthly",
    payouts: "Daily",
    principalRange: selected ? `${amount(first(selected, ["minInvestmentsAmount", "minDeposit", "minAmount", "minimum"]))} - ${amount(first(selected, ["maxInvestmentsAmount", "maxDeposit", "maxAmount", "maximum"]))} ${asset} / USDC` : "—",
    quantity: selected ? label(selected.count, "1") : "—",
    clientShare: selected ? `${label(first(selected, ["clientShare", "clientPercent", "userShare", "userPercent", "userValue"]))}%` : "—",
    companyShare: selected ? `${label(first(selected, ["companyShare", "companyPercent", "platformShare", "referralsValue"]))}%` : "—",
    receivedIncome: `${amount(first(deposit, ["receivedIncome", "incomesTotal", "income", "profit", "earned"]))} ${asset}`,
    accumulatedProfit: `${amount(first(balance, ["accumulatedProfit", "totalProfit", "profit", "income", "tokenBalance"]))} ${asset}`,
    certificateId: `EXAI-${shortId}`,
    generatedOn: new Date().toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" }),
    asset,
  };
}
