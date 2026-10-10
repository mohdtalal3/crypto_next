import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { BackLink } from "@/components/layout/BackLink";
import { BalancesTable } from "@/components/admin/BalancesTable";
import { requireStaff } from "@/lib/auth/guards";
import { userBalancesPage } from "@/lib/db/portal";
import { claimableBalances } from "@/lib/db/observatory";
import { number } from "@/lib/utils/format";

const PAGE_SIZE = 20;

const CARDS: Array<{ source: string; label: string }> = [
  { source: "all_sources", label: "All sources combined" },
  { source: "ex_ai_bot", label: "EX-AI Bot deposits" },
  { source: "main_wallet", label: "Main wallet" },
  { source: "partner_wallet", label: "Partner wallet" },
];

export default async function AdminBalances({ searchParams }: { searchParams: Promise<{ error?: string; page?: string; q?: string }> }) {
  const session = await requireStaff();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const search = typeof params.q === "string" ? params.q : "";
  const [aggregates, balances, { error }] = await Promise.all([claimableBalances(), userBalancesPage(page, search), searchParams]);
  const pages = Math.max(1, Math.ceil(balances.total / PAGE_SIZE));
  const current = Math.min(page, pages);
  const rows = current === page ? balances.rows : (await userBalancesPage(current, search)).rows;
  return <div className="layout"><AdminSidebar active="dashboard" founder={session.role === "founder"}/><main className="wrap">
    <header className="topbar"><div><h1>Dashboard</h1><p className="subtitle">Claimable balances across all members — totals refresh with the cron job, per-user rows with each sync.</p></div><BackLink/></header>
    {error && <p className="alert">⚠️ {error}</p>}
    <section className="stats">
      {CARDS.map((card) => {
        const aggregate = aggregates.find((entry) => entry.source === card.source);
        return <div className={`card stat${card.source === "all_sources" ? " gold" : ""}`} key={card.source}>
          <span className="stat-label">{card.label}</span>
          <span className="stat-value">{number(aggregate?.total ?? 0, 2)} <small>USDT</small></span>
          <span className="hint">{aggregate?.members ?? 0} members holding</span>
        </div>;
      })}
    </section>
    <BalancesTable rows={rows} page={current} pages={pages} total={balances.total} search={search}/>
  </main></div>;
}
