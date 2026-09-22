"use client";

import { useState } from "react";
import { SyncButton } from "./SyncButton";

export function BackofficeSidebar({ active = "affiliates", viewing }: { active?: "affiliates" | "profile"; viewing?: { id: string; email: string } | null }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const href = (path: string) => (viewing ? `${path}?user=${viewing.id}` : path);
  return <>
    <header className="mobile-nav"><button className="menu-button" type="button" aria-label="Open navigation" aria-expanded={open} onClick={() => setOpen(true)}>☰</button><a href={href("/backoffice/affiliates")} className="mobile-brand"><img className="logo" src="/logo.png" alt=""/>Backoffice</a>{!viewing && <SyncButton tool="backoffice"/>}</header>
    <button className={`nav-overlay ${open ? "open" : ""}`} aria-label="Close navigation" onClick={close}/>
    <aside className={`sidebar ${open ? "open" : ""}`}><a href={href("/backoffice/affiliates")} className="brand" onClick={close}><img className="logo" src="/logo.png" alt=""/>Backoffice</a><nav className="nav">
      <a href={viewing ? "/admin/users" : "/tools"} onClick={close}>🧭 {viewing ? "People" : "All tools"}</a>
      <a href={href("/backoffice/affiliates")} onClick={close} className={active === "affiliates" ? "active" : ""}>Affiliates</a>
      <a href={href("/backoffice/profile")} onClick={close} className={active === "profile" ? "active" : ""}>Profile</a>
    </nav>{viewing && <div className="viewing-note"><span className="hint">Viewing<br/><strong>{viewing.email}</strong></span><a className="btn ghost" href="/admin/users" onClick={close}>Exit</a></div>}{!viewing && <div className="sync-form"><SyncButton tool="backoffice"/></div>}<form action="/api/auth/logout" method="post"><button className="btn ghost" type="submit">Log out</button></form></aside>
  </>;
}
