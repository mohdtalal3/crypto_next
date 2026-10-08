"use client";

import { useState } from "react";
import { WorldMap } from "@/components/observatory/WorldMap";
import type { ObservatoryData, WindowKey } from "@/lib/db/observatory";

export interface MapPaths { land: string; graticule: string }

const SPARK_W = 300;
const SPARK_H = 64;

const LABELS: Record<WindowKey, { delta: string; head: string }> = {
  "24H": { delta: "in the past 24 hours", head: "Last 24 hours" },
  "7D": { delta: "in the past 7 days", head: "Last 7 days" },
  "30D": { delta: "in the past 30 days", head: "Last 30 days" },
};

function sparkline(history: number[]) {
  if (history.length < 2) return "";
  const max = Math.max(1, ...history);
  return history.map((value, index) => {
    const x = (index / (history.length - 1)) * SPARK_W;
    const y = SPARK_H - (value / max) * (SPARK_H - 6) - 3;
    return `${index ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
}

export function ObservatoryBoard({ data, map, positions }: { data: ObservatoryData; map: MapPaths; positions: Record<string, { x: number; y: number }> }) {
  const [active, setActive] = useState<WindowKey>("7D");
  const shown = data.windows[active] ?? [];
  const delta = data.deltas[active] ?? 0;
  const regionMax = Math.max(1, ...shown.map((entry) => entry.count));

  return <section className="obs-grid">
    <div className="card obs-panel obs-map-panel">
      <WorldMap land={map.land} graticule={map.graticule} positions={positions} shown={shown} points={data.points} active={active} onWindow={setActive}/>
    </div>
    <div className="obs-side">
      <div className="card obs-panel">
        <p className="obs-label">Members onboarded</p>
        <p className="obs-counter">{data.members.toLocaleString("en-US")}</p>
        <p className="obs-delta">+{delta.toLocaleString("en-US")} {LABELS[active].delta}</p>
        <svg className="obs-spark" viewBox={`0 0 ${SPARK_W} ${SPARK_H}`} preserveAspectRatio="none" role="img" aria-label="Members onboarded over the past 30 days">
          <path d={sparkline(data.history)} className="obs-spark-line"/>
        </svg>
      </div>
      <div className="card obs-panel">
        <div className="obs-region-head"><p className="obs-label">Onboarding by region</p><span className="obs-label">{LABELS[active].head}</span></div>
        {shown.length
          ? <ul className="obs-regions">{shown.map((entry) => <li key={entry.region}><span className="obs-region-name">{entry.region}</span><span className="obs-region-count-num">{entry.count.toLocaleString("en-US")}</span><i style={{ width: `${Math.max(4, (entry.count / regionMax) * 100)}%` }} aria-hidden="true"/></li>)}</ul>
          : <p className="obs-empty">No onboarding activity in this window yet.</p>}
      </div>
    </div>
  </section>;
}
