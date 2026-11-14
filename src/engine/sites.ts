export type SiteId = 'mars' | 'moon';

export interface SiteConfig {
  id: SiteId;
  name: string;
  place: string;
  coords: string;
  emoji: string;
  dayWord: string; // "sol" on Mars, "day" on the Moon
  baseSolar: number; // power cells per sunny day
  batteryMax: number; // power cells
  commsDelaySols: number; // how many game-days a message from Earth takes
  commsDelayReal: string;
  baseDoseMsv: number; // real measured daily radiation dose at the surface
  baseDoseSource: string;
  stormDoseMsv: number; // game estimate for an unshielded storm day
  dustStorms: boolean;
  nightStartSol: number | null;
  trekUrl: string;
  intro: string;
  facts: string[];
}

export const SITES: Record<SiteId, SiteConfig> = {
  mars: {
    id: 'mars',
    name: 'Mars Outpost',
    place: 'Jezero Crater, Mars',
    coords: '18.4°N, 77.5°E — where NASA’s Perseverance rover landed',
    emoji: '🔴',
    dayWord: 'sol',
    baseSolar: 9,
    batteryMax: 8,
    commsDelaySols: 1,
    commsDelayReal: 'A radio message takes 4 to 24 minutes to travel between Earth and Mars, depending on where the planets are.',
    baseDoseMsv: 0.64,
    baseDoseSource: 'Curiosity rover RAD instrument, Gale Crater (Hassler et al., Science, 2014)',
    stormDoseMsv: 2,
    dustStorms: true,
    nightStartSol: null,
    trekUrl: 'https://trek.nasa.gov/mars/',
    intro: 'Mars is far from the Sun and very dusty. Its thin air blocks only a little radiation. Messages from Earth arrive late!',
    facts: [
      'A “sol” is one day on Mars. It is about 24 hours and 40 minutes long.',
      'Mars gets less than half the sunlight Earth gets, so solar panels make less power.',
      'In 2018 a planet-wide dust storm blocked so much sunlight that NASA’s Opportunity rover ran out of power.',
    ],
  },
  moon: {
    id: 'moon',
    name: 'Moon Base',
    place: 'Lunar South Pole region',
    coords: 'Near 89.9°S — the area NASA’s Artemis missions plan to explore',
    emoji: '🌕',
    dayWord: 'day',
    baseSolar: 10,
    batteryMax: 12,
    commsDelaySols: 0,
    commsDelayReal: 'A radio message takes only about 1.3 seconds to travel between Earth and the Moon.',
    baseDoseMsv: 1.37,
    baseDoseSource: 'Chang’e 4 lander LND instrument, lunar far side (Zhang et al., Science Advances, 2020)',
    stormDoseMsv: 3,
    dustStorms: false,
    nightStartSol: 10,
    trekUrl: 'https://trek.nasa.gov/moon/',
    intro: 'The Moon has no air at all, so there is more radiation. Earth is close — messages arrive fast. But a long, dark night is coming!',
    facts: [
      'The Moon has no air to block radiation, so astronauts get more of it than on Earth.',
      'A real lunar night lasts about 14 Earth days. In this mission it is squeezed into the last 3 days.',
      'Astronauts will need batteries or other power sources to survive the cold, dark lunar night.',
    ],
  },
};

/** Real reference doses for comparison cards. */
export const DOSE_REFERENCE = {
  earthDailyMsv: 0.008, // ~3 mSv per year average natural background
};
