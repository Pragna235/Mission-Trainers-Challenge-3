import { useMemo, useState } from 'react';
import {
  RULES,
  availableCells,
  inbox,
  playSol,
  solarCells,
  totalAlloc,
  type Allocation,
  type GameState,
  type SystemId,
} from '../engine/game';
import { SITES } from '../engine/sites';
import { factFor } from '../data/facts';
import { Meter, RealTag, SpeakButton, Stars, Term } from './ui';
import { OutpostSchematic } from './OutpostSchematic';
import { CustomizePowerCells } from './CustomizePowerCells';
import { CapcomAndPlans } from './CapcomAndPlans';
import { CriticalFailureModal } from './CriticalFailureModal';
import { ScienceTraceabilityModal } from './ScienceTraceabilityModal';
import { JargonDecoderModal } from './JargonDecoderModal';

const SYSTEMS: { id: SystemId; icon: string; name: string; help: string }[] = [
  { id: 'life', icon: '🫧', name: 'Life Support', help: `Makes air to breathe. Needs ${RULES.lifeCellsNeeded} cells (1 per astronaut) to keep the air steady.` },
  { id: 'greenhouse', icon: '🌱', name: 'Greenhouse', help: `Grows food — ready in ${RULES.growSols} days. 2 or more cells also make a little oxygen.` },
  { id: 'shield', icon: '🛡️', name: 'Radiation Shield', help: 'Blocks radiation storms. More cells = more protection. Does nothing on quiet days.' },
  { id: 'science', icon: '🔬', name: 'Science & Radio', help: 'Earns science points. 1 or more cells keeps the radio on so you can hear Earth.' },
];

const EMPTY: Allocation = { life: 0, greenhouse: 0, shield: 0, science: 0 };

export function HowToPlay({ game, onClose }: { game: GameState; onClose: () => void }) {
  const site = SITES[game.site];
  const text = `Welcome, Commander! Each ${site.dayWord}, the Sun gives you power cells. Split them between life support, the greenhouse, the radiation shield, and science. Spare cells charge your batteries. Keep the air and crew health up for ${RULES.solsTotal} ${site.dayWord}s and earn science points. Listen to messages from Earth, but remember: they take time to arrive!`;
  return (
    <div className="overlay" role="dialog" aria-modal="true">
      <div className="card modal howto">
        <div className="modal-head">
          <h2>👩‍🚀 Commander briefing</h2>
          <SpeakButton text={text} />
        </div>
        <ol className="howto-steps">
          <li>
            ☀️ Each <Term word={site.dayWord}>{site.facts[0]}</Term> the Sun gives you <b>power cells</b>. Spare cells charge your 🔋 batteries.
          </li>
          <li>⚡ Split your cells between 4 jobs. You never have enough for everything!</li>
          <li>
            🫧 Keep the <b>air</b> and ❤️ <b>crew health</b> up for {RULES.solsTotal} {site.dayWord}s. Make sure there is 🥔 food.
          </li>
          <li>
            📡 Messages from Earth warn you about danger — but they take <b>time</b> to arrive. {site.commsDelayReal}
          </li>
          <li>🔬 Earn science points to get stars. More science = more risk!</li>
        </ol>
        <div className="system-legend">
          {SYSTEMS.map((s) => (
            <div key={s.id}>
              <b>
                {s.icon} {s.name}
              </b>
              <div className="small">{s.help}</div>
            </div>
          ))}
        </div>
        <button className="btn btn-primary wide" onClick={onClose}>
          I’m ready, start {site.dayWord} 1! 🚀
        </button>
      </div>
    </div>
  );
}

