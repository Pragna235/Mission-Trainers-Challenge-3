import { useEffect, useState } from 'react';
import { SITES, type SiteId } from '../engine/sites';
import { archivedSun, fetchLiveSun, type SunReport } from '../data/liveSun';
import { RealTag } from './ui';

const MOOD_TEXT = {
  calm: { icon: '😌☀️', title: 'The Sun is CALM', text: 'Few big flares lately. Radiation storms are less likely.' },
  active: { icon: '🙂☀️', title: 'The Sun is ACTIVE', text: 'Some strong flares lately. Radiation storms might happen.' },
  stormy: { icon: '😠☀️', title: 'The Sun is STORMY', text: 'Very big flares or radiation storms lately. Get your shields ready!' },
};

export function useSun() {
  const [sun, setSun] = useState<SunReport | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let alive = true;
    fetchLiveSun()
      .then((r) => alive && setSun(r))
      .catch(() => {
        if (!alive) return;
        setError(true);
        setSun(archivedSun());
      });
    return () => {
      alive = false;
    };
  }, []);
  return { sun, error };
}

export function SunPanel({ sun, error }: { sun: SunReport | null; error: boolean }) {
  if (!sun)
    return (
      <div className="card sun-panel loading">
        <div className="spinner" /> Asking NASA how the Sun is doing today…
      </div>
    );
  const m = MOOD_TEXT[sun.mood];
  return (
    <div className={`card sun-panel mood-${sun.mood}`}>
      <div className="sun-head">
        <span className="sun-icon">{m.icon}</span>
        <div>
          <h3>{sun.live ? "Today's real Sun" : 'A real week on the Sun'}</h3>
          <div className="sun-title">{m.title}</div>
        </div>
      </div>
      <p>{m.text}</p>
      <ul className="sun-stats">
        <li>
          Strong flares in the last {sun.windowDays} days: <b>{sun.flareCount}</b>
          {sun.strongestFlare && (
            <>
              {' '}
              (biggest: <b>{sun.strongestFlare.classType}</b>)
            </>
          )}
        </li>
        <li>
          Solar particle (radiation) events: <b>{sun.sepCount}</b>
        </li>
      </ul>
      <RealTag
        kind={sun.live ? 'live' : 'archived'}
        label={`${sun.note} · checked ${new Date(sun.checkedAt).toLocaleString()}`}
        link="https://ccmc.gsfc.nasa.gov/tools/DONKI/"
      />
      {error && <p className="small muted">Couldn’t reach NASA right now, so we are using a real archived week instead.</p>}
      <p className="small">Your mission’s chance of radiation storms is set by this Sun mood.</p>
    </div>
  );
}

export function TitleScreen({
  sun,
  sunError,
  onStart,
  onScience,
}: {
  sun: SunReport | null;
  sunError: boolean;
  onStart: (site: SiteId) => void;
  onScience: () => void;
}) {
  return (
    <div className="title-screen">
      <header className="hero">
        <div className="hero-rocket" aria-hidden>
          🚀
        </div>
        <h1>Junior Astronaut Mission Trainer</h1>
        <p className="tagline">
          You are the commander of a space outpost. You have only so much power. <b>Every choice has a cost.</b> Can you keep your crew safe for 12 days
          and do great science?
        </p>
      </header>

      <div className="title-grid">
        <section>
          <h2>1. Pick your outpost</h2>
          <div className="site-cards">
            {(Object.keys(SITES) as SiteId[]).map((id) => {
              const s = SITES[id];
              return (
                <button key={id} className={`site-card site-${id}`} onClick={() => onStart(id)}>
                  <div className="site-emoji">{s.emoji}</div>
                  <h3>{s.name}</h3>
                  <div className="site-place">{s.place}</div>
                  <p>{s.intro}</p>
                  <ul>
                    <li>☀️ Sunny-day power: {s.baseSolar} cells</li>
                    <li>🔋 Battery holds: {s.batteryMax} cells</li>
                    <li>📡 Message delay: {s.commsDelaySols ? `${s.commsDelaySols} ${s.dayWord}` : 'almost none'}</li>
                    <li>{s.dustStorms ? '🌪️ Dust storms!' : '🌑 Long lunar night!'}</li>
                  </ul>
                  <span className="btn btn-primary">Launch to {id === 'mars' ? 'Mars' : 'the Moon'} ▶</span>
                </button>
              );
            })}
          </div>
        </section>
        <aside>
          <h2>2. Check the Sun</h2>
          <SunPanel sun={sun} error={sunError} />
          <button className="btn btn-ghost wide" onClick={onScience}>
            🔭 The real NASA science behind this game
          </button>
        </aside>
      </div>
    </div>
  );
}
