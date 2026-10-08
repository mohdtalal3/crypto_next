import { observatoryData, type ObservatoryData } from "@/lib/db/observatory";
import { mapPaths, regionPositions } from "@/lib/map";
import { ObservatoryBoard } from "@/components/observatory/ObservatoryBoard";

// Public aggregates rebuild at most once per minute; every other visitor is
// served from the CDN cache regardless of traffic.
export const revalidate = 60;

function emptyData(): ObservatoryData {
  return { members: 0, deltas: { "24H": 0, "7D": 0, "30D": 0 }, history: [], windows: { "24H": [], "7D": [], "30D": [] }, points: {} };
}

export default async function Observatory() {
  const [data, map, positions] = await Promise.all([
    observatoryData().catch(() => emptyData()),
    Promise.resolve(mapPaths()),
    Promise.resolve(regionPositions()),
  ]);
  return <div className="observatory">
    <header className="obs-topbar">
      <div className="obs-brand"><img className="obs-logo" src="/logo.png" alt="D.A.R.A."/><div className="obs-wordmark"><strong>D.A.R.A.</strong><span>C A P T U R E &nbsp;·&nbsp; C L A I M &nbsp;·&nbsp; C R E D I T</span></div></div>
      <a className="obs-member" href="/login">MEMBER VIEW <span aria-hidden="true">→</span></a>
    </header>

    <section className="obs-hero">
      <div className="obs-hero-intro">
        <p className="obs-eyebrow"><span className="obs-pulse" aria-hidden="true"/> THE OBSERVATORY <span className="obs-eyebrow-sep">/</span> GLOBAL ONBOARDING</p>
        <h1>The world is finding<br/>its way back.</h1>
        <p className="obs-sub">A live view of members reconnecting with their history. Each new arrival adds another point to the picture.</p>
      </div>
      <div className="obs-tier"><small>Membership dashboard</small><strong>The Observatory</strong></div>
    </section>

    <ObservatoryBoard data={data} map={map} positions={positions}/>

    <footer className="obs-foot">
      <a href="/login">Member log in</a> · <a href="/signup">Create account</a>
    </footer>
  </div>;
}
