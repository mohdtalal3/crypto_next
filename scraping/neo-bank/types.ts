import type { JsonObject } from "@/types";

export interface NeoSyncData {
  userInfo?: JsonObject;
  affiliate?: JsonObject;
  zeusPro?: JsonObject;
  wallet?: JsonObject;
  liveTrading?: JsonObject;
  transactions: JsonObject[];
  referralBots?: { summary: JsonObject; bots: JsonObject[] };
}
