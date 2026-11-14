import React from 'react';
import { RULES, type Allocation, type GameState, type SystemId } from '../engine/game';
import { SITES } from '../engine/sites';

interface CustomizePowerCellsProps {
  game: GameState;
  alloc: Allocation;
  solar: number;
  avail: number;
  used: number;
  left: number;
  fromBattery: number;
  toBattery: number;
  preview: {
    air: number;
    block: number;
    battery: number;
  };
  onChange: (id: SystemId, delta: number) => void;
}

export function CustomizePowerCells({
  game,
  alloc,
  solar,
  avail,
  used,
  left,
  fromBattery,
  toBattery,
  preview,
  onChange,
}: CustomizePowerCellsProps) {
  const site = SITES[game.site];

  return (
    <div className="card customize-power-card">
      {/* Top Header */}
      <div className="customize-power-header">
        <div className="header-left">
          <span className="customize-icon">🎛️</span>
          <h2>Customize Power Cells</h2>
        </div>
        <div className="header-right">
          <span className="power-stats-badge">
            <strong>{left} left</strong> · {used}/{avail} used
          </span>
        </div>
      </div>

      {/* Visual Power Cells Strip */}
      <div className="power-cells-visual-strip" aria-label={`${used} of ${avail} cells used`}>
        {Array.from({ length: avail }, (_, i) => {
          const isSun = i < solar;
          const isUsed = i < used;

          if (isSun) {
            return (
              <span
                key={i}
                className={`cell-badge badge-sun ${isUsed ? 'sun-used' : 'sun-avail'}`}
                title={isUsed ? 'Sunlight cell (in use)' : 'Available sunlight cell'}
              >
                ☀️
              </span>
            );
          } else {
            return (
              <span
                key={i}
                className={`cell-badge badge-batt ${isUsed ? 'batt-used' : 'batt-avail'}`}
                title={isUsed ? 'Battery cell (drawing power)' : 'Available battery cell'}
              >
                ⚡
              </span>
            );
          }
        })}

        {toBattery > 0 && <span className="cell-note-saved">+{toBattery} saved!</span>}
        {fromBattery > 0 && <span className="cell-note-drawn">-{fromBattery} from battery</span>}
      </div>

      {/* 4 Systems Rows */}
      <div className="systems-list">
        {/* 1. Life Support */}
        <div className="system-capsule sys-life-capsule">
          <div className="sys-left">
            <div className="sys-title-line">
              <span className="sys-glyph glyph-cyan">💨</span>
              <strong className="sys-title">Life Support</strong>
              <span className="sys-note">· Fresh oxygen & heat (needs {RULES.lifeCellsNeeded})</span>
            </div>
            <div className={`sys-status-text ${alloc.life < RULES.lifeCellsNeeded ? 'text-warn' : 'text-cyan'}`}>
              {alloc.life < RULES.lifeCellsNeeded
                ? `⚠️ Air will drop to ${preview.air}%`
                : alloc.life > RULES.lifeCellsNeeded
                ? `Air will rise to ${preview.air}%`
                : `Air stays about ${preview.air}%`}
            </div>
          </div>

          <div className="sys-right">
            <button
              className="stepper-btn btn-minus"
              onClick={() => onChange('life', -1)}
              disabled={alloc.life === 0}
              aria-label="Decrease Life Support cells"
            >
              −
            </button>
            <div className="pills-track">
              {Array.from({ length: 4 }, (_, i) => (
                <span
                  key={i}
                  className={`pill-block pill-cyan ${i < alloc.life ? 'block-filled' : 'block-empty'}`}
                />
              ))}
              <span className="stepper-number">{alloc.life}</span>
            </div>
            <button
              className="stepper-btn btn-plus"
              onClick={() => onChange('life', +1)}
              disabled={left <= 0 || alloc.life >= RULES.maxPerSystem}
              aria-label="Increase Life Support cells"
            >
              +
            </button>
          </div>
        </div>

        {/* 2. Greenhouse */}
        <div className="system-capsule sys-greenhouse-capsule">
          <div className="sys-left">
            <div className="sys-title-line">
              <span className="sys-glyph glyph-green">🌱</span>
              <strong className="sys-title">Greenhouse</strong>
              <span className="sys-note">· Grows meals (ready in {RULES.growSols} sols)</span>
            </div>
            <div className={`sys-status-text ${alloc.greenhouse > 0 ? 'text-green' : 'text-muted'}`}>
              {alloc.greenhouse > 0
                ? `Meals will be +${alloc.greenhouse * RULES.mealsPerGreenhouseCell} · Ready in ${RULES.growSols} steps`
                : '⚠️ No new food planted'}
            </div>
          </div>

          <div className="sys-right">
            <button
              className="stepper-btn btn-minus"
              onClick={() => onChange('greenhouse', -1)}
              disabled={alloc.greenhouse === 0}
              aria-label="Decrease Greenhouse cells"
            >
              −
            </button>
            <div className="pills-track">
              {Array.from({ length: 4 }, (_, i) => (
                <span
                  key={i}
                  className={`pill-block pill-green ${i < alloc.greenhouse ? 'block-filled' : 'block-empty'}`}
                />
              ))}
              <span className="stepper-number">{alloc.greenhouse}</span>
            </div>
            <button
              className="stepper-btn btn-plus"
              onClick={() => onChange('greenhouse', +1)}
              disabled={left <= 0 || alloc.greenhouse >= RULES.maxPerSystem}
              aria-label="Increase Greenhouse cells"
            >
              +
            </button>
          </div>
        </div>

        {/* 3. Radiation Shield */}
        <div className="system-capsule sys-shield-capsule">
          <div className="sys-left">
            <div className="sys-title-line">
              <span className="sys-glyph glyph-purple">🛡️</span>
              <strong className="sys-title">Radiation Shield</strong>
              <span className="sys-note">· Blocks cosmic rays</span>
            </div>
            <div className={`sys-status-text ${alloc.shield > 0 ? 'text-purple' : 'text-muted'}`}>
              {alloc.shield > 0
                ? `Blocks ${Math.round(preview.block * 100)}% of radiation`
                : 'Low background radiation (0.4 mSv)'}
            </div>
          </div>

          <div className="sys-right">
            <button
              className="stepper-btn btn-minus"
              onClick={() => onChange('shield', -1)}
              disabled={alloc.shield === 0}
              aria-label="Decrease Radiation Shield cells"
            >
              −
            </button>
            <div className="pills-track">
              {Array.from({ length: 4 }, (_, i) => (
                <span
                  key={i}
                  className={`pill-block pill-purple ${i < alloc.shield ? 'block-filled' : 'block-empty'}`}
                />
              ))}
              <span className="stepper-number">{alloc.shield}</span>
            </div>
            <button
              className="stepper-btn btn-plus"
              onClick={() => onChange('shield', +1)}
              disabled={left <= 0 || alloc.shield >= RULES.maxPerSystem}
              aria-label="Increase Radiation Shield cells"
            >
              +
            </button>
          </div>
        </div>

        {/* 4. Science & Radio */}
        <div className="system-capsule sys-science-capsule">
          <div className="sys-left">
            <div className="sys-title-line">
              <span className="sys-glyph glyph-amber">📡</span>
              <strong className="sys-title">Science & Radio</strong>
              <span className="sys-note">· Science stars + Earth link</span>
            </div>
            <div className={`sys-status-text ${alloc.science > 0 ? 'text-amber' : 'text-warn'}`}>
              {alloc.science > 0
                ? `Radio ON · +${alloc.science * RULES.sciencePerCell} Science points`
                : '⚠️ Radio OFF — you may miss messages'}
            </div>
          </div>

          <div className="sys-right">
            <button
              className="stepper-btn btn-minus"
              onClick={() => onChange('science', -1)}
              disabled={alloc.science === 0}
              aria-label="Decrease Science cells"
            >
              −
            </button>
            <div className="pills-track">
              {Array.from({ length: 4 }, (_, i) => (
                <span
                  key={i}
                  className={`pill-block pill-amber ${i < alloc.science ? 'block-filled' : 'block-empty'}`}
                />
              ))}
              <span className="stepper-number">{alloc.science}</span>
            </div>
            <button
              className="stepper-btn btn-plus"
              onClick={() => onChange('science', +1)}
              disabled={left <= 0 || alloc.science >= RULES.maxPerSystem}
              aria-label="Increase Science cells"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
