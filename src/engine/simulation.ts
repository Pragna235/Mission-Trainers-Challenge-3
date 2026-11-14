import {
  DifficultyMode,
  EventChoice,
  MissionConfig,
  PowerAllocation
} from '../types/game';

export interface DailySliderImpact {
  totalAllocatedPercent: number;
  netPowerFromSliders: number;
  lifeSupportFromSliders: number;
  healthFromSliders: number;
  radiationMsVFromSliders: number;
  cropHealthFromSliders: number;
  scienceFromSliders: number;
  warnings: string[];
}

/**
 * Calculates how today's Power Allocation Sliders affect the outpost BEFORE the event card choice.
 * Baseline solar generation replenishes ~95% of normal draw, so allocating >95% total power drains battery reserves,
 * while allocating <95% charges the battery—at the cost of whichever system you underfunded!
 */
export function calculateSliderImpact(
  allocation: PowerAllocation,
  config: MissionConfig,
  cropHealth: number,
  difficulty: DifficultyMode
): DailySliderImpact {
  const totalAllocatedPercent =
    allocation.lifeSupport +
    allocation.shielding +
    allocation.greenhouse +
    allocation.scienceComms;

  // Baseline daily solar harvest is 95 units in Cadet mode, 90 in Flight Director mode
  const dailySolarHarvest = difficulty === 'cadet' ? 96 : 90;
  const netPowerFromSliders = Math.round((dailySolarHarvest - totalAllocatedPercent) * 0.45);

  const warnings: string[] = [];

  // 1. Life Support (ECLSS) — Nominal is 30%
  const eclssDiff = allocation.lifeSupport - 30;
  let lifeSupportFromSliders = Math.round(eclssDiff * 0.45);
  // Bonus O2 from healthy hydroponic crops!
  const cropBonusO2 = cropHealth >= 65 ? +3 : cropHealth <= 30 ? -4 : 0;
  lifeSupportFromSliders += cropBonusO2;

  if (allocation.lifeSupport < 22) {
    warnings.push('Low ECLSS Power (<22%): CO₂ is building up and water recycling is falling behind!');
  }

  // 2. Active Shielding & Thermal — Nominal is 25%
  const shieldDiff = allocation.shielding - 25;
  // Shielding reduces baseline daily cosmic ray dose (RadLab data)
  const shieldFactor = Math.max(0.25, 1 - (allocation.shielding - 15) * 0.022);
  const radiationMsVFromSliders = Number(
    Math.max(0.15, config.baselineRadiationMsVPerDay * shieldFactor).toFixed(2)
  );

  let healthFromSliders = 0;
  if (allocation.shielding < 18) {
    healthFromSliders -= 5;
    warnings.push('Low Shielding Power (<18%): Cabin is freezing and Cosmic Ray dose is rising!');
  } else if (allocation.shielding >= 30) {
    healthFromSliders += 2;
  }

  // If Life Support is underpowered, Crew Health also suffers
  if (allocation.lifeSupport < 20) {
    healthFromSliders -= 6;
  }

  // 3. Greenhouse & Hydroponics (CSA Food) — Nominal is 20%
  const greenDiff = allocation.greenhouse - 20;
  const cropHealthFromSliders = Math.round(greenDiff * 0.6);
  if (allocation.greenhouse < 15) {
    warnings.push('Low Greenhouse LEDs (<15%): Hydroponic crops are wilting—tomorrow’s O₂ & food will drop!');
  } else if (allocation.greenhouse >= 28) {
    // Fresh food boosts crew morale/health slightly
    healthFromSliders += 2;
  }

  // 4. Science & Deep Space Comms — Nominal is 20%
  const scienceFromSliders = Math.max(0, Math.round(allocation.scienceComms * 0.45));
  if (allocation.scienceComms < 12) {
    warnings.push('Low Science & Comms (<12%): Very slow research progress toward your mission goal.');
  }

  if (totalAllocatedPercent > 105) {
    warnings.push(`Over-drawing Power (${totalAllocatedPercent}% allocated): Draining backup batteries by ${netPowerFromSliders}% today!`);
  }

  return {
    totalAllocatedPercent,
    netPowerFromSliders,
    lifeSupportFromSliders,
    healthFromSliders,
    radiationMsVFromSliders,
    cropHealthFromSliders,
    scienceFromSliders,
    warnings
  };
}

export function clampPercent(val: number): number {
  return Math.max(0, Math.min(100, Math.round(val)));
}

export function previewTurnOutcome(
  current: {
    power: number;
    lifeSupport: number;
    health: number;
    radiationMsV: number;
    cropHealth: number;
    science: number;
  },
  sliderImpact: DailySliderImpact,
  choice: EventChoice | null
) {
  const c = choice?.effects || {
    powerDelta: 0,
    lifeSupportDelta: 0,
    healthDelta: 0,
    radiationDoseMsV: 0,
    cropHealthDelta: 0,
    scienceDelta: 0
  };

  const nextPower = clampPercent(current.power + sliderImpact.netPowerFromSliders + c.powerDelta);
  const nextLifeSupport = clampPercent(
    current.lifeSupport + sliderImpact.lifeSupportFromSliders + c.lifeSupportDelta
  );
  const nextCropHealth = clampPercent(
    current.cropHealth + sliderImpact.cropHealthFromSliders + c.cropHealthDelta
  );
  const nextRadiationMsV = Number(
    Math.max(
      0,
      current.radiationMsV + sliderImpact.radiationMsVFromSliders + c.radiationDoseMsV
    ).toFixed(2)
  );
  const nextHealth = clampPercent(current.health + sliderImpact.healthFromSliders + c.healthDelta);
  const nextScience = Math.max(0, current.science + sliderImpact.scienceFromSliders + c.scienceDelta);

  return {
    power: nextPower,
    lifeSupport: nextLifeSupport,
    health: nextHealth,
    radiationMsV: nextRadiationMsV,
    cropHealth: nextCropHealth,
    science: nextScience
  };
}
