"use client";

import { useMemo, useState } from "react";
import { date, number } from "@/lib/utils/format";
import type { ReferralBot } from "@/types";

export function ReferralBotsTable({ bots }: { bots: ReferralBot[] }) {
  const [pair, setPair] = useState("");
  const [status, setStatus] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const pairs = useMemo(() => [...new Set(bots.map((bot) => bot.pair).filter((value): value is string => Boolean(value)))].sort(), [bots]);
  const statuses = useMemo(() => [...new Set(bots.map((bot) => bot.status).filter((value): value is string => Boolean(value)))].sort(), [bots]);
  const visible = useMemo(() => bots.filter((bot) => (!pair || bot.pair === pair) && (!status || bot.status === status)), [bots, pair, status]);
  const pages = Math.max(1, Math.ceil(visible.length / pageSize));
  const current = Math.min(page, pages);
  const rows = visible.slice((current - 1) * pageSize, current * pageSize);
  const reset = () => setPage(1);

  return <>
    <section className="card filters bot-filters"><select value={pair} onChange={(event) => { setPair(event.target.value); reset(); }}><option value="">All pairs</option>{pairs.map((value) => <option key={value} value={value}>{value}</option>)}</select><select value={status} onChange={(event) => { setStatus(event.target.value); reset(); }}><option value="">All statuses</option>{statuses.map((value) => <option key={value} value={value}>{value}</option>)}</select></section>
    <section className="card table-card"><table><thead><tr><th>Partner</th><th>Pair</th><th>Status</th><th>Start</th><th className="num">Profit</th><th className="num">Reward</th></tr></thead><tbody>{rows.map((bot) => <tr key={String(bot.bot_id)}><td data-label="Partner">{bot.user_name ?? bot.pretty_id ?? "—"}</td><td data-label="Pair">{bot.pair ?? "—"}</td><td data-label="Status"><span className="badge">{bot.status ?? "—"}</span></td><td data-label="Start">{date(bot.trading_start)}</td><td className="num" data-label="Profit">{number(bot.profit)}</td><td className="num" data-label="Reward">{number(bot.referral_reward)}</td></tr>)}</tbody></table>{!rows.length && <p className="empty">No referral trading bots match these filters.</p>}<div className="pager" hidden={!visible.length}><button disabled={current === 1} onClick={() => setPage(current - 1)}>← Prev</button><span>{current} / {pages}</span><button disabled={current === pages} onClick={() => setPage(current + 1)}>Next →</button><select aria-label="Bots per page" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); reset(); }}><option value={10}>10 / page</option><option value={25}>25 / page</option><option value={50}>50 / page</option><option value={100}>100 / page</option></select></div></section>
  </>;
}
