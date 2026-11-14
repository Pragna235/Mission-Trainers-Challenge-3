import osdr from './osdr.json';

export type FactTopic = 'radiation' | 'plants' | 'bone' | 'muscle';

interface Fact {
  topic: FactTopic;
  icon: string;
  kidText: string;
  accession: string;
  studyHint: string; // plain-language summary of the real study
}

// Hand-picked real OSDR studies (titles are looked up from the downloaded osdr.json).
const FACTS: Fact[] = [
  {
    topic: 'radiation',
    icon: '☢️',
    kidText: 'Space radiation is made of tiny, super-fast particles. They can damage the cells inside our bodies, which is why shielding matters.',
    accession: 'OSD-992',
    studyHint: 'NASA scientists studied how space radiation can push cells into an “old and tired” state where they stop working well.',
  },
  {
    topic: 'plants',
    icon: '🌱',
    kidText: 'Plants can grow in space! They make food AND oxygen — but they need power for lights, water, and warmth.',
    accession: 'OSD-615',
    studyHint: 'Scientists grew a small plant called Arabidopsis on the space station and found that the walls of its root cells changed in space.',
  },
  {
    topic: 'bone',
    icon: '🦴',
    kidText: 'In low gravity your bones don’t carry your weight, so they get weaker. Astronauts exercise about 2 hours every day to stay strong.',
    accession: 'OSD-471',
    studyHint: 'Mice that flew on the Bion-M1 space mission came back with spine bones that were weaker and broke more easily.',
  },
  {
    topic: 'muscle',
    icon: '💪',
    kidText: 'Muscles shrink when they don’t have to work against gravity. That’s why exercise machines are packed on every space mission.',
    accession: 'OSD-661',
    studyHint: 'Researchers are testing ways to stop muscle and bone loss during spaceflight, looking at a body chemical called GSK3.',
  },
];

type Study = { accession: string; title: string; mission: string | null; url: string };
const allStudies: Study[] = Object.values((osdr as { topics: Record<string, Study[]> }).topics).flat();

export function factFor(topic: FactTopic | null) {
  const f = FACTS.find((x) => x.topic === topic) ?? FACTS[2];
  const study = allStudies.find((s) => s.accession === f.accession);
  return {
    ...f,
    studyTitle: study?.title ?? null,
    mission: study?.mission || null,
    url: `https://osdr.nasa.gov/bio/repo/data/studies/${f.accession}`,
  };
}

export const ALL_FACTS = FACTS.map((f) => factFor(f.topic));
