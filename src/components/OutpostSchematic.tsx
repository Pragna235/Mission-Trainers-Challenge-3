import React, { useState } from 'react';
import type { Allocation, GameState } from '../engine/game';
import { SITES } from '../engine/sites';

interface OutpostSchematicProps {
  game: GameState;
  alloc: Allocation;
}

export function OutpostSchematic({ game, alloc }: OutpostSchematicProps) {
  const [activeBubble, setActiveBubble] = useState<string | null>(null);
  const site = SITES[game.site];
  const night = Boolean(site.nightStartSol && game.sol >= site.nightStartSol);
  const dust = game.plan.some(
    (e) => e.kind === 'dustStorm' && game.sol >= e.sol && game.sol < e.sol + (e.length ?? 0)
  );
  const storm = game.plan.some(
    (e) => e.kind === 'radiationStorm' && e.sol === game.sol
  );

  const shieldActive = alloc.shield > 0;
  const shieldOpacity = Math.min(0.9, 0.25 + alloc.shield * 0.2);
  const greenhouseActive = alloc.greenhouse > 0;
  const greenhouseGlow = Math.min(1, 0.35 + alloc.greenhouse * 0.25);
  const lifeActive = alloc.life >= 3;

  const toggleBubble = (mod: string) => {
    setActiveBubble((prev) => (prev === mod ? null : mod));
  };

  return (
    <div className={`outpost-schematic-wrap schematic-hero-large ${game.site === 'moon' ? 'theme-moon' : 'theme-mars'}`}>
      <div className="schematic-hud">
        <span className="schematic-badge">
          {game.site === 'moon' ? '🌕 SHACKLETON CRATER RIM (89.9°S)' : '🔴 JEZERO CRATER DELTA (18.4°N)'}
        </span>
        <div className="schematic-hud-right">
          {storm && <span className="schematic-warning animate-pulse">⚡ SOLAR STORM INCOMING!</span>}
          {dust && <span className="schematic-warning">🌪️ REGIONAL DUST STORM!</span>}
          {night && <span className="schematic-warning">🌑 LUNAR NIGHT (3 SOLS)!</span>}
          <span className="schematic-hint">💡 Tap any module for info!</span>
        </div>
      </div>

      {/* Interactive Speech Bubble Popup when player clicks a building */}
      {activeBubble && (
        <div className="module-speech-bubble" role="dialog" aria-label="Module Details">
          <button className="bubble-close-x" onClick={() => setActiveBubble(null)}>✕</button>
          {activeBubble === 'shield' && (
            <div>
              <strong>🛡️ Active Forcefield Shield Dome</strong>
              <p>Allocated: {alloc.shield} cells. Blocks {alloc.shield ? (alloc.shield >= 3 ? '95%' : alloc.shield === 2 ? '80%' : '50%') : '0%'} of harmful solar radiation. Keep this powered when storms hit!</p>
            </div>
          )}
          {activeBubble === 'greenhouse' && (
            <div>
              <strong>🌱 CSA Hydroponic Bio-Dome</strong>
              <p>Allocated: {alloc.greenhouse} cells. Growing dwarf wheat & red romaine lettuce. 2+ cells produce fresh meals in 3 days AND make extra oxygen!</p>
            </div>
          )}
          {activeBubble === 'hab' && (
            <div>
              <strong>🏠 Crew Habitat & ECLSS Life Support</strong>
              <p>Allocated: {alloc.life} cells. Needs 3 cells (1 per astronaut) to keep cabin air steady. Air is at {game.air}%, Crew Health is at {game.health}%.</p>
            </div>
          )}
          {activeBubble === 'solar' && (
            <div>
              <strong>☀️ Solar Array Bank & Batteries</strong>
              <p>Harvesting sunlight! Stored Battery: {game.battery}/{site.batteryMax} cells. Unused sun charges your batteries for dark nights and dust storms.</p>
            </div>
          )}
          {activeBubble === 'comms' && (
            <div>
              <strong>📡 Deep Space Radio Dish</strong>
              <p>Allocated: {alloc.science} cells. {site.commsDelaySols ? 'Mars speed-of-light delay: radio messages take 1 sol to arrive!' : 'Moon 1.3-second instant link to Houston!'}</p>
            </div>
          )}
        </div>
      )}

      <svg
        viewBox="0 0 900 280"
        className="schematic-svg"
        role="img"
        aria-label="Interactive Space Outpost Playground"
      >
        <defs>
          <linearGradient id="skyGradMoon" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#030712" />
            <stop offset="50%" stopColor="#0b1329" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          <linearGradient id="skyGradMars" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={dust ? '#431407' : '#1c0f0a'} />
            <stop offset="55%" stopColor={dust ? '#7c2d12' : '#451a03'} />
            <stop offset="100%" stopColor={dust ? '#b45309' : '#9a3412'} />
          </linearGradient>

          <radialGradient id="shieldGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(56, 189, 248, 0.05)" />
            <stop offset="75%" stopColor={`rgba(56, 189, 248, ${shieldOpacity * 0.4})`} />
            <stop offset="100%" stopColor={`rgba(14, 165, 233, ${shieldOpacity})`} />
          </radialGradient>

          <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="40%" stopColor={storm ? '#f97316' : '#facc15'} />
            <stop offset="100%" stopColor="rgba(249, 115, 22, 0)" />
          </radialGradient>
        </defs>

        {/* Sky Background */}
        <rect
          x="0"
          y="0"
          width="900"
          height="280"
          fill={game.site === 'moon' ? 'url(#skyGradMoon)' : 'url(#skyGradMars)'}
        />

        {/* Twinkling Starfield */}
        <g opacity={game.site === 'moon' ? 0.85 : 0.4}>
          <circle cx="70" cy="30" r="1.6" fill="#f8fafc" />
          <circle cx="160" cy="55" r="1.2" fill="#bae6fd" />
          <circle cx="290" cy="25" r="1.9" fill="#fef08a" />
          <circle cx="440" cy="40" r="1.3" fill="#f8fafc" />
          <circle cx="580" cy="22" r="1.7" fill="#bae6fd" />
          <circle cx="720" cy="48" r="1.5" fill="#f8fafc" />
          <circle cx="840" cy="28" r="1.8" fill="#fef08a" />
        </g>

        {/* Earth in sky */}
        {game.site === 'moon' ? (
          <g transform="translate(130, 65)">
            <circle cx="0" cy="0" r="26" fill="#0284c7" />
            <path
              d="M-13,-11 C-6,-17 9,-9 13,-3 C17,5 7,16 -3,14 C-15,13 -18,0 -13,-11 Z"
              fill="#22c55e"
              opacity="0.85"
            />
            <circle cx="0" cy="0" r="27" fill="none" stroke="#7dd3fc" strokeWidth="1.5" opacity="0.6" />
            <text x="0" y="42" textAnchor="middle" fill="#bae6fd" fontSize="11" fontWeight="700">
              EARTH (1.3s Link)
            </text>
          </g>
        ) : (
          <g transform="translate(120, 55)">
            <circle cx="0" cy="0" r="7" fill="#38bdf8" />
            <circle cx="0" cy="0" r="16" fill="none" stroke="#38bdf8" strokeDasharray="3 3" opacity="0.5" />
            <text x="0" y="32" textAnchor="middle" fill="#fdba74" fontSize="10" fontWeight="700">
              EARTH (18m delay!)
            </text>
          </g>
        )}

        {/* Sun (or hidden during lunar night) */}
        {!night && (
          <g transform="translate(790, 60)">
            <circle cx="0" cy="0" r={storm ? 58 : 42} fill="url(#sunGrad)" />
            <circle cx="0" cy="0" r="18" fill="#fffbeb" />
            {storm && (
              <text x="0" y="36" textAnchor="middle" fill="#f97316" fontSize="11" fontWeight="800">
                SOLAR FLARE!
              </text>
            )}
          </g>
        )}

        {/* Storm particle streaks */}
        {storm && (
          <g stroke="#f97316" strokeWidth="2.2" strokeDasharray="8 6" opacity="0.85">
            <line x1="750" y1="75" x2="560" y2="160" />
            <line x1="770" y1="95" x2="480" y2="185" />
            <line x1="740" y1="55" x2="380" y2="155" />
          </g>
        )}

        {/* Crater / Mountains */}
        {game.site === 'moon' ? (
          <>
            <polygon
              points="0,210 100,145 220,195 360,135 510,200 660,145 800,185 900,155 900,280 0,280"
              fill="#1e293b"
            />
            <rect x="0" y="212" width="900" height="68" fill="#334155" />
            <ellipse cx="230" cy="245" rx="40" ry="12" fill="#1e293b" opacity="0.6" />
            <ellipse cx="710" cy="255" rx="50" ry="14" fill="#1e293b" opacity="0.6" />
          </>
        ) : (
          <>
            <polygon
              points="0,210 120,140 250,190 400,130 560,195 720,140 840,180 900,150 900,280 0,280"
              fill="#7c2d12"
            />
            <rect x="0" y="212" width="900" height="68" fill="#b45309" />
            <ellipse cx="220" cy="245" rx="45" ry="12" fill="#7c2d12" opacity="0.6" />
            <ellipse cx="720" cy="255" rx="55" ry="15" fill="#7c2d12" opacity="0.6" />
          </>
        )}

        {/* INTERACTIVE MODULE 1: SHIELD DOME */}
        <g
          className="clickable-interactive-module"
          onClick={() => toggleBubble('shield')}
        >
          {shieldActive && (
            <>
              <ellipse
                cx="460"
                cy="215"
                rx="290"
                ry="105"
                fill="url(#shieldGrad)"
                stroke="#38bdf8"
                strokeWidth={2 + alloc.shield * 1.2}
              />
              <rect x="365" y="115" width="190" height="24" rx="12" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
              <text x="460" y="131" textAnchor="middle" fill="#7dd3fc" fontSize="11" fontWeight="800">
                🛡️ SHIELD DOME ({alloc.shield} cells)
              </text>
            </>
          )}
          {!shieldActive && (
            <text x="460" y="140" textAnchor="middle" fill="#94a3b8" fontSize="10.5" opacity="0.6">
              (Shield Offline — Tap to Inspect)
            </text>
          )}
        </g>

        {/* INTERACTIVE MODULE 2: SOLAR PANELS */}
        <g
          transform="translate(210, 160)"
          className="clickable-interactive-module"
          onClick={() => toggleBubble('solar')}
        >
          <rect x="36" y="28" width="7" height="42" fill="#94a3b8" />
          <polygon
            points="0,14 84,0 77,40 -7,54"
            fill={dust || night ? '#475569' : '#0284c7'}
            stroke="#f8fafc"
            strokeWidth="1.8"
          />
          <line x1="28" y1="9" x2="22" y2="48" stroke="#7dd3fc" strokeWidth="1.5" />
          <line x1="56" y1="5" x2="50" y2="44" stroke="#7dd3fc" strokeWidth="1.5" />
          <rect x="18" y="72" width="46" height="20" rx="6" fill="#020617" stroke="#facc15" strokeWidth="1.5" />
          <text x="41" y="86" textAnchor="middle" fill="#facc15" fontSize="10.5" fontWeight="800">
            ⚡ SOLAR
          </text>
        </g>

        {/* INTERACTIVE MODULE 3: HABITAT & ECLSS */}
        <g
          transform="translate(365, 155)"
          className="clickable-interactive-module"
          onClick={() => toggleBubble('hab')}
        >
          <rect x="-30" y="36" width="220" height="18" fill="#64748b" />
          <rect
            x="0"
            y="10"
            width="145"
            height="64"
            rx="20"
            fill="#f1f5f9"
            stroke="#334155"
            strokeWidth="3"
          />
          <circle cx="38" cy="42" r="12" fill={lifeActive ? '#38bdf8' : '#f97316'} stroke="#1e293b" strokeWidth="2.5" />
          <circle cx="72" cy="42" r="12" fill={lifeActive ? '#38bdf8' : '#f97316'} stroke="#1e293b" strokeWidth="2.5" />
          <circle cx="106" cy="42" r="12" fill={lifeActive ? '#38bdf8' : '#f97316'} stroke="#1e293b" strokeWidth="2.5" />
          <rect x="22" y="78" width="102" height="20" rx="10" fill="#020617" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="73" y="92" textAnchor="middle" fill="#bae6fd" fontSize="10.5" fontWeight="800">
            🏠 HAB (O₂ {game.air}%)
          </text>
        </g>

        {/* INTERACTIVE MODULE 4: CSA GREENHOUSE DOME */}
        <g
          transform="translate(540, 165)"
          className="clickable-interactive-module"
          onClick={() => toggleBubble('greenhouse')}
        >
          <path
            d="M 0,60 A 52,48 0 0,1 104,60 Z"
            fill={`rgba(16, 185, 129, ${greenhouseActive ? 0.28 + greenhouseGlow * 0.3 : 0.08})`}
            stroke="#10b981"
            strokeWidth="2.5"
          />
          {greenhouseActive && (
            <line x1="24" y1="30" x2="80" y2="30" stroke="#f43f5e" strokeWidth={1.8 + alloc.greenhouse * 1.2} />
          )}
          <g transform="translate(16, 40)">
            {[0, 18, 36, 54].map((x, i) => (
              <g key={i} transform={`translate(${x}, 0)`}>
                <rect x="2" y={greenhouseActive ? 2 : 8} width="6" height={greenhouseActive ? 16 : 10} rx="3" fill={greenhouseActive ? '#22c55e' : '#71717a'} />
                <circle cx="5" cy={greenhouseActive ? 1 : 7} r="4" fill={greenhouseActive ? '#22c55e' : '#71717a'} />
              </g>
            ))}
          </g>
          <rect x="-4" y="58" width="112" height="10" rx="3" fill="#334155" />
          <rect x="12" y="72" width="80" height="20" rx="10" fill="#020617" stroke="#10b981" strokeWidth="1.5" />
          <text x="52" y="86" textAnchor="middle" fill="#6ee7b7" fontSize="10.5" fontWeight="800">
            🌱 CROPS
          </text>
        </g>

        {/* INTERACTIVE MODULE 5: DEEP SPACE COMMS */}
        <g
          transform="translate(685, 175)"
          className="clickable-interactive-module"
          onClick={() => toggleBubble('comms')}
        >
          <line x1="22" y1="50" x2="22" y2="24" stroke="#94a3b8" strokeWidth="3.5" />
          <path d="M 6,16 Q 22,34 38,12" fill="none" stroke="#f8fafc" strokeWidth="3" />
          <line x1="22" y1="22" x2="11" y2="6" stroke="#818cf8" strokeWidth="2" />
          {alloc.science > 0 && <circle cx="10" cy="5" r="3.5" fill="#818cf8" />}
          <rect x="-4" y="56" width="60" height="18" rx="9" fill="#020617" stroke="#818cf8" strokeWidth="1.2" />
          <text x="26" y="69" textAnchor="middle" fill="#c7d2fe" fontSize="9.5" fontWeight="800">
            📡 COMMS
          </text>
        </g>

        {/* Cute Astronaut walking outside */}
        <g
          transform="translate(320, 205)"
          className="clickable-interactive-module"
          onClick={() => toggleBubble('hab')}
        >
          <rect x="0" y="8" width="14" height="18" rx="5" fill="#f8fafc" stroke="#334155" strokeWidth="1.8" />
          <circle cx="7" cy="6" r="7.5" fill="#f8fafc" stroke="#334155" strokeWidth="1.8" />
          <ellipse cx="8.5" cy="6" rx="4.5" ry="4" fill="#f59e0b" />
          <line x1="4" y1="26" x2="3" y2="36" stroke="#f8fafc" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="10" y1="26" x2="11" y2="36" stroke="#f8fafc" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="14" y1="12" x2="20" y2="4" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />
          <circle cx="21" cy="3" r="2.5" fill="#38bdf8" />
        </g>

        {/* Dust Storm Filter */}
        {dust && (
          <rect x="0" y="0" width="900" height="280" fill="rgba(194, 65, 12, 0.28)" pointerEvents="none" />
        )}
      </svg>
    </div>
  );
}
