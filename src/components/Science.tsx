import donki from '../data/donki.json';
import radlab from '../data/radlab.json';
import osdr from '../data/osdr.json';
import { ALL_FACTS } from '../data/facts';
import { SITES } from '../engine/sites';
import { RULES } from '../engine/game';

export function SciencePage({ onBack }: { onBack: () => void }) {
  const fetched = (iso: string) => new Date(iso).toLocaleDateString();
  return (
    <div className="science-page">
      <button className="btn btn-ghost" onClick={onBack}>
        ⟵ Back
      </button>
      <h1>🔭 The real science behind the game</h1>
      <p className="lead">
        This game uses <b>real NASA open data</b>. Here is exactly what we used, where it came from, and what we made simpler so it fits in a game.
      </p>

      <div className="sources">
        <div className="card source">
          <h2>☀️ Space Weather Database (DONKI)</h2>
          <p>
            Real solar flares and solar particle (radiation) events. Every flare and radiation storm in your mission is matched to a real event, with its date and a
            link.
          </p>
          <ul>
            <li>
              <b>{donki.flares.length}</b> strong flares (class M5 and above) and <b>{donki.solarParticleEvents.length}</b> solar particle events, {donki.range.start} →{' '}
              {donki.range.end}
            </li>
            <li>
              Downloaded {fetched(donki.fetchedAt)} and stored in the game (<span className="badge badge-archived">ARCHIVED</span>)
            </li>
            <li>
              “Today’s real Sun” on the start screen is fetched <span className="badge badge-live">LIVE</span> from DONKI in your browser. If that fails, the game says so and
              uses an archived week instead.
            </li>
          </ul>
          <a href="https://ccmc.gsfc.nasa.gov/tools/DONKI/" target="_blank" rel="noreferrer">
            ccmc.gsfc.nasa.gov/tools/DONKI ↗
          </a>
        </div>

        <div className="card source">
          <h2>🛰️ RadLab (OSDR radiation dosimetry)</h2>
          <p>Real radiation measurements from detectors on the International Space Station, shown on the results screen for comparison.</p>
          <ul>
            <li>
              {radlab.readings} daily-average absorbed dose rates from {radlab.instrumentFamily} detectors in the ISS {radlab.module}, {radlab.from} → {radlab.to}
            </li>
            <li>
              Median {radlab.median} µGy/h (≈ {((radlab.median * 24) / 1000).toFixed(2)} mGy per day); range {radlab.min}–{radlab.max} µGy/h
            </li>
          </ul>
          <a href="https://visualization.osdr.nasa.gov/radlab/gui/data-api/" target="_blank" rel="noreferrer">
            RadLab data API ↗
          </a>
        </div>

        <div className="card source">
          <h2>🧬 Open Science Data Repository (OSDR)</h2>
          <p>Real NASA studies of how spaceflight affects living things. They appear as “Real space science” cards after each day.</p>
          <ul>
            {ALL_FACTS.map((f) => (
              <li key={f.accession}>
                <a href={f.url} target="_blank" rel="noreferrer">
                  {f.accession}
                </a>
                : {f.studyTitle ?? '—'}
              </li>
            ))}
          </ul>
          <p className="small muted">Searched {fetched(osdr.fetchedAt)} with the OSDR search API.</p>
        </div>

        <div className="card source">
          <h2>📏 Real measurements used for the outposts</h2>
          <ul>
            {Object.values(SITES).map((s) => (
              <li key={s.id}>
                <b>{s.name}:</b> everyday surface dose {s.baseDoseMsv} mSv/day — {s.baseDoseSource}. {s.commsDelayReal}
              </li>
            ))}
            <li>Earth: about 3 mSv per year (≈ 0.008 mSv/day) of natural background radiation.</li>
          </ul>
          <p>
            Explore the real sites: <a href="https://trek.nasa.gov/mars/" target="_blank" rel="noreferrer">Mars Trek ↗</a> ·{' '}
            <a href="https://trek.nasa.gov/moon/" target="_blank" rel="noreferrer">Moon Trek ↗</a> · Food in space:{' '}
            <a href="https://www.asc-csa.gc.ca/eng/youth-educators/toolkits/food-production/" target="_blank" rel="noreferrer">
              CSA food production toolkit ↗
            </a>
          </p>
        </div>

        <div className="card source simplify">
          <h2>🎮 What we made simpler (game rules)</h2>
          <ul>
            <li>Power is counted in whole “cells”. One cell keeps one astronaut breathing for one day ({RULES.lifeCellsNeeded} astronauts → {RULES.lifeCellsNeeded} cells).</li>
            <li>
              Communication delay is minutes in real life; in the game a Mars message arrives one {SITES.mars.dayWord} late so you can <i>feel</i> the delay.
            </li>
            <li>A real lunar night lasts about 14 Earth days. The game squeezes it into the last 3 days.</li>
            <li>
              Not every flare sends a radiation storm — that is true! The chance in the game comes from how active the Sun is (calm {RULES.stormChance.calm * 100}%, active{' '}
              {RULES.stormChance.active * 100}%, stormy {RULES.stormChance.stormy * 100}%) and is a simplified estimate.
            </li>
            <li>Crew health points, storm doses and crop growth times are game estimates, not real medical numbers.</li>
          </ul>
        </div>
      </div>
      <p className="small muted disclaimer">
        Built for the 2026 NASA Space Apps Challenge. NASA does not endorse this project. Data courtesy of NASA (DONKI / CCMC, OSDR, RadLab, Trek) and the Canadian Space
        Agency.
      </p>
    </div>
  );
}
