"use client";

import { useState } from "react";
import { SyncButton } from "./SyncButton";

export function OrbitSidebar({ active = "dashboard" }: { active?: "dashboard" | "bot" | "partner" | "statistics" }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return <>
    <header className="mobile-nav"><button className="menu-button" type="button" aria-label="Open navigation" aria-expanded={open} onClick={() => setOpen(true)}>☰</button><a href="/orbit" className="mobile-brand"><img className="logo" src="/logo.png" alt=""/>OrbitOne</a><SyncButton tool="orbit"/></header>
    <button className={`nav-overlay ${open ? "open" : ""}`} aria-label="Close navigation" onClick={close}/>
    <aside className={`sidebar ${open ? "open" : ""}`}><a href="/orbit" className="brand" onClick={close}><img className="logo" src="/logo.png" alt=""/>OrbitOne</a><nav className="nav"><a href="/tools" onClick={close}>🧭 All tools</a><a href="/orbit" onClick={close} className={active === "dashboard" ? "active" : ""}>Orbit dashboard</a><a href="/orbit/ex-ai-bot" onClick={close} className={active === "bot" ? "active" : ""}>Ex-AI Bot</a><a href="/orbit/partner-program" onClick={close} className={active === "partner" ? "active" : ""}>Partner program</a><a href="/orbit/partner-statistics" onClick={close} className={active === "statistics" ? "active" : ""}>Partner statistics</a></nav><div className="sync-form"><SyncButton tool="orbit"/></div><form action="/api/auth/logout" method="post"><button className="btn ghost" type="submit">Log out</button></form></aside>
  </>;
}
