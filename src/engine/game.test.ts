import { describe, expect, it } from 'vitest';
import { newGame, playSol, solarCells, inbox, RULES, type Allocation, type GameState } from './game';
import { SITES } from './sites';

const A = (life: number, greenhouse: number, shield: number, science: number): Allocation => ({ life, greenhouse, shield, science });

/** A sensible player: keeps air steady, farms, listens to the radio, shields after flare warnings. */
function sensibleBot(s: GameState): Allocation {
  const site = SITES[s.site];
  const avail = solarCells(s) + s.battery;
  const warned = inbox(s).some((m) => m.kind === 'flare' && (m.sentSol === s.sol - 1 || m.sentSol === s.sol));
  const nightSoon = site.nightStartSol ? s.sol >= site.nightStartSol - 4 : false;
  const a = A(3, s.sol <= RULES.solsTotal - RULES.growSols ? 2 : 0, warned && s.plan.some((e) => e.kind === 'radiationStorm' && e.sol === s.sol) ? 3 : 0, 1);
  let left = avail - (a.life + a.greenhouse + a.shield + a.science);
  const reserve = nightSoon ? site.batteryMax : 3;
  const spare = Math.max(0, Math.min(left, solarCells(s) - (a.life + a.greenhouse + a.shield + a.science) - (nightSoon ? site.batteryMax - s.battery : 0)));
  a.science += Math.max(0, Math.min(spare, left - Math.min(reserve, s.battery)));
  left = avail - (a.life + a.greenhouse + a.shield + a.science);
  while (left < 0 && a.science > 0) { a.science--; left++; }
  while (left < 0 && a.greenhouse > 0) { a.greenhouse--; left++; }
  while (left < 0 && a.shield > 0) { a.shield--; left++; }
  while (left < 0 && a.life > 0) { a.life--; left++; }
  return a;
}

function run(s: GameState, bot: (s: GameState) => Allocation) {
  while (s.status === 'playing') s = playSol(s, bot(s));
  return s;
}

describe('mission generation', () => {
  it('is reproducible for the same seed (replayable but fair)', () => {
    expect(newGame('mars', { seed: 42 }).plan).toEqual(newGame('mars', { seed: 42 }).plan);
  });
  it('varies between seeds', () => {
    const plans = new Set([1, 2, 3, 4, 5, 6].map((seed) => JSON.stringify(newGame('mars', { seed }).plan)));
    expect(plans.size).toBeGreaterThan(1);
  });
  it('uses real DONKI events when provided', () => {
    const g = newGame('mars', { seed: 7, flares: [{ classType: 'X1.1', beginTime: '2024-05-14T00:00Z' }], seps: [{ eventTime: '2024-05-10T00:00Z' }] });
    expect(g.plan.find((e) => e.kind === 'flare')?.real?.label).toContain('X1.1');
  });
});

describe('trade-offs', () => {
  it('conserves power: spare sunlight charges the battery, overspending drains it', () => {
    const g = newGame('mars', { seed: 1 });
    const solar = solarCells(g);
    const s1 = playSol(g, A(3, 0, 0, 1));
    expect(s1.battery).toBe(Math.min(SITES.mars.batteryMax, g.battery + solar - 4));
    const s2 = playSol(g, A(3, 2, 3, solar + g.battery - 8));
    expect(s2.battery).toBe(0);
  });
  it('rejects plans that use more power than you have', () => {
    const g = newGame('mars', { seed: 1 });
    expect(() => playSol(g, A(20, 0, 0, 0))).toThrow();
  });
  it('under-powering life support costs air', () => {
    const g = newGame('mars', { seed: 1 });
    expect(playSol(g, A(1, 0, 0, 0)).air).toBeLessThan(g.air);
  });
  it('greenhouse food arrives later, not today', () => {
    let g = newGame('mars', { seed: 1 });
    g = playSol(g, A(3, 3, 0, 1));
    expect(g.harvests).toEqual([{ sol: 1 + RULES.growSols, meals: 3 * RULES.mealsPerGreenhouseCell }]);
  });
  it('shielding reduces storm damage, but costs power on quiet days', () => {
    const g = newGame('mars', { seed: 3, sunMood: 'stormy' });
    const storm = g.plan.find((e) => e.kind === 'radiationStorm' && e.happens)!;
    expect(storm).toBeTruthy();
    let s = g;
    while (s.sol < storm.sol) s = playSol(s, A(3, 1, 0, 1));
    const unshielded = playSol(s, A(3, 0, 0, 0));
    const shielded = playSol(s, A(3, 0, 3, 0));
    expect(shielded.health).toBeGreaterThan(unshielded.health);
    expect(shielded.totalDoseMsv).toBeLessThan(unshielded.totalDoseMsv);
  });
  it('turning the radio off makes you miss messages', () => {
    const g = newGame('mars', { seed: 5 });
    let s = g;
    while (s.status === 'playing') s = playSol(s, A(3, 2, 0, 0));
    expect(s.messages.some((m) => m.missed)).toBe(true);
  });
  it('the Moon goes dark at night', () => {
    const g = newGame('moon', { seed: 1 });
    expect(solarCells(g, SITES.moon.nightStartSol!)).toBe(0);
    expect(solarCells(g, 1)).toBeGreaterThan(0);
  });
});

describe('balance', () => {
  for (const site of ['mars', 'moon'] as const) {
    it(`a sensible plan can win on ${site} across many missions`, () => {
      let wins = 0;
      for (let seed = 1; seed <= 50; seed++) if (run(newGame(site, { seed }), sensibleBot).status === 'won') wins++;
      expect(wins).toBeGreaterThanOrEqual(45);
    });
    it(`ignoring life support loses on ${site}`, () => {
      expect(run(newGame(site, { seed: 9 }), () => A(0, 0, 0, 0)).status).toBe('lost');
    });
  }
  it('going all-in on science without food or shields usually fails', () => {
    let losses = 0;
    for (let seed = 1; seed <= 30; seed++) {
      const s = run(newGame('mars', { seed, sunMood: 'stormy' }), (st) => {
        const avail = solarCells(st) + st.battery;
        return A(3, 0, 0, Math.max(0, Math.min(solarCells(st), avail) - 3));
      });
      if (s.status === 'lost') losses++;
    }
    expect(losses).toBeGreaterThanOrEqual(20);
  });
});
