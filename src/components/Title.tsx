import React, { useEffect, useState } from 'react';
import { SITES, type SiteId } from '../engine/sites';
import { archivedSun, fetchLiveSun, type SunReport } from '../data/liveSun';
import { GlossaryModal } from './GlossaryModal';

const MOOD_TEXT = {
  calm: { icon: '😌☀️', title: 'The Sun is CALM', text: 'Few big flares lately. Radiation storms are less likely.' },
  active: { icon: '🙂☀️', title: 'The Sun is ACTIVE', text: 'Some strong flares lately. Radiation storms might happen.' },
  stormy: { icon: '😠☀️', title: 'The Sun is STORMY', text: 'Very big flares or radiation storms lately. Get your shields ready!' },
};

export function useSun() {
  const [sun, setSun] = useState<SunReport | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchLiveSun()
      .then((r) => alive && setSun(r))
      .catch(() => {
        if (!alive) return;
        setError(true);
        setSun(archivedSun());
      });
    return () => {
      alive = false;
    };
  }, []);

  return { sun, error };
}

export function TitleScreen({
  sun,
  sunError,
  onStart,
  onScience,
}: {
  sun: SunReport | null;
  sunError: boolean;
  onStart: (site: SiteId) => void;
  onScience: () => void;
}) {
  const [showGlossary, setShowGlossary] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  const toggleSound = () => {
    setSoundOn(!soundOn);
    if (!soundOn && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance('Audio enabled');
      window.speechSynthesis.speak(u);
    }
  };

  const mars = SITES.mars;
  const moon = SITES.moon;
  const flareCount = sun ? sun.flareCount : 5;
  const strongest = sun?.strongestFlare?.classType || 'M4.2';
  const mood = sun ? sun.mood : 'active';
  const moodTitle = mood === 'stormy' ? 'Stormy' : mood === 'active' ? 'Active' : 'Calm';

  return (
    <div className="title-screen-wrap">
      {/* 1. Top Bar */}
      <header className="title-top-bar">
        <div className="top-challenge-tag">
          <span>🚀 NASA Space Apps Challenge · Ages 7–12</span>
        </div>

        <div className="top-action-buttons">
          <button
            className="title-tool-btn"
            onClick={() => setShowGlossary(true)}
            title="Read kid-friendly space words"
          >
            📖 Space Glossary for Kids
          </button>
          <button
            className="title-tool-btn"
            onClick={onScience}
            title="Inspect authentic NASA datasets"
          >
            🔬 The real NASA science behind this game
          </button>
          <button
            className="title-tool-btn icon-circle"
            onClick={toggleSound}
            aria-label="Toggle Sound"
            title={soundOn ? 'Sound On' : 'Sound Muted'}
          >
            {soundOn ? '🔊' : '🔇'}
          </button>
        </div>
      </header>

      {/* 2. Main Hero Section */}
      <div className="title-hero-center">
        <div className="hero-rocket-icon" aria-hidden>
          🚀
        </div>
        <h1 className="hero-main-title">
          Junior Astronaut <span className="highlight-yellow">Mission</span>{' '}
          <span className="highlight-cyan">Trainer</span>
        </h1>
        <p className="hero-subtitle">
          Every choice has a cost. Can you keep your crew safe for 12 days?
        </p>
      </div>

      {/* 3. Three-Card Selection Grid (Image 1 Match) */}
      <div className="title-cards-grid">
        {/* Card 1: Mars Outpost */}
        <div className="selection-card card-mars">
          {/* Visual Banner */}
          <div className="card-illustration-banner banner-mars">
            <svg viewBox="0 0 320 120" className="banner-svg" aria-hidden>
              <rect width="320" height="120" fill="#2d120a" />
              <circle cx="50" cy="35" r="16" fill="#facc15" />
              <polygon points="0,85 70,55 160,80 240,50 320,85 320,120 0,120" fill="#7c2d12" />
              <polygon points="0,95 110,75 220,100 320,80 320,120 0,120" fill="#c2410c" />
              {/* Habitat Dome */}
              <path d="M 120,105 A 35,30 0 0,1 190,105 Z" fill="#e0f2fe" stroke="#334155" strokeWidth="2" />
              <rect x="145" y="85" width="20" height="14" rx="3" fill="#38bdf8" />
              {/* Rover */}
              <g transform="translate(240, 88)">
                <rect x="0" y="4" width="26" height="12" rx="3" fill="#f8fafc" />
                <circle cx="4" cy="18" r="4" fill="#334155" />
                <circle cx="13" cy="18" r="4" fill="#334155" />
                <circle cx="22" cy="18" r="4" fill="#334155" />
                <rect x="6" y="0" width="14" height="5" rx="1" fill="#38bdf8" />
              </g>
            </svg>
          </div>

          <div className="card-body">
            <div className="card-tag tag-mars">🔴 RED PLANET · OUTPOST 01</div>
            <h2 className="card-title">Mars Outpost – Jezero Crater</h2>
            <p className="card-desc">
              Rusty red canyon with swirling dust storms and 1-day radio delay.
            </p>

            <ul className="card-bullets">
              <li>
                <span className="bullet-icon">🌪️</span>
                <span><strong>Dust Storms:</strong> Cut solar sunlight power</span>
              </li>
              <li>
                <span className="bullet-icon">📡</span>
                <span><strong>Radio Delay:</strong> Messages arrive 1 day late</span>
              </li>
            </ul>

            <div className="crew-indicator">
              <span className="crew-avatar">👨‍🚀</span>
              <span className="crew-avatar">👩‍🚀</span>
              <span className="crew-avatar">🧑‍🚀</span>
              <span className="crew-text">3-Astronaut Crew</span>
            </div>

            <button
              id="launch-mars-btn"
              className="launch-btn btn-launch-mars"
              onClick={() => onStart('mars')}
            >
              🚀 Launch to Mars
            </button>
          </div>
        </div>

        {/* Card 2: Moon Base */}
        <div className="selection-card card-moon">
          {/* Visual Banner */}
          <div className="card-illustration-banner banner-moon">
            <svg viewBox="0 0 320 120" className="banner-svg" aria-hidden>
              <rect width="320" height="120" fill="#040814" />
              {/* Stars */}
              <circle cx="30" cy="20" r="1.5" fill="#f8fafc" />
              <circle cx="90" cy="40" r="1.2" fill="#bae6fd" />
              <circle cx="210" cy="15" r="1.8" fill="#fef08a" />
              <circle cx="280" cy="30" r="1.4" fill="#f8fafc" />
              {/* Earth in sky */}
              <g transform="translate(280, 35)">
                <circle cx="0" cy="0" r="16" fill="#0284c7" />
                <path d="M-8,-6 C-4,-10 6,-6 8,-2 C10,4 4,10 -2,8 C-10,7 -12,0 -8,-6 Z" fill="#22c55e" opacity="0.8" />
                <circle cx="0" cy="0" r="17" fill="none" stroke="#7dd3fc" strokeWidth="1" opacity="0.6" />
              </g>
              {/* Lunar Crater Rim */}
              <polygon points="0,85 80,55 170,80 250,55 320,80 320,120 0,120" fill="#1e293b" />
              <polygon points="0,95 100,75 210,95 320,85 320,120 0,120" fill="#334155" />
              {/* Habitat Dome */}
              <path d="M 180,105 A 35,30 0 0,1 250,105 Z" fill="#f1f5f9" stroke="#1e293b" strokeWidth="2" />
              <rect x="205" y="85" width="20" height="14" rx="3" fill="#38bdf8" />
              {/* Waving Astronaut */}
              <g transform="translate(130, 78)">
                <rect x="0" y="8" width="12" height="16" rx="4" fill="#f8fafc" stroke="#1e293b" strokeWidth="1.5" />
                <circle cx="6" cy="6" r="6" fill="#f8fafc" stroke="#1e293b" strokeWidth="1.5" />
                <ellipse cx="7" cy="6" rx="4" ry="3" fill="#f59e0b" />
                <line x1="3" y1="24" x2="2" y2="34" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />
                <line x1="9" y1="24" x2="10" y2="34" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />
                <line x1="12" y1="12" x2="18" y2="4" stroke="#f8fafc" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="19" cy="3" r="2" fill="#38bdf8" />
              </g>
            </svg>
          </div>

          <div className="card-body">
            <div className="card-tag tag-moon">🌕 ARTEMIS POLE · OUTPOST 02</div>
            <h2 className="card-title">Moon Base – Lunar South Pole</h2>
            <p className="card-desc">
              Silver crater rim with a long dark lunar night and instant Earth radio.
            </p>

            <ul className="card-bullets">
              <li>
                <span className="bullet-icon">🌑</span>
                <span><strong>Dark Lunar Night:</strong> 3 days of low sunlight</span>
              </li>
              <li>
                <span className="bullet-icon">⚡</span>
                <span><strong>Instant Radio:</strong> Earth messages arrive right away</span>
              </li>
            </ul>

            <div className="crew-indicator">
              <span className="crew-avatar">👨‍🚀</span>
              <span className="crew-avatar">👩‍🚀</span>
              <span className="crew-avatar">🧑‍🚀</span>
              <span className="crew-text">3-Astronaut Crew</span>
            </div>

            <button
              id="launch-moon-btn"
              className="launch-btn btn-launch-moon"
              onClick={() => onStart('moon')}
            >
              🚀 Launch to Moon
            </button>
          </div>
        </div>

        {/* Card 3: Today's Real Sun */}
        <div className="selection-card card-sun">
          <div className="sun-card-header">
            <div className="sun-head-left">
              <span className="sun-header-icon">☀️</span>
              <strong>Today’s real Sun</strong>
            </div>
            <span className="badge-live-nasa">🔴 LIVE NASA DATA</span>
          </div>

          <div className="sun-graphic-area">
            {/* Smiling Sun Vector */}
            <div className="cute-sun-svg-box">
              <svg viewBox="0 0 100 100" className="cute-sun-svg" aria-hidden>
                {/* Rays */}
                <g stroke="#f59e0b" strokeWidth="4" strokeLinecap="round">
                  <line x1="50" y1="12" x2="50" y2="4" />
                  <line x1="50" y1="88" x2="50" y2="96" />
                  <line x1="12" y1="50" x2="4" y2="50" />
                  <line x1="88" y1="50" x2="96" y2="50" />
                  <line x1="23" y1="23" x2="16" y2="16" />
                  <line x1="77" y1="77" x2="84" y2="84" />
                  <line x1="23" y1="77" x2="16" y2="84" />
                  <line x1="77" y1="23" x2="84" y2="16" />
                </g>
                {/* Sun Body */}
                <circle cx="50" cy="50" r="30" fill="#facc15" stroke="#f59e0b" strokeWidth="2" />
                {/* Cute Smiling Face */}
                <circle cx="41" cy="46" r="3.5" fill="#1e293b" />
                <circle cx="59" cy="46" r="3.5" fill="#1e293b" />
                <circle cx="42" cy="44.5" r="1" fill="#fff" />
                <circle cx="60" cy="44.5" r="1" fill="#fff" />
                {/* Rosy Cheeks */}
                <ellipse cx="34" cy="53" rx="4" ry="2.5" fill="#f87171" opacity="0.65" />
                <ellipse cx="66" cy="53" rx="4" ry="2.5" fill="#f87171" opacity="0.65" />
                {/* Happy Mouth */}
                <path d="M 43,54 Q 50,62 57,54" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>

            <div className={`sun-mood-pill mood-pill-${mood}`}>
              Sun Mood: {moodTitle}
            </div>
          </div>

          <div className="sun-stats-two-col">
            <div className="sun-stat-pod">
              <span className="pod-label">Flares This Week</span>
              <strong className="pod-val">{flareCount}</strong>
            </div>
            <div className="sun-stat-pod">
              <span className="pod-label">Strongest Flare</span>
              <strong className="pod-val">{strongest}</strong>
            </div>
          </div>

          <p className="sun-card-narrative">
            The Sun released {flareCount} M-class solar flares in NASA's recent weekly snapshot. Astronauts keep their shields ready!
          </p>

          <div className="sun-card-footer">
            <span>Source: NASA DONKI Space Weather</span>
            <small>Latest recorded event: {sun?.checkedAt ? sun.checkedAt.slice(0, 10) : '2026-02-14'}</small>
          </div>
        </div>
      </div>

      {/* Space Glossary Modal for Kids */}
      <GlossaryModal isOpen={showGlossary} onClose={() => setShowGlossary(false)} />
    </div>
  );
}