function Debrief({ game, onNext }: { game: GameState; onNext: () => void }) {
  const r = game.history[game.history.length - 1];
  const site = SITES[game.site];
  const fact = factFor(r.factTopic);
  const d = (a: [number, number]) => a[1] - a[0];
  const sign = (n: number) => (n > 0 ? `+${n}` : `${n}`);
  const readText = `${site.dayWord} ${r.sol} report. ${r.lines.map((l) => l.text).join(' ')} Fun fact: ${fact.kidText}`;
  return (
    <div className="overlay" role="dialog" aria-modal="true">
      <div className="card modal debrief">
        <div className="modal-head">
          <h2>
            📋 {site.dayWord[0].toUpperCase() + site.dayWord.slice(1)} {r.sol} report
          </h2>
          <SpeakButton text={readText} />
        </div>
        <div className="deltas">
          <span className={d(r.air) >= 0 ? 'up' : 'down'}>🫧 Air {sign(d(r.air))}</span>
          <span className={d(r.health) >= 0 ? 'up' : 'down'}>❤️ Health {sign(d(r.health))}</span>
          <span className={d(r.food) >= 0 ? 'up' : 'down'}>🥔 Meals {sign(d(r.food))}</span>
          <span className={r.batteryAfter - r.batteryBefore >= 0 ? 'up' : 'down'}>🔋 Battery {sign(r.batteryAfter - r.batteryBefore)}</span>
          <span className="up">🔬 +{r.scienceGained}</span>
          <span className="neutral">☢️ {r.doseMsv} mSv</span>
        </div>
        <h3>What happened and why</h3>
        <ul className="why-list">
          {r.lines.map((l, i) => (
            <li key={i} className={l.good ? 'good' : 'bad'}>
              <span>{l.icon}</span> {l.text}
            </li>
          ))}
        </ul>
        {(r.radiationStorm || r.lines.some((l) => l.icon === '😮‍💨')) &&
          game.plan
            .filter((e) => e.kind === 'radiationStorm' && e.sol === r.sol && e.real)
            .map((e, i) => <RealTag key={i} kind="archived" label={`This storm is based on a ${e.real!.label}`} link={e.real!.link} />)}
        <div className="fact-card">
          <div className="fact-icon">{fact.icon}</div>
          <div>
            <b>Real space science:</b> {fact.kidText}
            <div className="study">
              🔬 <b>Real NASA study ({fact.accession}):</b> {fact.studyHint}
            </div>
            <RealTag kind="archived" label={fact.studyTitle ?? fact.accession} link={fact.url} />
          </div>
        </div>
        <button className="btn btn-primary wide" onClick={onNext} autoFocus>
          {game.status === 'playing' ? `On to ${site.dayWord} ${game.sol} ▶` : 'See mission results ▶'}
        </button>
      </div>
    </div>
  );
}

