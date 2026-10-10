"use client";

import { useEffect, useState } from "react";

// The Observatory page is ISR-cached and shared by every visitor, so the
// logged-out CTAs are the static markup. After hydration this checks the
// session and swaps them for a single "Open the portal" link for members.
export function AuthCtas({ variant }: { variant: "header" | "hero" }) {
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setAuthed(Boolean(d?.authenticated)))
      .catch(() => {});
  }, []);
  if (!authed) return variant === "header"
    ? <nav className="obs-nav"><a className="obs-cta" href="/signup">Create account</a><a className="obs-cta gold" href="/login">Member log in <span aria-hidden="true">→</span></a></nav>
    : <div className="obs-hero-cta"><a className="btn primary" href="/signup">Create account</a><a className="btn ghost" href="/login">Member log in</a></div>;
  return variant === "header"
    ? <nav className="obs-nav"><a className="obs-cta gold" href="/tools">Member view <span aria-hidden="true">→</span></a></nav>
    : null;
}
