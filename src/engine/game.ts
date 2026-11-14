// Pure game simulation. No React, no DOM — so it can be unit-tested.
import { SITES, type SiteId, type SiteConfig } from './sites';

export type SystemId = 'life' | 'greenhouse' | 'shield' | 'science';
export type Allocation = Record<SystemId, number>;
export type SunMood = 'calm' | 'active' | 'stormy';

export interface RealFlare { classType: string; beginTime: string; link?: string }
export interface RealSep { eventTime: string; link?: string }

export interface Message {
  id: string;
  kind: 'flare' | 'dust' | 'night' | 'info';
  text: string;
  sentSol: number;
  arriveSol: number;
  delivered: boolean;
  missed: boolean;
  realData?: { label: string; link?: string };
}

/** Hidden mission script, generated at the start from a seed. */
export interface PlannedEvent {
  kind: 'flare' | 'radiationStorm' | 'dustStorm';
  sol: number;
  length?: number; // dust storm length in sols
  happens?: boolean; // for radiation storms: some flares don't produce one
  real?: { label: string; link?: string };
}

export interface SolReport {
  sol: number;
  alloc: Allocation;
  solar: number;
  batteryBefore: number;
  batteryAfter: number;
  wastedSun: number;
  air: [number, number];
  health: [number, number];
  food: [number, number];
  scienceGained: number;
  doseMsv: number;
  radiationStorm: boolean;
  dustStorm: boolean;
  night: boolean;
  harvested: number;
  lines: { icon: string; text: string; good: boolean }[];
  factTopic: 'radiation' | 'plants' | 'bone' | 'muscle' | null;
}

export interface GameState {
  site: SiteId;
  seed: number;
  sunMood: SunMood;
  sol: number; // the sol being planned (1-based)
  battery: number; // in power cells
  air: number; // 0..100
  health: number; // 0..100
  food: number; // meals
  science: number;
  totalDoseMsv: number;
  harvests: { sol: number; meals: number }[];
  plan: PlannedEvent[];
  messages: Message[];
  history: SolReport[];
  status: 'playing' | 'won' | 'lost';
  lostReason: 'air' | 'health' | null;
}

// ---------------- Tunable rules (kept small and explainable) ----------------
export const RULES = {
  solsTotal: 12,
  crew: 3,
  lifeCellsNeeded: 3, // 1 cell per astronaut keeps the air steady
  airPerCell: 10,
  greenhouseAirBonus: 3, // plants make a little oxygen (needs ≥2 cells)
  mealsPerSol: 3,
  mealsPerGreenhouseCell: 2,
  growSols: 3, // crops are ready 3 sols after you power the greenhouse
  sciencePerCell: 10,
  shieldBlock: [0, 0.35, 0.6, 0.8, 0.9], // fraction of radiation blocked by 0..4 cells
  maxPerSystem: 6,
  stormHealthHit: 45, // unshielded radiation storm
  lowAirLimit: 25,
  lowAirHit: 12,
  hungryHit: 15,
  recovery: 4,
  stars: [150, 250, 330],
  stormChance: { calm: 0.4, active: 0.65, stormy: 0.85 } as Record<SunMood, number>,
};

// ---------------- Seeded random (same seed → same mission) ----------------
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = <T,>(r: () => number, arr: T[]) => arr[Math.floor(r() * arr.length)];
const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
const fmtDate = (iso: string) => iso.slice(0, 10);

