"use client";

import { useState } from "react";
import { SyncButton } from "./SyncButton";

export function OrbitSidebar({ active = "dashboard", viewing }: { active?: "dashboard" | "bot" | "partner" | "statistics"; viewing?: { id: string; email: string } | null }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const href = (path: string) => (viewing ? `${path}?user=${viewing.id}` : path);
  return <>
    <header className="mobile-nav"><button className="menu-button" type="button" aria-label="Open navigation" aria-expanded={open} onClick={() => setOpen(true)}>☰</button><a href={href("/orbit")} className="mobile-brand"><img className="logo" src="/logo.png" alt=""/>OrbitOne</a>{!viewing && <SyncButton tool="orbit"/>}</header>
    <button className={`nav-overlay ${open ? "open" : ""}`} aria-label="Close navigation" onClick={close}/>
    <aside className={`sidebar ${open ? "open" : ""}`}><a href={href("/orbit")} className="brand" onClick={close}><img className="logo" src="/logo.png" alt=""/>OrbitOne</a><nav className="nav"><a href={viewing ? "/admin/users" : "/tools"} onClick={close}>🧭 {viewing ? "People" : "All tools"}</a><a href={href("/orbit")} onClick={close} className={active === "dashboard" ? "active" : ""}>Orbit dashboard</a><a href={href("/orbit/ex-ai-bot")} onClick={close} className={active === "bot" ? "active" : ""}>Ex-AI Bot</a><a href={href("/orbit/partner-program")} onClick={close} className={active === "partner" ? "active" : ""}>Partner program</a><a href={href("/orbit/partner-statistics")} onClick={close} className={active === "statistics" ? "active" : ""}>Partner statistics</a></nav>{viewing && <div className="viewing-note"><span className="hint">Viewing<br/><strong>{viewing.email}</strong></span><a className="btn ghost" href="/admin/users" onClick={close}>Exit</a></div>}{!viewing && <div className="sync-form"><SyncButton tool="orbit"/></div>}<form action="/api/auth/logout" method="post"><button className="btn ghost" type="submit">Log out</button></form></aside>
  </>;
}
