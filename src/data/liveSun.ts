// "Today's real Sun": a LIVE read of NASA DONKI in the player's browser.
// Uses the public DEMO_KEY (rate-limited per player IP) so no secret key ships in the app.
// If the call fails, the game says so and falls back to archived data — never pretending it is live.
import type { SunMood } from '../engine/game';
import donki from './donki.json';

export interface SunReport {
  live: boolean;
  checkedAt: string;
  mood: SunMood;
  strongestFlare: { classType: string; beginTime: string; link?: string } | null;
  flareCount: number;
  sepCount: number;
  windowDays: number;
  note: string;
}

const rank = (c: string) => ({ C: 1, M: 10, X: 100 } as Record<string, number>)[c[0]] * parseFloat(c.slice(1));

function moodFrom(strongest: string | null, sepCount: number): SunMood {
  if (sepCount > 0 || (strongest && strongest.startsWith('X'))) return 'stormy';
  if (strongest && strongest.startsWith('M')) return 'active';
  return 'calm';
}

const ymd = (d: Date) => d.toISOString().slice(0, 10);

export async function fetchLiveSun(windowDays = 7): Promise<SunReport> {
  const end = new Date();
  const start = new Date(end.getTime() - windowDays * 864e5);
  const base = 'https://api.nasa.gov/DONKI';
  const apiKey = (import.meta.env.VITE_NASA_API_KEY as string) || 'DEMO_KEY';
  const q = `startDate=${ymd(start)}&endDate=${ymd(end)}&api_key=${encodeURIComponent(apiKey)}`;
  const ctl = AbortSignal.timeout(12000);
  const [notesRes, sepRes] = await Promise.all([
    fetch(`${base}/notifications?${q}&type=FLR`, { signal: ctl }),
    fetch(`${base}/SEP?${q}`, { signal: ctl }),
  ]);
  if (!notesRes.ok || !sepRes.ok) throw new Error('NASA DONKI did not answer');
  const notesText = await notesRes.text();
  const sepText = await sepRes.text();
  const notes: { messageBody?: string; messageURL?: string }[] = notesText.trim() ? JSON.parse(notesText) : [];
  const seps: unknown[] = sepText.trim() ? JSON.parse(sepText) : [];
  const flares = notes
    .map((n) => ({
      classType: n.messageBody?.match(/Flare intensity:\s*([CMX]\d+(?:\.\d+)?)/)?.[1] ?? '',
      beginTime: n.messageBody?.match(/Flare start time:\s*(\S+?)\.?\s/)?.[1] ?? '',
      link: n.messageURL,
    }))
    .filter((f) => f.classType);
  const strongest = flares.sort((a, b) => rank(b.classType) - rank(a.classType))[0] ?? null;
  const mood = moodFrom(strongest?.classType ?? null, seps.length);
  return {
    live: true,
    checkedAt: new Date().toISOString(),
    mood,
    strongestFlare: strongest,
    flareCount: flares.length,
    sepCount: seps.length,
    windowDays,
    note: 'LIVE from NASA DONKI (last 7 days)',
  };
}

/** Fallback: a real but ARCHIVED week, clearly labelled as such. */
export function archivedSun(): SunReport {
  const flares = donki.flares as { classType: string; beginTime: string; link?: string }[];
  const strongest = [...flares].sort((a, b) => rank(b.classType) - rank(a.classType))[0];
  const day = strongest.beginTime.slice(0, 10);
  const weekStart = new Date(new Date(day).getTime() - 3 * 864e5).toISOString().slice(0, 10);
  const weekEnd = new Date(new Date(day).getTime() + 4 * 864e5).toISOString().slice(0, 10);
  const sepCount = (donki.solarParticleEvents as { eventTime: string }[]).filter(
    (s) => s.eventTime.slice(0, 10) >= weekStart && s.eventTime.slice(0, 10) <= weekEnd,
  ).length;
  return {
    live: false,
    checkedAt: donki.fetchedAt,
    mood: moodFrom(strongest.classType, sepCount),
    strongestFlare: strongest,
    flareCount: flares.filter((f) => f.beginTime.slice(0, 10) >= weekStart && f.beginTime.slice(0, 10) <= weekEnd).length,
    sepCount,
    windowDays: 7,
    note: `REAL ARCHIVED week (${weekStart} → ${weekEnd}), not live`,
  };
}
