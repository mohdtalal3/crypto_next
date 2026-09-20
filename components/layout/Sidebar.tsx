"use client";

import { useState } from "react";
import { SyncButton } from "./SyncButton";

const links = [["/dashboard", "Transactions"], ["/dashboard/partner", "Partner program"], ["/dashboard/partner/bots", "Partner statistics"], ["/dashboard/wallet", "Wallet"], ["/dashboard/live-trading", "Live Trading"], ["/dashboard/ex-ai-pro", "EX-AI PRO"]] as const;
export function Sidebar({ active, viewing }: { active: string; viewing?: { id: string; email: string } | null }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const href = (path: string) => (viewing ? `${path}?user=${viewing.id}` : path);
  return <>
    <header className="mobile-nav"><button className="menu-button" type="button" aria-label="Open navigation" aria-expanded={open} onClick={() => setOpen(true)}>☰</button><a href={href("/dashboard")} className="mobile-brand"><img className="logo" src="/logo.png" alt=""/>Neo Bank</a>{!viewing && <SyncButton tool="neo"/>}</header>
    <button className={`nav-overlay ${open ? "open" : ""}`} aria-label="Close navigation" onClick={close}/>
    <aside className={`sidebar ${open ? "open" : ""}`}><a href={href("/dashboard")} className="brand" onClick={close}><img className="logo" src="/logo.png" alt=""/>Neo Bank</a><nav className="nav"><a href={viewing ? "/admin/users" : "/tools"} onClick={close}>🧭 {viewing ? "People" : "All tools"}</a>{links.map(([path, label]) => <a key={path} href={href(path)} onClick={close} className={active === path ? "active" : ""}>{label}</a>)}{!viewing && <a href="/dashboard/profile" onClick={close} className={active === "/dashboard/profile" ? "active" : ""}>Profile</a>}</nav>{viewing && <div className="viewing-note"><span className="hint">Viewing<br/><strong>{viewing.email}</strong></span><a className="btn ghost" href="/admin/users" onClick={close}>Exit</a></div>}{!viewing && <div className="sync-form"><SyncButton tool="neo"/></div>}{!viewing && <p><a href="/download.csv" onClick={close}>⇩ Download CSV</a></p>}<form action="/api/auth/logout" method="post"><button className="btn ghost" type="submit">Log out</button></form></aside>
  </>;
}