export function generatePlan(
  site: SiteConfig,
  seed: number,
  mood: SunMood,
  flares: RealFlare[],
  seps: RealSep[],
): PlannedEvent[] {
  const r = rng(seed);
  const plan: PlannedEvent[] = [];
  // 2–3 big solar flares spaced out across the mission.
  const flareCount = 2 + (r() < 0.5 ? 1 : 0);
  const slots = [2, 3, 4, 5, 6, 7, 8, 9, 10];
  const used = new Set<number>();
  for (let i = 0; i < flareCount; i++) {
    let s = pick(r, slots);
    let guard = 0;
    while ((used.has(s) || used.has(s - 1) || used.has(s + 1)) && guard++ < 20) s = pick(r, slots);
    used.add(s);
    const f = flares.length ? pick(r, flares) : null;
    plan.push({
      kind: 'flare',
      sol: s,
      real: f ? { label: `${f.classType} flare seen by NASA on ${fmtDate(f.beginTime)}`, link: f.link } : undefined,
    });
    const sp = seps.length ? pick(r, seps) : null;
    plan.push({
      kind: 'radiationStorm',
      sol: s + 1,
      happens: r() < RULES.stormChance[mood],
      real: sp ? { label: `Solar particle event recorded by NASA on ${fmtDate(sp.eventTime)}`, link: sp.link } : undefined,
    });
  }
  if (site.dustStorms) {
    plan.push({ kind: 'dustStorm', sol: 3 + Math.floor(r() * 6), length: 3 });
  }
  return plan.sort((a, b) => a.sol - b.sol);
}

function makeMessages(site: SiteConfig, plan: PlannedEvent[]): Message[] {
  const msgs: Message[] = [];
  const d = site.commsDelaySols;
  for (const ev of plan) {
    if (ev.kind === 'flare') {
      msgs.push({
        id: `flare-${ev.sol}`,
        kind: 'flare',
        text:
          'Mission Control: “We just saw a BIG flare on the Sun! A radiation storm might reach you the day after we send this. Maybe, maybe not — you decide if you power the shield.”' +
          (d > 0 ? ` ⏱️ This message took ${d} day to reach you — so the storm could be coming TODAY!` : ' ⚡ Earth is close, so you got this warning a whole day early.'),
        sentSol: ev.sol,
        arriveSol: ev.sol + d,
        delivered: false,
        missed: false,
        realData: ev.real,
      });
    }
    if (ev.kind === 'dustStorm') {
      msgs.push({
        id: `dust-${ev.sol}`,
        kind: 'dust',
        text: `Mission Control: “Our orbiter sees a dust storm coming! Your solar panels will make less power for about ${ev.length} sols. Save power in your batteries!”`,
        sentSol: ev.sol - 2,
        arriveSol: ev.sol - 2 + d,
        delivered: false,
        missed: false,
      });
    }
  }
  if (site.nightStartSol) {
    msgs.push({
      id: 'night',
      kind: 'night',
      text: `Mission Control: “Lunar night starts on sol ${site.nightStartSol}. No sunlight = no solar power. Fill your batteries before then!”`,
      sentSol: 1,
      arriveSol: 1,
      delivered: false,
      missed: false,
    });
  }
  return msgs;
}

export function newGame(
  siteId: SiteId,
  opts: { seed?: number; sunMood?: SunMood; flares?: RealFlare[]; seps?: RealSep[] } = {},
): GameState {
  const site = SITES[siteId];
  const seed = opts.seed ?? Math.floor(Math.random() * 1e9);
  const sunMood = opts.sunMood ?? 'active';
  const plan = generatePlan(site, seed, sunMood, opts.flares ?? [], opts.seps ?? []);
  const messages = makeMessages(site, plan);
  const state: GameState = {
    site: siteId,
    seed,
    sunMood,
    sol: 1,
    battery: Math.floor(site.batteryMax / 2),
    air: 80,
    health: 100,
    food: 18,
    science: 0,
    totalDoseMsv: 0,
    harvests: [],
    plan,
    messages,
    history: [],
    status: 'playing',
    lostReason: null,
  };
  // Messages that arrive on sol 1 are delivered right away (radio starts on).
  for (const m of state.messages) if (m.arriveSol <= 1) m.delivered = true;
  return state;
}

export function solarCells(state: GameState, sol = state.sol): number {
  const site = SITES[state.site];
  if (site.nightStartSol && sol >= site.nightStartSol) return 0;
  const dust = state.plan.find((e) => e.kind === 'dustStorm' && sol >= e.sol && sol < e.sol + (e.length ?? 0));
  return dust ? Math.round(site.baseSolar * 0.45) : site.baseSolar;
}

