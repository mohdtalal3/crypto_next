"use client";

import { useState } from "react";
import type { RegionCount, WindowKey } from "@/lib/db/observatory";

/* Coarse illustrative land mask: 64 columns (lon -180..180) x 30 rows (lat 78N..-62S),
   each row a list of inclusive column ranges that are land. */
const COLS = 64;
const ROWS = 30;
const LAND: Array<Array<[number, number]>> = [
  [[23, 28], [36, 36], [47, 49]],
  [[10, 20], [23, 28], [35, 36], [38, 56]],
  [[3, 7], [9, 21], [23, 28], [33, 37], [37, 58]],
  [[2, 7], [9, 21], [24, 27], [28, 28], [33, 37], [37, 59]],
  [[1, 5], [9, 21], [33, 36], [36, 59], [59, 60]],
  [[10, 20], [29, 31], [32, 38], [38, 59]],
  [[10, 19], [29, 31], [32, 38], [39, 54]],
  [[10, 19], [29, 30], [32, 35], [36, 39], [40, 53], [56, 57]],
  [[10, 19], [30, 35], [37, 41], [42, 53], [56, 56]],
  [[11, 18], [29, 38], [38, 41], [44, 52]],
  [[12, 16], [29, 39], [39, 41], [44, 52]],
  [[13, 16], [29, 39], [39, 40], [44, 46], [48, 52]],
  [[15, 18], [29, 40], [44, 46], [49, 53]],
  [[17, 18], [29, 40], [45, 45], [50, 53]],
  [[18, 22], [29, 40], [50, 53]],
  [[18, 24], [30, 40], [50, 56]],
  [[18, 25], [30, 40], [51, 57]],
  [[18, 25], [31, 39], [52, 57]],
  [[18, 25], [31, 39], [52, 56]],
  [[18, 24], [31, 39], [52, 58]],
  [[18, 23], [31, 38], [52, 59]],
  [[18, 22], [32, 37], [52, 59]],
  [[18, 21], [33, 36], [53, 58]],
  [[18, 21], [56, 56], [61, 62]],
  [[18, 20], [61, 62]],
  [[18, 19]],
  [[18, 18]],
  [],
  [],
  [],
];

const WIDTH = COLS * 10;
const HEIGHT = ROWS * 10;
const project = (lon: number, lat: number) => ({ x: ((lon + 180) / 360) * WIDTH, y: ((78 - lat) / 140) * HEIGHT });

const WINDOWS: WindowKey[] = ["24H", "7D", "100D"];

export function WorldMap({ windows, points }: { windows: Record<WindowKey, RegionCount[]>; points: Record<string, { lon: number; lat: number; count: number }> }) {
  const [active, setActive] = useState<WindowKey>("7D");
  const shown = windows[active] ?? [];
  const max = Math.max(1, ...shown.map((entry) => entry.count));

  return (
    <div className="obs-map">
      <div className="obs-map-head">
        <div><h2>Members around the world</h2><p>Onboarding activity by region</p></div>
        <div className="obs-window" role="tablist" aria-label="Activity window">
          {WINDOWS.map((key) => <button key={key} type="button" className={key === active ? "on" : ""} onClick={() => setActive(key)}>{key}</button>)}
        </div>
      </div>
      <svg className="obs-world" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Illustrative world map of onboarding activity">
        {LAND.flatMap((ranges, row) => ranges.map(([from, to]) => {
          const cells = [];
          for (let col = from; col <= to; col += 1) {
            cells.push(<circle key={`${row}-${col}`} cx={col * 10 + 5} cy={row * 10 + 5} r={2.1} className="obs-land"/>);
          }
          return cells;
        }))}
        {shown.map((entry, index) => {
          const point = points[entry.region];
          if (!point) return null;
          const { x, y } = project(point.lon, point.lat);
          const scale = 0.6 + (entry.count / max) * 0.9;
          return (
            <g key={entry.region} className="obs-glow" transform={`translate(${x} ${y}) scale(${scale})`}>
              {index > 0 && (() => {
                const previous = points[(shown[index - 1] as RegionCount).region];
                if (!previous) return null;
                const from = project(previous.lon, previous.lat);
                return <line x1={from.x - x} y1={from.y - y} x2={0} y2={0} className="obs-link"/>;
              })()}
              <circle r={26} className="obs-halo"/>
              <circle r={9} className="obs-core"/>
              <text y={-20} textAnchor="middle" className="obs-region-label">{entry.region.toUpperCase()}</text>
              <text y={34} textAnchor="middle" className="obs-region-count">{entry.count}</text>
            </g>
          );
        })}
      </svg>
      <div className="obs-map-foot"><span>· Member activity · aggregated</span><span>Illustrative map view</span></div>
    </div>
  );
}
