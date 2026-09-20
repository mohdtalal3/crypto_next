import type { Transaction } from "@/types";

export interface TickerAggregate {
  ticker: string;
  count: number;
  in: number;
  out: number;
}

export function summarizeTransactions(rows: Transaction[]): TickerAggregate[] {
  const assets = new Map<string, { in: number; out: number; count: number }>();
  for (const row of rows) {
    const ticker = (row.ticker ?? "—").toUpperCase();
    const slot = assets.get(ticker) ?? { in: 0, out: 0, count: 0 };
    if (row.direction === "in") slot.in += Math.abs(Number(row.amount ?? 0));
    else slot.out += Math.abs(Number(row.amount ?? 0));
    slot.count++;
    assets.set(ticker, slot);
  }
  return [...assets.entries()].map(([ticker, s]) => ({ ticker, ...s })).sort((a, b) => b.count - a.count);
}
