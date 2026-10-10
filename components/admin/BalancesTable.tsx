import { number } from "@/lib/utils/format";
import type { BalanceRow } from "@/lib/db/portal";

const PAGE_SIZE = 20;

export function BalancesTable({ rows, page, pages, total, search }: {
  rows: BalanceRow[]; page: number; pages: number; total: number; search: string;
}) {
  const link = (target: number) => `/admin/dashboard?page=${target}${search ? `&q=${encodeURIComponent(search)}` : ""}`;
  return <>
    <section className="card filters">
      <form method="get" action="/admin/dashboard">
        <input type="search" name="q" defaultValue={search} placeholder="🔍 Search by email…"/>
        {page > 1 && <input type="hidden" name="page" value="1"/>}
      </form>
    </section>
    <section className="card table-card"><table><thead><tr><th>Person</th><th className="num">EX-AI Bot</th><th className="num">Main wallet</th><th className="num">Partner wallet</th><th className="num">Total claimable</th></tr></thead><tbody>
      {rows.map((row) => <tr key={row.userId}>
        <td>{row.email}</td>
        <td className="num">{number(row.exAiBot, 2)}</td>
        <td className="num">{number(row.mainWallet, 2)}</td>
        <td className="num">{number(row.partnerWallet, 2)}</td>
        <td className="num"><strong>{number(row.total, 2)}</strong></td>
      </tr>)}
    </tbody></table>{!rows.length && <p className="empty">No balances match that search.</p>}</section>
    {pages > 1 && <nav className="pager" aria-label="Balances pagination">
      {page > 1 ? <a className="btn ghost" href={link(page - 1)}>← Prev</a> : <span/>}
      <span>Page {page} of {pages}</span>
      {page < pages ? <a className="btn ghost" href={link(page + 1)}>Next →</a> : <span/>}
      <span className="hint">{rows.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{(page - 1) * PAGE_SIZE + rows.length} of {total}</span>
    </nav>}
  </>;
}
