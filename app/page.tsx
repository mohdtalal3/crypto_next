import { observatoryData, type ObservatoryData } from "@/lib/db/observatory";
import { WorldMap } from "@/components/observatory/WorldMap";

// Public aggregates rebuild at most once per minute; every other visitor is
// served from the CDN cache regardless of traffic.
export const revalidate = 60;

const SPARK_W = 300;
const SPARK_H = 64;

function sparkline(history: number[]) {
  if (history.length < 2) return "";
  const max = Math.max(1, ...history);
  return history.map((value, index) => {
    const x = (index / (history.length - 1)) * SPARK_W;
    const y = SPARK_H - (value / max) * (SPARK_H - 6) - 3;
    return `${index ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
}

function emptyData(): ObservatoryData {
  return { members: 0, newMembers7d: 0, history: [], windows: { "24H": [], "7D": [], "100D": [] }, points: {} };
}

export default async function Observatory() {
  const data = await observatoryData().catch(() => emptyData());
  const regionMax = Math.max(1, ...(data.windows["7D"] ?? []).map((entry) => entry.count));
  return <div className="observatory">
    <header className="obs-topbar">
      <div className="obs-brand"><img className="obs-logo" src="/logo.png" alt="D.A.R.A."/><div className="obs-wordmark"><strong>D.A.R.A.</strong><span>C A P T U R E &nbsp;·&nbsp; C L A I M &nbsp;·&nbsp; C R E D I T</span></div></div>
      <nav className="obs-nav"><a href="#overview">Overview</a><a href="#recovery">Recovery Program</a><a href="#lineage">My Lineage</a><a href="#updates">Updates</a></nav>
      <a className="obs-member" href="/login">MEMBER VIEW <span aria-hidden="true">→</span></a>
    </header>

    <section className="obs-hero" id="overview">
      <p className="obs-eyebrow"><span className="obs-pulse" aria-hidden="true"/> THE OBSERVATORY <span className="obs-eyebrow-sep">/</span> GLOBAL ONBOARDING</p>
      <h1>The world is finding<br/>its way back.</h1>
      <p className="obs-sub">A live view of members reconnecting with their history. Each new arrival adds another point to the picture.</p>
    </section>

    <section className="obs-grid">
      <div className="card obs-panel obs-map-panel">
        <WorldMap windows={data.windows} points={data.points}/>
      </div>
      <div className="obs-side">
        <div className="card obs-panel">
          <p className="obs-label">Members onboarded</p>
          <p className="obs-counter">{data.members.toLocaleString("en-US")}</p>
          <p className="obs-delta">+{data.newMembers7d.toLocaleString("en-US")} in the past 7 days</p>
          <svg className="obs-spark" viewBox={`0 0 ${SPARK_W} ${SPARK_H}`} preserveAspectRatio="none" role="img" aria-label="Members onboarded over the past 30 days">
            <path d={sparkline(data.history)} className="obs-spark-line"/>
          </svg>
        </div>
        <div className="card obs-panel">
          <div className="obs-region-head"><p className="obs-label">Onboarding by region</p><span className="obs-label">Last 7 days</span></div>
          {data.windows["7D"].length
            ? <ul className="obs-regions">{data.windows["7D"].map((entry) => <li key={entry.region}><span className="obs-region-name">{entry.region}</span><span className="obs-region-count-num">{entry.count.toLocaleString("en-US")}</span><i style={{ width: `${Math.max(4, (entry.count / regionMax) * 100)}%` }} aria-hidden="true"/></li>)}</ul>
            : <p className="obs-empty">No onboarding activity in the past 7 days yet.</p>}
        </div>
      </div>
    </section>

    <footer className="obs-foot" id="updates">
      <a href="/login">Member log in</a> · <a href="/signup">Create account</a>
    </footer>
  </div>;
}
