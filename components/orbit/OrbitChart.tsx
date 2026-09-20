"use client";

import { useMemo, useState } from "react";

export interface Point { date: string; value: string }

function niceMaximum(value: number) {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / (magnitude / 2)) * (magnitude / 2);
}

function formatAxis(value: number) {
  return `${value >= 5 ? Math.round(value) : value.toFixed(2).replace(/\.?0+$/, "")}%`;
}

function formatDate(date: string, range: "day" | "month") {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en", { month: "short", day: range === "day" ? "numeric" : undefined, timeZone: "UTC" });
}

function formatLongDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export function OrbitChart({ series }: { series: { day: Point[]; month: Point[] } }) {
  const [range, setRange] = useState<"day" | "month">("month");
  const [page, setPage] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);
  const pageSize = range === "day" ? 7 : 12;
  const total = Math.max(1, Math.ceil(series[range].length / pageSize));
  const current = Math.min(page, total - 1);
  const items = useMemo(() => series[range].slice(current * pageSize, current * pageSize + pageSize), [series, range, current, pageSize]);
  const maximum = niceMaximum(Math.max(0, ...items.map((point) => Number(point.value) || 0)));
  const ticks = [4, 3, 2, 1, 0].map((step) => maximum * step / 4);

  function choose(next: "day" | "month") {
    setRange(next);
    setPage(Math.max(0, Math.ceil(series[next].length / (next === "day" ? 7 : 12)) - 1));
    setHovered(null);
  }

  return <section className="card chart-card">
    <div className="topbar"><h3>Ex-AI Bot Historical Performance</h3><div className="chart-tabs"><button className={range === "day" ? "active" : ""} onClick={() => choose("day")}>Day</button><button className={range === "month" ? "active" : ""} onClick={() => choose("month")}>Month</button></div></div>
    {!items.length ? <p className="empty">No data for this range.</p> : <div className="chart" role="img" aria-label={`EX-AI Bot ${range} performance chart`}>
      <div className="chart-y-axis" aria-hidden="true">{ticks.map((tick) => <span key={tick}>{formatAxis(tick)}</span>)}</div>
      <div className="chart-plot"><div className="chart-grid">{ticks.map((tick, index) => <span className="chart-gridline" style={{ top: `${index * 25}%` }} key={tick}/>)}</div><div className="chart-bars">{items.map((point) => {
        const height = Math.max(1.5, Math.min(100, (Number(point.value) || 0) / maximum * 100));
        const key = `${range}-${point.date}`;
        const visible = hovered === key;
        return <div className="chart-col" key={key}><div className="chart-bar-space"><button className="chart-bar" style={{ height: `${height}%` }} aria-label={`${formatLongDate(point.date)}: ${point.value}%`} onMouseEnter={() => setHovered(key)} onMouseLeave={() => setHovered(null)} onFocus={() => setHovered(key)} onBlur={() => setHovered(null)}>{visible && <span className="chart-tooltip"><strong>{point.value}%</strong><span>{formatLongDate(point.date)}</span></span>}</button></div><span className="chart-label">{formatDate(point.date, range)}</span></div>;
      })}</div></div>
    </div>}
    {total > 1 && <div className="chart-pager"><button className="btn ghost" disabled={current === 0} onClick={() => { setPage(current - 1); setHovered(null); }}>‹</button><span>{current + 1} / {total}</span><button className="btn ghost" disabled={current === total - 1} onClick={() => { setPage(current + 1); setHovered(null); }}>›</button></div>}
  </section>;
}
