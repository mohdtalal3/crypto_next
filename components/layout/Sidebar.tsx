"use client";

import { useState } from "react";
import { SyncButton } from "./SyncButton";

const links = [["/tools", "🧭 All tools"], ["/dashboard", "Transactions"], ["/dashboard/partner", "Partner program"], ["/dashboard/partner/bots", "Partner statistics"], ["/dashboard/wallet", "Wallet"], ["/dashboard/live-trading", "Live Trading"], ["/dashboard/ex-ai-pro", "EX-AI PRO"], ["/dashboard/profile", "Profile"]] as const;
export function Sidebar({ active }: { active: string }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return <>
    <header className="mobile-nav"><button className="menu-button" type="button" aria-label="Open navigation" aria-expanded={open} onClick={() => setOpen(true)}>☰</button><a href="/dashboard" className="mobile-brand"><img className="logo" src="/logo.png" alt=""/>Neo Bank</a><SyncButton tool="neo"/></header>
    <button className={`nav-overlay ${open ? "open" : ""}`} aria-label="Close navigation" onClick={close}/>
    <aside className={`sidebar ${open ? "open" : ""}`}><a href="/dashboard" className="brand" onClick={close}><img className="logo" src="/logo.png" alt=""/>Neo Bank</a><nav className="nav">{links.map(([href, label]) => <a key={href} href={href} onClick={close} className={active === href ? "active" : ""}>{label}</a>)}</nav><div className="sync-form"><SyncButton tool="neo"/></div><p><a href="/download.csv" onClick={close}>⇩ Download CSV</a></p><form action="/api/auth/logout" method="post"><button className="btn ghost" type="submit">Log out</button></form></aside>
  </>;
}