export function PlayScreen({ game, setGame, onEnd, onQuit }: { game: GameState; setGame: (g: GameState) => void; onEnd: () => void; onQuit: () => void }) {
  const site = SITES[game.site];
  const [alloc, setAlloc] = useState<Allocation>({ life: 3, greenhouse: 2, shield: 0, science: 1 });
  const [showHowTo, setShowHowTo] = useState(game.sol === 1 && game.history.length === 0);
  const [showDebrief, setShowDebrief] = useState(false);
  const [showTraceModal, setShowTraceModal] = useState(false);
  const [showJargonModal, setShowJargonModal] = useState(false);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);

  const solar = solarCells(game);
  const avail = availableCells(game);
  const used = totalAlloc(alloc);
  const left = avail - used;
  const fromBattery = Math.max(0, used - solar);
  const toBattery = Math.max(0, Math.min(solar - used, site.batteryMax - game.battery));
  const msgs = inbox(game);
  const newMsgs = msgs.filter((m) => m.arriveSol === game.sol);

  const preview = useMemo(() => {
    let air = game.air + (alloc.life - RULES.lifeCellsNeeded) * RULES.airPerCell + (alloc.greenhouse >= 2 ? RULES.greenhouseAirBonus : 0);
    air = Math.max(0, Math.min(100, air));
    const block = RULES.shieldBlock[Math.min(alloc.shield, RULES.shieldBlock.length - 1)];
    const battery = game.battery - fromBattery + toBattery;
    return { air, block, battery };
  }, [alloc, game, fromBattery, toBattery]);

  const change = (id: SystemId, delta: number) => {
    setActivePlanId(null);
    setAlloc((a) => {
      const next = { ...a, [id]: Math.max(0, Math.min(RULES.maxPerSystem, a[id] + delta)) };
      if (totalAlloc(next) > avail) return a;
      return next;
    });
  };

  const handleApplyPlan = (planAlloc: Allocation, planId: string) => {
    const capped = { ...planAlloc };
    let curTotal = totalAlloc(capped);
    while (curTotal > avail) {
      if (capped.science > 0) capped.science--;
      else if (capped.shield > 0) capped.shield--;
      else if (capped.greenhouse > 0) capped.greenhouse--;
      else break;
      curTotal = totalAlloc(capped);
    }
    setAlloc(capped);
    setActivePlanId(planId);
  };

  const launch = () => {
    const next = playSol(game, alloc);
    setGame(next);
    setShowDebrief(true);
    // Keep the same plan as a starting point, but never more than tomorrow's power.
    const nextAvail = availableCells(next);
    const a = { ...alloc };
    for (const k of ['science', 'shield', 'greenhouse', 'life'] as SystemId[]) {
      while (totalAlloc(a) > nextAvail && a[k] > 0) a[k]--;
    }
    a.shield = 0;
    setAlloc(totalAlloc(a) <= nextAvail ? a : EMPTY);
  };

  const mealsDays = Math.floor(game.food / RULES.mealsPerSol);
  const upcomingHarvest = game.harvests.reduce((t, h) => t + h.meals, 0);
  const night = site.nightStartSol && game.sol >= site.nightStartSol;
  const dust = game.plan.some((e) => e.kind === 'dustStorm' && game.sol >= e.sol && game.sol < e.sol + (e.length ?? 0));

  return (
    <div className="play">
      <header className="topbar">
        <button className="btn btn-ghost small-btn" onClick={onQuit}>
          ⟵ Menu
        </button>
        <div className="topbar-title">
          {site.emoji} <b>{site.name}</b> <span className="muted">· {site.place}</span>
        </div>
        <div className="sol-counter">
          <Term word={site.dayWord.toUpperCase()}>{site.facts[0]}</Term> {game.sol} / {RULES.solsTotal}
        </div>
        <div className="science-score" title={`Stars at ${RULES.stars.join(' / ')} science points`}>
          🔬 {game.science} <Stars n={RULES.stars.filter((t) => game.science >= t).length} />
        </div>
        <button className="icon-btn" onClick={() => setShowHowTo(true)} aria-label="How to play" title="Game Rules">
          ❓
        </button>
        <button className="btn btn-ghost small-btn jargon-btn" onClick={() => setShowJargonModal(true)} title="Space Words & NASA Jargon Decoder">
          📖 Jargon Decoder
        </button>
        <button className="btn btn-ghost small-btn nasa-data-btn" onClick={() => setShowTraceModal(true)} title="NASA Datasets & DONKI API">
          🛰️ NASA Data Hub
        </button>
      </header>

      <div className="sol-track" aria-hidden>
        {Array.from({ length: RULES.solsTotal }, (_, i) => {
          const s = i + 1;
          const h = game.history.find((x) => x.sol === s);
          const isNight = site.nightStartSol && s >= site.nightStartSol;
          return (
            <div key={s} className={`sol-dot ${s === game.sol ? 'now' : ''} ${h ? 'done' : ''} ${isNight ? 'night' : ''}`}>
              {h ? (h.radiationStorm ? '☢️' : h.dustStorm ? '🌪️' : '✓') : isNight ? '🌑' : s}
            </div>
          );
        })}
      </div>

      <OutpostSchematic game={game} alloc={alloc} />

      <div className="play-grid">
        <section className="status-col">
          <Meter icon="🫧" label="Air" value={game.air} help="Oxygen for the crew. Below 25% the crew gets sick." />
          <Meter icon="❤️" label="Crew health" value={game.health} help="Hurt by radiation, hunger and low air. Heals slowly on good days." />
          <Meter
            icon="🔋"
            label="Battery"
            value={game.battery}
            max={site.batteryMax}
            display={`${game.battery}/${site.batteryMax} cells`}
            help="Stored power for dark or dusty days."
          />
          <Meter
            icon="🥔"
            label="Food"
            value={game.food}
            max={30}
            warnBelow={20}
            display={`${game.food} meals (${mealsDays} ${site.dayWord}s)`}
            help={`The crew eats ${RULES.mealsPerSol} meals a ${site.dayWord}. Growing: ${upcomingHarvest} meals.`}
          />
          <div className="card dose-card">
            <div>
              ☢️ <Term word="Radiation dose">How much radiation energy the crew’s bodies soaked up. Measured in mSv (millisieverts).</Term> so far:{' '}
              <b>{game.totalDoseMsv.toFixed(1)} mSv</b>
            </div>
            <div className="small muted">Normal daily dose here: {site.baseDoseMsv} mSv (an Earth person gets about 0.008 mSv a day).</div>
            <RealTag kind="measured" label={site.baseDoseSource} />
          </div>
        </section>

        <section className="plan-col">
          <CapcomAndPlans
            game={game}
            solar={solar}
            avail={avail}
            alloc={alloc}
            onApplyPlan={handleApplyPlan}
            activePlanId={activePlanId}
          />

          <CustomizePowerCells
            game={game}
            alloc={alloc}
            solar={solar}
            avail={avail}
            used={used}
            left={left}
            fromBattery={fromBattery}
            toBattery={toBattery}
            preview={preview}
            onChange={change}
          />

          <div className="launch-row">
            <div className="small">
              {fromBattery > 0 ? `This plan uses ${fromBattery} battery cell(s). ` : ''}
              {toBattery > 0 ? `${toBattery} spare cell(s) will charge the battery. ` : ''}
              Battery after: <b>{preview.battery}</b>/{site.batteryMax}
            </div>
            <button className="btn btn-primary big" onClick={launch}>
              Run {site.dayWord} {game.sol} ▶
            </button>
          </div>
        </section>

        <section className="inbox-col">
          <div className="card inbox">
            <h2>📡 Messages from Earth</h2>
            <p className="small muted">
              <Term word="Communication delay">{site.commsDelayReal}</Term>:{' '}
              {site.commsDelaySols ? `messages arrive ${site.commsDelaySols} ${site.dayWord} late here.` : 'messages arrive almost instantly here.'}
            </p>
            {msgs.length === 0 && <p className="muted">No messages yet. Keep your radio on!</p>}
            {msgs.map((m) => (
              <div key={m.id} className={`msg msg-${m.kind} ${newMsgs.includes(m) ? 'new' : ''}`}>
                {newMsgs.includes(m) && <span className="new-badge">NEW</span>}
                <div className="msg-head">
                  <span>
                    Sent {site.dayWord} {m.sentSol} → arrived {site.dayWord} {m.arriveSol}
                  </span>
                  <SpeakButton text={m.text} />
                </div>
                <p>{m.text}</p>
                {m.realData && <RealTag kind="archived" label={`In-game flare based on a real ${m.realData.label}`} link={m.realData.link} />}
              </div>
            ))}
            {game.messages.some((m) => m.missed) && (
              <div className="msg msg-missed">📵 You missed {game.messages.filter((m) => m.missed).length} message(s) because the radio was off.</div>
            )}
          </div>
        </section>
      </div>

      {showHowTo && <HowToPlay game={game} onClose={() => setShowHowTo(false)} />}
      {game.status === 'lost' ? (
        <CriticalFailureModal
          game={game}
          onViewReport={onEnd}
        />
      ) : (
        showDebrief && (
          <Debrief
            game={game}
            onNext={() => {
              setShowDebrief(false);
              if (game.status !== 'playing') onEnd();
            }}
          />
        )
      )}
      {showTraceModal && (
        <ScienceTraceabilityModal
          isOpen={showTraceModal}
          onClose={() => setShowTraceModal(false)}
        />
      )}
      {showJargonModal && (
        <JargonDecoderModal
          isOpen={showJargonModal}
          onClose={() => setShowJargonModal(false)}
        />
      )}
    </div>
  );
}
