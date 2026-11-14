import React, { useState, useEffect } from 'react';
import type { Allocation, GameState } from '../engine/game';
import { SITES } from '../engine/sites';

interface CapcomAndPlansProps {
  game: GameState;
  solar: number;
  avail: number;
  alloc: Allocation;
  onApplyPlan: (planAlloc: Allocation, planId: string) => void;
  activePlanId: string | null;
}

export function CapcomAndPlans({
  game,
  solar,
  avail,
  alloc,
  onApplyPlan,
  activePlanId
}: CapcomAndPlansProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const site = SITES[game.site];

  // Dynamic Capcom briefing message based on site, weather, and sol
  const briefingText = (() => {
    const isNight = Boolean(site.nightStartSol && game.sol >= site.nightStartSol);
    const isDust = game.plan.some(
      (e) => e.kind === 'dustStorm' && game.sol >= e.sol && game.sol < e.sol + (e.length ?? 0)
    );
    const isStorm = game.plan.some(
      (e) => e.kind === 'radiationStorm' && e.sol === game.sol
    );

    if (isStorm) {
      return `WARNING: Energetic particles inbound! Power up your radiation shield to protect crew DNA and cabin ECLSS!`;
    }
    if (isDust) {
      return `Martian dust storm active! Sunlight is choked to ${solar} cells. Draw from battery banks to keep life support nominal!`;
    }
    if (isNight) {
      return `Lunar night has fallen! Solar panels produce 0 cells. Survive purely on fuel cells and battery reserves!`;
    }
    return `Sunlight is strong (${solar} yellow cells)! Decide whether to bank green Battery cells, boost Science, or speed up food growth.`;
  })();

  // Stop audio on unmount or sol change
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [game.sol]);

  const handleListenBriefing = () => {
    if (!('speechSynthesis' in window)) return;
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(briefingText.replace(/[“”]/g, ''));
    u.rate = 0.95;
    u.pitch = 1.05;
    u.onend = () => setIsPlayingAudio(false);
    u.onerror = () => setIsPlayingAudio(false);
    setIsPlayingAudio(true);
    window.speechSynthesis.speak(u);
  };

  const handlePauseBriefing = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  };

  // 3 Pre-made plans matching Image 2, adapted dynamically to available cells
  const plans = [
    {
      id: 'plan-battery',
      title: '1. Charge Batteries for Storms',
      powerCost: 6,
      badge: 'SMART PREP',
      badgeClass: 'badge-prep',
      alloc: { life: 3, greenhouse: 1, shield: 1, science: 1 },
      desc: 'Air (3) + Greenhouse (1) + Shield (1) + Radio (1) · Saves extra sun to Battery!'
    },
    {
      id: 'plan-science',
      title: '2. Big Science Experiment',
      powerCost: Math.min(avail, 8),
      badge: '+15–22 SCIENCE',
      badgeClass: 'badge-sci',
      alloc: { life: 3, greenhouse: 1, shield: 1, science: Math.max(1, Math.min(avail - 5, 3)) },
      desc: `Air (3) + Greenhouse (1) + Shield (1) + Science (${Math.max(1, Math.min(avail - 5, 3))})!`
    },
    {
      id: 'plan-veggie',
      title: '3. Space Veggie Feast',
      powerCost: Math.min(avail, 7),
      badge: '2X GROWTH',
      badgeClass: 'badge-growth',
      alloc: { life: 3, greenhouse: 2, shield: 1, science: Math.max(0, Math.min(avail - 6, 1)) },
      desc: 'Air (3) + Double Greenhouse (2) + Shield (1) + Radio (1).'
    }
  ];

  return (
    <div className="capcom-plans-container">
      {/* 1. Capcom Briefing Card */}
      <div className="card capcom-briefing-card compact-briefing">
        <div className="capcom-header">
          <div className="capcom-title-line">
            <span className="capcom-icon">📡</span>
            <strong>DR. STELLA VANCE · {game.site === 'moon' ? 'ARTEMIS' : 'JEZERO'} CAPCOM</strong>
          </div>
          <span className="capcom-sol-tag">
            {site.dayWord.toUpperCase()} {game.sol} BRIEFING
          </span>
        </div>

        <p className="capcom-message">{briefingText}</p>

        <div className="capcom-audio-row">
          <button
            className={`btn-listen-briefing ${isPlayingAudio ? 'active-playing' : ''}`}
            onClick={handleListenBriefing}
            aria-label={isPlayingAudio ? 'Stop Briefing' : 'Listen to Briefing'}
          >
            <span className="play-triangle">{isPlayingAudio ? '⏹' : '▶'}</span>
            <span>{isPlayingAudio ? 'Stop Briefing' : 'Listen to Briefing'}</span>
          </button>

          <button
            className="btn-pause-briefing"
            onClick={handlePauseBriefing}
            disabled={!isPlayingAudio}
            aria-label="Pause Briefing Audio"
            title="Pause audio"
          >
            <span className="pause-icon">⏸</span>
            <span>Pause</span>
          </button>

          <div className={`audio-waveform-bars ${isPlayingAudio ? 'anim-wave' : ''}`} aria-hidden>
            <span /><span /><span /><span /><span /><span /><span /><span />
          </div>
        </div>
      </div>

      {/* 2. Choose a Plan (or Customize Below!) */}
      <div className="card choose-plan-card compact-plan-card">
        <div className="plan-header-row">
          <div className="plan-header-left">
            <span className="sparkle-icon">✨</span>
            <h3>Choose a Plan (or Customize Below!)</h3>
          </div>
          <span className="custom-plan-indicator">
            {activePlanId ? 'Plan Selected' : 'Custom Plan Active'}
          </span>
        </div>

        <div className="premade-plans-list">
          {plans.map((p) => {
            const isSelected = activePlanId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                className={`plan-item-btn ${isSelected ? 'plan-item-selected' : ''}`}
                onClick={() => onApplyPlan(p.alloc, p.id)}
              >
                <div className="plan-item-head">
                  <span className="plan-item-title">{p.title}</span>
                  <div className="plan-item-badges">
                    <span className="plan-power-cost">{p.powerCost} ⚡</span>
                    <span className={`plan-pill-tag ${p.badgeClass}`}>{p.badge}</span>
                  </div>
                </div>
                <div className="plan-item-desc">{p.desc}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
