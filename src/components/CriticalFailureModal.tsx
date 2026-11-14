import React from 'react';
import type { GameState } from '../engine/game';
import { SITES } from '../engine/sites';

interface CriticalFailureModalProps {
  game: GameState;
  onViewReport: () => void;
}

export function CriticalFailureModal({ game, onViewReport }: CriticalFailureModalProps) {
  const site = SITES[game.site];

  const failureDetails = (() => {
    if (game.lostReason === 'air' || game.air <= 0) {
      return {
        title: 'Outpost Life Support Blackout!',
        icon: '🫧',
        reason: 'Cabin Oxygen dropped to 0%! Without 3 power cells in Life Support (ECLSS), carbon dioxide accumulated and air scrubbers stopped running.',
        lesson: 'NASA Life Support Lesson: In space, recycling breath is non-negotiable. Astronauts need a minimum baseline of continuous power to stay breathing!'
      };
    }
    if (game.lostReason === 'health' || game.health <= 0) {
      return {
        title: 'Crew Physical Exhaustion & Illness!',
        icon: '❤️',
        reason: 'Crew Health dropped to 0%! A combination of radiation damage, hunger, or unshielded solar storms overwhelmed the astronauts’ immune systems.',
        lesson: 'NASA Space Medicine Lesson: Microgravity and deep space radiation degrade human tissue rapidly. Rest, water-wall shields, and regular meals are life-critical.'
      };
    }
    if (game.totalDoseMsv >= 20) {
      return {
        title: 'Lethal Radiation Threshold Exceeded!',
        icon: '☢️',
        reason: `Cumulative radiation dose reached ${game.totalDoseMsv.toFixed(1)} mSv! Unshielded solar particle events penetrated the habitat walls.`,
        lesson: 'NASA Dosimetry Lesson: Space weather warnings from DONKI must be taken seriously. Even one unshielded solar proton wave can exceed an astronaut’s safe career limit!'
      };
    }
    return {
      title: 'Mission Critical Outpost Failure!',
      icon: '⚠️',
      reason: 'The outpost ran out of essential survival resources and the mission had to be aborted.',
      lesson: 'Engineering Trade-Off Lesson: Every decision carries a resource cost that compounds over time. Saving power today can cost oxygen tomorrow!'
    };
  })();

  return (
    <div className="critical-failure-backdrop" role="alertdialog" aria-modal="true">
      <div className="critical-failure-panel">
        <div className="failure-banner-head">
          <div className="failure-icon-big">{failureDetails.icon}</div>
          <div>
            <div className="failure-tag">CRITICAL FAILURE · {site.dayWord.toUpperCase()} {game.sol} OF 12</div>
            <h2 className="failure-title">{failureDetails.title}</h2>
          </div>
        </div>

        <div className="failure-body">
          <div className="failure-reason-box">
            <strong>What Happened:</strong>
            <p>{failureDetails.reason}</p>
          </div>

          <div className="failure-lesson-box">
            <strong>🎓 NASA Flight Director Lesson:</strong>
            <p>{failureDetails.lesson}</p>
          </div>

          <div className="failure-stats-row">
            <span>Air: <strong>{game.air}%</strong></span>
            <span>Health: <strong>{game.health}%</strong></span>
            <span>Battery: <strong>{game.battery} cells</strong></span>
            <span>Radiation: <strong>{game.totalDoseMsv.toFixed(1)} mSv</strong></span>
          </div>
        </div>

        <button className="btn-failure-report" onClick={onViewReport} autoFocus>
          View Final Mission Report & Lessons Learned ▶
        </button>
      </div>
    </div>
  );
}
