"use client";

import type { RegionCount, WindowKey } from "@/lib/db/observatory";

const WINDOWS: WindowKey[] = ["24H", "7D", "30D"];

export function WorldMap({ land, graticule, positions, shown, points, active, onWindow }: {
  land: string;
  graticule: string;
  positions: Record<string, { x: number; y: number }>;
  shown: RegionCount[];
  points: Record<string, { lon: number; lat: number; labelDy: number; count: number }>;
  active: WindowKey;
  onWindow: (key: WindowKey) => void;
}) {
  const max = Math.max(1, ...shown.map((entry) => entry.count));
  const hub = shown.find((entry) => entry.region === "Europe") ?? shown[0];

  return (
    <div className="obs-map">
      <div className="obs-map-head">
        <div><h2>Members around the world</h2><p>Onboarding activity by region</p></div>
        <div className="obs-window" role="tablist" aria-label="Activity window">
          {WINDOWS.map((key) => <button key={key} type="button" className={key === active ? "on" : ""} onClick={() => onWindow(key)}>{key}</button>)}
        </div>
      </div>
      <svg className="obs-world" viewBox="0 0 900 430" role="img" aria-label="World map of onboarding activity by region">
        <defs>
          <filter id="obs-glow" x="-300%" y="-300%" width="600%" height="600%">
            <feGaussianBlur stdDeviation="7" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <path className="obs-graticule" d={graticule}/>
        <path className="obs-land" d={land}/>
        {hub && shown.filter((entry) => entry !== hub && positions[entry.region] && positions[hub.region]).map((entry) => {
          const from = positions[hub.region];
          const to = positions[entry.region];
          const midX = (from.x + to.x) / 2;
          const midY = Math.min(from.y, to.y) - Math.max(24, Math.abs(to.x - from.x) * 0.2);
          return <path key={`route-${entry.region}`} className="obs-route" d={`M${from.x} ${from.y}Q${midX} ${midY} ${to.x} ${to.y}`}/>;
        })}
        {shown.map((entry) => {
          const position = positions[entry.region];
          const point = points[entry.region];
          if (!position || !point || (!position.x && !position.y)) return null;
          const weight = entry.count / max;
          return (
            <g key={entry.region}>
              <circle className="obs-heat-soft" cx={position.x} cy={position.y} r={20 + weight * 16}/>
              <circle className="obs-heat" cx={position.x} cy={position.y} r={3.2 + weight * 1.6}/>
              <circle className="obs-pin" cx={position.x} cy={position.y} r={4}/>
              <text className="obs-region-label" x={position.x} y={position.y + point.labelDy} textAnchor="middle">{entry.region.toUpperCase()}</text>
            </g>
          );
        })}
      </svg>
      <div className="obs-map-foot"><span>◌ &nbsp;Member activity · aggregated</span><span>Illustrative map view</span></div>
    </div>
  );
}
