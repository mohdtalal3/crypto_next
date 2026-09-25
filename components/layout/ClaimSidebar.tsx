"use client";

import { useState } from "react";

export function ClaimSidebar({ active = "claims" }: { active?: "claims" }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return <>
    <header className="mobile-nav"><button className="menu-button" type="button" aria-label="Open navigation" aria-expanded={open} onClick={() => setOpen(true)}>☰</button><a href="/claim" className="mobile-brand"><img className="logo" src="/logo.png" alt=""/>Claim</a></header>
    <button className={`nav-overlay ${open ? "open" : ""}`} aria-label="Close navigation" onClick={close}/>
    <aside className={`sidebar ${open ? "open" : ""}`}><a href="/claim" className="brand" onClick={close}><img className="logo" src="/logo.png" alt=""/>Claim</a><nav className="nav">
      <a href="/tools" onClick={close}>🧭 All tools</a>
      <a href="/claim" onClick={close} className={active === "claims" ? "active" : ""}>Claims</a>
    </nav><form action="/api/auth/logout" method="post"><button className="btn ghost" type="submit">Log out</button></form></aside>
  </>;
}
