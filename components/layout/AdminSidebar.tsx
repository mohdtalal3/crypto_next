"use client";

import { useState } from "react";

export function AdminSidebar({ active, founder }: { active: "people" | "staff"; founder: boolean }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return <>
    <header className="mobile-nav"><button className="menu-button" type="button" aria-label="Open navigation" aria-expanded={open} onClick={() => setOpen(true)}>☰</button><a href="/admin/users" className="mobile-brand"><img className="logo" src="/logo.png" alt=""/>Admin</a></header>
    <button className={`nav-overlay ${open ? "open" : ""}`} aria-label="Close navigation" onClick={close}/>
    <aside className={`sidebar ${open ? "open" : ""}`}><a href="/admin/users" className="brand" onClick={close}><img className="logo" src="/logo.png" alt=""/>Admin</a><nav className="nav">
      <a href="/admin/users" onClick={close} className={active === "people" ? "active" : ""}>People</a>
      {founder && <a href="/admin" onClick={close} className={active === "staff" ? "active" : ""}>Staff access</a>}
      <a href="/tools" onClick={close}>🧭 All tools</a>
    </nav><form action="/api/auth/logout" method="post"><button className="btn ghost" type="submit">Log out</button></form></aside>
  </>;
}