export const availableCells = (s: GameState) => solarCells(s) + s.battery;
export const totalAlloc = (a: Allocation) => a.life + a.greenhouse + a.shield + a.science;

/** Advance one sol using the player's power plan. Returns a new state (does not mutate). */
export function playSol(prev: GameState, alloc: Allocation): GameState {
  if (prev.status !== 'playing') return prev;
  const s: GameState = structuredClone(prev);
  const site = SITES[s.site];
  const sol = s.sol;
  const lines: SolReport['lines'] = [];

  const solar = solarCells(s);
  const used = totalAlloc(alloc);
  if (used > solar + s.battery) throw new Error('Not enough power for that plan');

  // ---- Power ----
  const batteryBefore = s.battery;
  let wastedSun = 0;
  if (used <= solar) {
    const charge = solar - used;
    const room = site.batteryMax - s.battery;
    s.battery += Math.min(charge, room);
    wastedSun = Math.max(0, charge - room);
    if (charge > 0) lines.push({ icon: '🔋', text: `${Math.min(charge, room)} spare cell(s) charged the batteries.`, good: true });
    if (wastedSun > 0) lines.push({ icon: '☀️', text: `Batteries were full, so ${wastedSun} cell(s) of sunlight went to waste.`, good: false });
  } else {
    s.battery -= used - solar;
    lines.push({ icon: '🔋', text: `You used ${used - solar} cell(s) from the batteries.`, good: false });
  }

  // ---- Air (life support) ----
  const air0 = s.air;
  s.air += (alloc.life - RULES.lifeCellsNeeded) * RULES.airPerCell;
  if (alloc.greenhouse >= 2) s.air += RULES.greenhouseAirBonus;
  s.air = clamp(s.air);
  if (alloc.life < RULES.lifeCellsNeeded)
    lines.push({ icon: '🫧', text: `Life support needed ${RULES.lifeCellsNeeded} cells but got ${alloc.life}. Air went down.`, good: false });
  else if (alloc.life > RULES.lifeCellsNeeded)
    lines.push({ icon: '🫧', text: 'Extra life-support power refilled the air tanks.', good: true });
  if (alloc.greenhouse >= 2) lines.push({ icon: '🌱', text: 'Greenhouse plants made a little extra oxygen.', good: true });

  // ---- Food ----
  const food0 = s.food;
  if (alloc.greenhouse > 0) {
    s.harvests.push({ sol: sol + RULES.growSols, meals: alloc.greenhouse * RULES.mealsPerGreenhouseCell });
    lines.push({ icon: '🌱', text: `Planted crops: ${alloc.greenhouse * RULES.mealsPerGreenhouseCell} meals ready on sol ${sol + RULES.growSols}.`, good: true });
  }
  const harvested = s.harvests.filter((h) => h.sol === sol).reduce((t, h) => t + h.meals, 0);
  s.harvests = s.harvests.filter((h) => h.sol !== sol);
  if (harvested) lines.push({ icon: '🥔', text: `Harvest time! +${harvested} meals.`, good: true });
  s.food += harvested;
  const hungry = s.food < RULES.mealsPerSol;
  s.food = Math.max(0, s.food - RULES.mealsPerSol);

  // ---- Radiation ----
  const block = RULES.shieldBlock[Math.min(alloc.shield, RULES.shieldBlock.length - 1)];
  const storm = s.plan.some((e) => e.kind === 'radiationStorm' && e.sol === sol && e.happens);
  const stormEv = s.plan.find((e) => e.kind === 'radiationStorm' && e.sol === sol);
  let dose = site.baseDoseMsv * (1 - block);
  let healthHit = 0;
  if (storm) {
    dose += site.stormDoseMsv * (1 - block);
    healthHit += Math.round(RULES.stormHealthHit * (1 - block));
    lines.push({
      icon: '☢️',
      text:
        block >= 0.8
          ? 'A radiation storm hit — your shield blocked almost all of it!'
          : block > 0
            ? `A radiation storm hit — the shield blocked ${Math.round(block * 100)}%, but the crew still got a dose.`
            : 'A radiation storm hit and the shield was OFF. Ouch! The crew got a big dose.',
      good: block >= 0.8,
    });
  } else if (stormEv && !stormEv.happens) {
    lines.push({
      icon: '😮‍💨',
      text: alloc.shield > 0 ? 'The flare did NOT send a radiation storm this time. Your shield was a safety bet.' : 'Phew — the flare did NOT send a radiation storm this time.',
      good: true,
    });
  } else if (alloc.shield > 0) {
    lines.push({ icon: '🛡️', text: 'Shield was on during a quiet sol. Safe, but that power could have done other jobs.', good: false });
  }
  s.totalDoseMsv = +(s.totalDoseMsv + dose).toFixed(2);

  // ---- Health ----
  const health0 = s.health;
  s.health -= healthHit;
  if (s.air < RULES.lowAirLimit) {
    s.health -= RULES.lowAirHit;
    lines.push({ icon: '😵', text: 'Air is very low — the crew feels dizzy and tired.', good: false });
  }
  if (hungry) {
    s.health -= RULES.hungryHit;
    lines.push({ icon: '🍽️', text: 'Not enough food! The crew is hungry and getting weaker.', good: false });
  }
  if (!storm && !hungry && s.air >= 50) s.health += RULES.recovery;
  s.health = clamp(s.health);

  // ---- Science & radio ----
  const sci = alloc.science * RULES.sciencePerCell;
  s.science += sci;
  if (sci) lines.push({ icon: '🔬', text: `Experiments earned +${sci} science points.`, good: true });

  // Messages arriving next sol need the radio (≥1 science/radio cell) to be on tonight.
  for (const m of s.messages) {
    if (m.arriveSol === sol + 1 && !m.delivered) {
      if (alloc.science > 0) m.delivered = true;
      else m.missed = true;
    }
  }
  if (alloc.science === 0 && s.messages.some((m) => m.arriveSol === sol + 1))
    lines.push({ icon: '📡', text: 'Radio was OFF — you missed a message from Earth!', good: false });

  const dustToday = s.plan.some((e) => e.kind === 'dustStorm' && sol >= e.sol && sol < e.sol + (e.length ?? 0));
  if (dustToday) lines.push({ icon: '🌪️', text: `Dust storm: solar panels only made ${solar} cells today.`, good: false });
  const night = !!site.nightStartSol && sol >= site.nightStartSol;
  if (night) lines.push({ icon: '🌑', text: 'Lunar night: zero solar power. Batteries only!', good: false });

  // ---- Fact topic for the debrief card ----
  let factTopic: SolReport['factTopic'] = null;
  if (storm || alloc.shield > 0) factTopic = 'radiation';
  else if (hungry || harvested || alloc.greenhouse > 0) factTopic = 'plants';
  else factTopic = sol % 2 === 0 ? 'bone' : 'muscle';

  s.history.push({
    sol,
    alloc: { ...alloc },
    solar,
    batteryBefore,
    batteryAfter: s.battery,
    wastedSun,
    air: [air0, s.air],
    health: [health0, s.health],
    food: [food0, s.food],
    scienceGained: sci,
    doseMsv: +dose.toFixed(2),
    radiationStorm: storm,
    dustStorm: dustToday,
    night,
    harvested,
    lines,
    factTopic,
  });

  // ---- End checks ----
  if (s.air <= 0) {
    s.status = 'lost';
    s.lostReason = 'air';
  } else if (s.health <= 0) {
    s.status = 'lost';
    s.lostReason = 'health';
  } else if (sol >= RULES.solsTotal) {
    s.status = 'won';
  } else {
    s.sol = sol + 1;
  }
  return s;
}

export function starsFor(state: GameState): number {
  if (state.status !== 'won') return 0;
  return RULES.stars.filter((t) => state.science >= t).length;
}

/** Messages the player can currently read (delivered and already arrived). */
export function inbox(state: GameState): Message[] {
  return state.messages.filter((m) => m.delivered && m.arriveSol <= state.sol).sort((a, b) => b.arriveSol - a.arriveSol);
}
