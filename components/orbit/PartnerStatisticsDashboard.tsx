"use client";

import { useMemo, useState } from "react";
import { number } from "@/lib/utils/format";
import type { JsonObject } from "@/types";

type Data = Record<string, unknown>;
const record = (value: unknown): Data => value && typeof value === "object" && !Array.isArray(value) ? value as Data : {};
const list = (value: unknown): Data[] => Array.isArray(value) ? value.map(record) : [];
const text = (value: unknown, fallback = "—") => value === undefined || value === null || value === "" ? fallback : String(value);
const rankNames = ["NOVA", "VOYAGER", "VANGUARD", "VANGUARD PRO", "NEXUS", "ORACLE", "PRIME", "ELITE", "MAGNAT", "MYTHOS", "LEGEND", "DOMINION", "ARCHON", "PANTHEON", "ALPHA"];
const rankName = (rank: unknown) => rankNames[Number(rank) - 1] ?? `RANK ${text(rank)}`;
const rankMark = (rank: unknown) => rankName(rank).slice(0, 1);

function contact(referral: Data) {
  return [referral.phone, referral.email, referral.telegram].filter((value) => value !== undefined && value !== null && value !== "").map(String);
}

export function PartnerStatisticsDashboard({ data }: { data: JsonObject }) {
  const meta = record(data);
  const referrals = list(meta.referrals);
  const statistics = record(meta.rankStatistics);
  const ranks = list(statistics.data);
  const [query, setQuery] = useState("");
  const [rank, setRank] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const inviter = { name: text(meta.inviterName), prettyId: text(meta.inviterPrettyId) };
  const ownerPrettyId = meta.ownPrettyId ?? referrals.find((item) => Number(item.levelDepth) === 1)?.inviterPrettyId ?? referrals[0]?.inviterPrettyId;
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return referrals.filter((referral) => {
      if (rank !== "all" && String(referral.rankId) !== rank) return false;
      if (!needle) return true;
      return [referral.name, referral.prettyId, referral.countryName, referral.country, referral.phone, referral.email, referral.telegram, referral.inviterPrettyId, referral.parentPrettyId, referral.userId].some((value) => String(value ?? "").toLowerCase().includes(needle));
    });
  }, [query, rank, referrals]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages);
  const shown = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const activePartners = ranks.reduce((sum, item) => sum + (Number(item.num) || 0), 0);
  const filterRanks = [...new Set(referrals.map((referral) => Number(referral.rankId)).filter(Number.isFinite))].sort((a, b) => a - b);
  const resetPage = () => setPage(1);

  return <>
    <section className="partner-stat-summary">
      <article className="card inviter-card"><span className="inviter-avatar" aria-hidden="true">{inviter.name.slice(0, 1).toUpperCase()}</span><div><span>You were invited by</span><h2>{inviter.name}</h2><p><b>ID: {inviter.prettyId}</b></p></div><span className="invited-label">↗ Invited you</span></article>
      <article className="card network-card"><span>Total direct/network referrals</span><strong>{number(meta.total ?? referrals.length)}</strong><p>{ownerPrettyId ? <>Your referral ID: <b>{text(ownerPrettyId)}</b></> : "Your referral identifier was not returned."}</p><small>Each row keeps its own inviter and parent IDs for relationship mapping.</small></article>
    </section>

    <section className="card referral-table-card"><div className="partner-stat-head"><div><h2>Partners</h2><p>People who joined through your referral network. Search and rank filtering apply locally to the complete synced JSON response.</p></div><div className="referral-filters"><input aria-label="Search partners" value={query} onChange={(event) => { setQuery(event.target.value); resetPage(); }} placeholder="Search name, ID, contact…"/><select aria-label="Filter by rank" value={rank} onChange={(event) => { setRank(event.target.value); resetPage(); }}><option value="all">All ranks</option>{filterRanks.map((item) => <option key={item} value={item}>{rankName(item)}</option>)}</select><button className="btn ghost" type="button" onClick={() => { setQuery(""); setRank("all"); resetPage(); }}>Clear</button></div></div><div className="referral-context"><span>Viewing referrals from <b>{text(ownerPrettyId, "your referral link")}</b></span><span>{filtered.length} of {referrals.length} shown</span></div><div className="table-card partner-table referral-table"><table><thead><tr><th>Partner</th><th>Partner ID / user ID</th><th>Country</th><th>Contacts</th><th>Rank & line</th><th>Team</th><th>Invited by ID</th><th>Parent ID</th></tr></thead><tbody>{shown.map((referral, index) => { const name = text(referral.name); const prettyId = text(referral.prettyId); const userId = text(referral.userId); const rankId = referral.rankId; const photo = referral.photo; return <tr key={userId === "—" ? `${prettyId}-${index}` : userId}><td data-label="Partner"><span className="referral-name"><i aria-hidden="true">{photo ? "●" : name.slice(0, 1).toUpperCase()}</i><strong>{name}</strong></span><small className="partner-detail">{photo ? "Profile photo supplied" : "No profile photo supplied"}</small></td><td className="mono" data-label="Partner ID / user ID"><strong>{prettyId}</strong><small className="partner-detail">{userId}</small></td><td data-label="Country">{text(referral.countryName)}<small className="partner-detail">Country code: {text(referral.country)}</small></td><td data-label="Contacts">{contact(referral).length ? contact(referral).map((value) => <small className="partner-detail contact-detail" key={value}>{value}</small>) : "—"}</td><td data-label="Rank & line"><strong>{rankName(rankId)}</strong><small className="partner-detail">Rank ID: {text(rankId)} · Line depth: {text(referral.levelDepth)}</small><small className="partner-detail">Branch: {text(referral.referralBranch)}</small></td><td data-label="Team">{number(referral.referralsCount)}<small className="partner-detail">Their referrals</small></td><td className="mono" data-label="Invited by ID">{text(referral.inviterPrettyId)}<small className="partner-detail">Direct inviter identifier</small></td><td className="mono" data-label="Parent ID">{text(referral.parentPrettyId)}<small className="partner-detail">Parent in referral tree</small></td></tr>; })}</tbody></table>{!shown.length && <p className="empty">No referrals match this search.</p>}</div>{filtered.length > 0 && <div className="pager referral-pager"><button className="btn ghost" type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>← Prev</button><span>{currentPage} / {pages}</span><button className="btn ghost" type="button" disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}>Next →</button><select aria-label="Referrals per page" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); resetPage(); }}><option value={10}>10 / page</option><option value={25}>25 / page</option><option value={50}>50 / page</option></select></div>}</section>

    <section className="card rank-statistics-card"><div className="partner-stat-head"><div><h2>Legacy Levels distribution</h2><p>Rank statistics returned by OrbitOne for the active partner network.</p></div><strong>Total active partners: {number(activePartners)}</strong></div><div className="rank-distribution">{ranks.map((item, index) => <article key={`${text(item.rankId)}-${index}`}><span className="rank-medallion">{rankMark(item.rankId)}</span><h3>{rankName(item.rankId)}</h3><strong>{number(item.num)}</strong><small>{text(item.percentage)}%</small></article>)}</div>{!ranks.length && <p className="empty">No rank statistics were returned by OrbitOne yet.</p>}</section>
  </>;
}
