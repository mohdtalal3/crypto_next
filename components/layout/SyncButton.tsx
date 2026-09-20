"use client";
import type { Tool } from "@/types";

export function SyncOverlay({ tool }: { tool: Tool }) {
  const name = tool === "orbit" ? "OrbitOne" : "Aurum";
  return <div className="sync-overlay on" role="status" aria-live="assertive" aria-busy="true"><div className="sync-overlay-card"><div className="spin"/><h2>Syncing your {name} account…</h2><p>This can take <strong>3–5 minutes</strong>.<br/>Please don&apos;t close or refresh this tab.</p><span>Your data is being fetched and saved securely.</span></div></div>;
}

export function SyncButton({ tool }: { tool: Tool }) {
  return <a className="btn ghost" href={`/token?tool=${tool}`}>⟳ Sync now</a>;
}
