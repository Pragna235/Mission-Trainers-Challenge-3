export type MissionSiteId = 'moon' | 'mars';
export type DifficultyMode = 'cadet' | 'director';
export type DataSourceMode = 'live' | 'archived';

export interface GlossaryTerm {
  id: string;
  term: string;
  shortDef: string;
  kidAnalogy: string;
  nasaSource: string;
}

export interface NasaCitation {
  dataset: 'DONKI' | 'OSDR' | 'RadLab' | 'Mars Trek' | 'CSA Food';
  title: string;
  referenceId: string;
  measuredValue: string;
  url: string;
  explanation: string;
}

export interface PowerAllocation {
  lifeSupport: number; // % of total available kWh (e.g., 0-60)
  shielding: number;   // % of total available kWh
  greenhouse: number;  // % of total available kWh
  scienceComms: number;// % of total available kWh
}

export interface EventChoiceEffect {
  powerDelta: number;       // -100 to +100
  lifeSupportDelta: number; // -100 to +100
  healthDelta: number;      // -100 to +100
  radiationDoseMsV: number; // added mSv dose
  cropHealthDelta: number;  // -100 to +100
  scienceDelta: number;     // science points
  delayedEffect?: {
    turnsLater: number;
    description: string;
    powerDelta?: number;
    lifeSupportDelta?: number;
    healthDelta?: number;
    cropHealthDelta?: number;
    scienceDelta?: number;
  };
}

export interface EventChoice {
  id: string;
  label: string;
  tradeOffSummary: string;
  whyItMatters: string;
  commDelayPenaltyApply?: boolean; // For Mars "Ask Earth Mission Control" option
  effects: EventChoiceEffect;
}

export interface MissionEventCard {
  id: string;
  title: string;
  category: 'solar-storm' | 'biology-health' | 'food-hydroponics' | 'environment' | 'comms-delay';
  severity: 'info' | 'warning' | 'critical';
  site: 'moon' | 'mars' | 'both';
  isLiveDonki?: boolean;
  donkiRawTimestamp?: string;
  flrClassOrSpeed?: string;
  storyKidFriendly: string;
  engineeringConstraint: string;
  nasaCitation: NasaCitation;
  choices: EventChoice[];
}

export interface DelayedConsequence {
  triggerDay: number;
  sourceTitle: string;
  description: string;
  powerDelta?: number;
  lifeSupportDelta?: number;
  healthDelta?: number;
  cropHealthDelta?: number;
  scienceDelta?: number;
}

export interface DayLogEntry {
  day: number;
  eventTitle: string;
  choiceLabel: string;
  powerEnd: number;
  lifeSupportEnd: number;
  healthEnd: number;
  radiationMsV: number;
  scienceEarned: number;
  lessonLearned: string;
  nasaSourceTag: string;
}

export interface MissionConfig {
  id: MissionSiteId;
  name: string;
  subtitle: string;
  locationName: string;
  coordinates: string;
  dayUnitName: 'Lunar Cycle' | 'Sol';
  totalDays: number;
  scienceTarget: number;
  commDelayDisplay: string;
  commDelayMinutes: number;
  baselineRadiationMsVPerDay: number;
  safeRadiationLimitMsV: number;
  surfaceTempRange: string;
  gravityFraction: string;
  description: string;
  siteFacts: string[];
}

export interface LiveDonkiSummary {
  fetchedAt: string;
  flareCount: number;
  cmeCount: number;
  strongestFlare?: {
    flrID: string;
    classType: string;
    beginTime: string;
    sourceLocation: string;
    link: string;
  };
  fastestCme?: {
    activityID: string;
    startTime: string;
    speedKmS: number;
    note: string;
    link: string;
  };
}
