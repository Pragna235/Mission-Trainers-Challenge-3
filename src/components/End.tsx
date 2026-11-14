import { RULES, starsFor, type GameState } from '../engine/game';
import { SITES } from '../engine/sites';
import radlab from '../data/radlab.json';
import { RealTag, SpeakButton, Stars } from './ui';

function Chart({ game }: { game: GameState }) {
  const W = 520;
  const H = 180;
  const pad = 28;
  const n = RULES.solsTotal;
  const x = (sol: number) => pad + ((sol - 0) / n) * (W - pad * 2);
  const y = (v: number) => H - pad - (v / 100) * (H - pad * 2);
  const site = SITES[game.site];
  const series = [
    { key: 'air', color: '#5ad1ff', label: '🫧 Air', pts: [80, ...game.history.map((h) => h.air[1])] },
    { key: 'health', color: '#ff6b8b', label: '❤️ Health', pts: [100, ...game.history.map((h) => h.health[1])] },
    {
      key: 'battery',
      color: '#7ee787',
      label: '🔋 Battery',
      pts: [game.history[0] ? (game.history[0].batteryBefore / site.batteryMax) * 100 : 50, ...game.history.map((h) => (h.batteryAfter / site.batteryMax) * 100)],
    },
  ];
  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Air, health and battery over the mission">
        {[0, 50, 100].map((v) => (
          <g key={v}>
            <line x1={pad} x2={W - pad} y1={y(v)} y2={y(v)} className="grid" />
            <text x={4} y={y(v) + 4} className="axis">
              {v}
            </text>
          </g>
        ))}
        {game.history
          .filter((h) => h.radiationStorm || h.dustStorm || h.night)
          .map((h) => (
            <text key={h.sol} x={x(h.sol) - 7} y={pad - 8} className="axis">
              {h.radiationStorm ? '☢️' : h.dustStorm ? '🌪️' : '🌑'}
            </text>
          ))}
        {series.map((s) => (
          <polyline key={s.key} fill="none" stroke={s.color} strokeWidth={3} points={s.pts.map((v, i) => `${x(i)},${y(v)}`).join(' ')} />
        ))}
        {Array.from({ length: n + 1 }, (_, i) => (
          <text key={i} x={x(i) - 3} y={H - 8} className="axis">
            {i}
          </text>
        ))}
      </svg>
      <div className="legend">
        {series.map((s) => (
          <span key={s.key} style={{ color: s.color }}>
            ━ {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function lessons(game: GameState): string[] {
  const site = SITES[game.site];
  const out: string[] = [];
  const storms = game.history.filter((h) => h.radiationStorm);
  const unshielded = storms.filter((h) => h.alloc.shield === 0).length;
  const falseAlarms = game.history.filter((h) => h.alloc.shield > 0 && !h.radiationStorm).length;
  const missed = game.messages.filter((m) => m.missed).length;
  const wasted = game.history.reduce((t, h) => t + h.wastedSun, 0);
  const hungry = game.history.filter((h) => h.lines.some((l) => l.icon === '🍽️')).length;
  if (unshielded) out.push(`☢️ ${unshielded} radiation storm(s) hit with the shield OFF. Real mission planners watch the Sun (NASA's DONKI database) so crews can take cover in time.`);
  else if (storms.length) out.push(`🛡️ You shielded the crew from every radiation storm. Great planning!`);
  if (falseAlarms) out.push(`🤔 Your shield was on for ${falseAlarms} quiet ${site.dayWord}(s). Being safe costs power — real planners face this same guessing game, because not every flare sends a storm.`);
  if (missed) out.push(`📵 You missed ${missed} message(s) from Earth with the radio off. On Mars, messages already take minutes to arrive, so missing one hurts!`);
  if (wasted > 0) out.push(`☀️ ${wasted} cell(s) of sunlight were wasted because the batteries were full. Spending spare power on science or a shield would have helped.`);
  if (hungry) out.push(`🍽️ The crew went hungry ${hungry} time(s). Food takes ${RULES.growSols} ${site.dayWord}s to grow, so astronauts must plant early.`);
  if (site.nightStartSol && game.history.some((h) => h.night && h.alloc.life < RULES.lifeCellsNeeded))
    out.push('🌑 The lunar night drained your batteries. Real Moon bases need to store lots of power — or bring other power sources like small nuclear generators.');
  if (!out.length) out.push('🌟 A smooth mission! Try the other outpost, or aim for more science stars.');
  return out;
}

export function EndScreen({ game, onReplay, onOther, onMenu }: { game: GameState; onReplay: () => void; onOther: () => void; onMenu: () => void }) {
  const site = SITES[game.site];
  const stars = starsFor(game);
  const won = game.status === 'won';
  const issDaily = ((radlab.median * 24) / 1000).toFixed(2); // µGy/h → mGy/day
  const ls = lessons(game);
  const headline = won
    ? `Mission complete! Your crew is heading home safe after ${RULES.solsTotal} ${site.dayWord}s.`
    : game.lostReason === 'air'
      ? `Mission control called the crew home early: the air ran too low on ${site.dayWord} ${game.history.length}.`
      : `Mission control called the crew home early: crew health got too low on ${site.dayWord} ${game.history.length}.`;

  return (
    <div className="end-screen">
      <div className={`card end-hero ${won ? 'won' : 'lost'}`}>
        <div className="end-emoji">{won ? '🏆' : '🛟'}</div>
        <h1>{won ? 'Mission success!' : 'Mission ended early'}</h1>
        <p>{headline}</p>
        {!won && <p className="small">Every real astronaut trains by practicing and learning from mistakes. Try a new plan!</p>}
        <div className="end-score">
          🔬 {game.science} science points <Stars n={stars} />
        </div>
        <div className="small muted">Stars: ★ {RULES.stars[0]} · ★★ {RULES.stars[1]} · ★★★ {RULES.stars[2]} points (you must finish the mission)</div>
        <SpeakButton text={`${headline} ${ls.join(' ')}`} />
      </div>

      <div className="end-grid">
        <div className="card">
          <h2>📈 Your mission, day by day</h2>
          <Chart game={game} />
        </div>
        <div className="card">
          <h2>🧠 What you learned</h2>
          <ul className="lessons">
            {ls.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h2>☢️ Radiation check</h2>
          <p>
            Your crew got about <b>{game.totalDoseMsv.toFixed(1)} mSv</b> in {game.history.length} {site.dayWord}s.
          </p>
          <ul className="compare">
            <li>
              🌍 A person on Earth in the same time: about <b>{(0.008 * game.history.length).toFixed(2)} mSv</b>
            </li>
            <li>
              🛰️ Space station detectors measured about <b>{issDaily} mGy a day</b> (typical, inside the US Lab)
            </li>
          </ul>
          <RealTag
            kind="archived"
            label={`ISS dosimetry: ${radlab.readings} daily readings, ${radlab.from} → ${radlab.to} (OSDR RadLab, Timepix detectors)`}
            link="https://visualization.osdr.nasa.gov/radlab/gui/data-api/"
          />
          <p className="small muted">Storm doses in the game are simplified estimates; the everyday surface doses are real measurements.</p>
        </div>
      </div>

      <div className="end-actions">
        <button className="btn btn-primary big" onClick={onReplay}>
          🔁 New mission at {site.name}
        </button>
        <button className="btn btn-ghost big" onClick={onOther}>
          {game.site === 'mars' ? '🌕 Try the Moon' : '🔴 Try Mars'}
        </button>
        <button className="btn btn-ghost big" onClick={onMenu}>
          🏠 Menu
        </button>
      </div>
    </div>
  );
}
