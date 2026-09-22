export type JsonObject = Record<string, unknown>;
export type PortalRole = "user" | "admin" | "founder" | "ceo" | "coo";

export interface PortalPerson {
  id: string;
  email: string;
  role: PortalRole;
  active: boolean;
  createdAt: string | null;
  lastSignIn: string | null;
}
export type Tool = "neo" | "orbit" | "backoffice";

export interface PortalSession {
  userId: string;
  email: string;
  role: PortalRole;
  aurumToken?: string;
  orbitToken?: string;
  backofficeToken?: string;
}

export interface Transaction {
  user_id: string;
  id: string;
  tx_date: string | null;
  kind: string | null;
  status: string | null;
  amount: string | number | null;
  fee: string | number | null;
  ticker: string | null;
  direction: "in" | "out" | null;
  blockchain: string | null;
  address: string | null;
  hash: string | null;
  explorer_address: string | null;
  explorer_tx: string | null;
  email: string | null;
}

export interface ReferralBot extends JsonObject {
  bot_id: string | number;
  user_name?: string | null;
  pretty_id?: string | null;
  pair?: string | null;
  trading_start?: string | null;
  last_trade?: string | null;
  asset_in_trading?: string | number | null;
  profit?: string | number | null;
  positive_orders?: number | null;
  negative_orders?: number | null;
  status?: string | null;
  referral_reward?: string | number | null;
  trading_period_seconds?: string | number | null;
}
