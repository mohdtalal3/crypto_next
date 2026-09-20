"use client";

import { useState } from "react";
import { SyncOverlay } from "@/components/layout/SyncButton";
import type { Tool } from "@/types";

export function TokenForm({ tool }: { tool: Tool }) {
  const [syncing, setSyncing] = useState(false);
  return <><form className="form-stack" method="post" action="/api/token" onSubmit={() => setSyncing(true)}><input type="hidden" name="tool" value={tool}/><textarea name="token" rows={4} placeholder="eyJhbGciOiJIUzI1NiIs..." required autoFocus/><button className="btn primary" type="submit" disabled={syncing}>{syncing ? "Saving & syncing…" : "Save & sync now"}</button></form>{syncing && <SyncOverlay tool={tool}/>}</>;
}
