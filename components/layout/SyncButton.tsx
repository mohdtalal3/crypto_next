"use client";
import { useState } from "react";
import type { Tool } from "@/types";

export function SyncButton({ tool }: { tool: Tool }) { const [syncing, setSyncing] = useState(false); return <><form action="/api/sync" method="post" onSubmit={() => setSyncing(true)}><input type="hidden" name="tool" value={tool}/><button className="btn ghost" type="submit">⟳ Sync now</button></form><div className={syncing ? "sync-overlay on" : "sync-overlay"}><div><div className="spin"/><h2>Syncing your account…</h2><p>A complete Neo Bank scan can take 3–5 minutes.<br/>Please don’t close this tab.</p></div></div></>; }
