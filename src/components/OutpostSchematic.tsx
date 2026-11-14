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
  const shieldOpacity = Math.min(0.9, 0.22 + alloc.shield * 0.22);
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
          <span className="schematic-hint">💡 Tap modules or astronauts for info!</span>
        </div>
      </div>

      {/* Interactive Speech Bubble Popup when player clicks a building or astronaut */}
      {activeBubble && (
        <div className="module-speech-bubble" role="dialog" aria-label="Module Details">
          <button className="bubble-close-x" onClick={() => setActiveBubble(null)}>✕</button>
          
          {/* Module Dialogs */}
          {activeBubble === 'shield' && (
            <div>
              <strong>🛡️ Active Forcefield Shield Dome</strong>
              <p>Allocated: {alloc.shield} cells. Blocks {alloc.shield ? (alloc.shield >= 3 ? '95%' : alloc.shield === 2 ? '80%' : '50%') : '0%'} of harmful solar radiation. Keep this powered when storms hit!</p>
            </div>
          )}
          {activeBubble === 'greenhouse' && (
            <div>
              <strong>🌱 CSA Hydroponic Bio-Dome</strong>
              <p>Allocated: {alloc.greenhouse} cells. Growing dwarf wheat & red romaine lettuce. 2+ cells produce fresh meals in 3 days AND generate extra cabin oxygen!</p>
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
          {activeBubble === 'rover' && (
            <div>
              <strong>🚜 Artemis Pressurized Rover 01</strong>
              <p>Autonomous surface exploration rover. Equipped with ground-penetrating radar, rock drill, and life support emergency backup.</p>
            </div>
          )}

          {/* Astronaut Crew Dialogs */}
          {activeBubble === 'commander' && (
            <div>
              <strong>👩‍🚀 Commander Maya Chen · Mission Commander</strong>
              <p>"All systems check nominal, Commander! ECLSS cabin oxygen is steady at {game.air}%. I'm monitoring our battery storage reserves for upcoming Sol cycles."</p>
            </div>
          )}
          {activeBubble === 'engineer' && (
            <div>
              <strong>👨‍🚀 Engineer Sam Rivera · Power & EVA Specialist</strong>
              <p>"Inspecting the solar array solar tracking motors and high-voltage power conduits! Making sure every kilowatt reaches our batteries."</p>
            </div>
          )}
          {activeBubble === 'botanist' && (
            <div>
              <strong>🧑‍🚀 Botanist Leo Tanaka · Life Support & Crops</strong>
              <p>"Checking the automated nutrient flow in our CSA hydroponics bays. Fresh lettuce and dwarf wheat are synthesizing oxygen under our LED lights!"</p>
            </div>
          )}
          {activeBubble === 'scientist' && (
            <div>
              <strong>👩‍🚀 Dr. Alex Vance · Science Officer</strong>
              <p>"Calibrating the deep space radio dish and analyzing regolith core samples! We have generated {game.science} science points so far."</p>
            </div>
          )}
        </div>
      )}

      <svg
        viewBox="0 0 1200 340"
        className="schematic-svg"
        role="img"
        aria-label="Interactive Space Outpost Playground"
      >
        <defs>
          <linearGradient id="skyGradMoon" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#020617" />
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

        {/* Sky Background spanning entire 1200px width */}
        <rect
          x="0"
          y="0"
          width="1200"
          height="340"
          fill={game.site === 'moon' ? 'url(#skyGradMoon)' : 'url(#skyGradMars)'}
        />

        {/* Twinkling Starfield across 1200px */}
        <g opacity={game.site === 'moon' ? 0.85 : 0.45}>
          <circle cx="50" cy="35" r="1.6" fill="#f8fafc" />
          <circle cx="120" cy="65" r="1.2" fill="#bae6fd" />
          <circle cx="210" cy="30" r="1.8" fill="#fef08a" />
          <circle cx="340" cy="50" r="1.4" fill="#f8fafc" />
          <circle cx="480" cy="28" r="1.7" fill="#bae6fd" />
          <circle cx="620" cy="45" r="1.5" fill="#f8fafc" />
          <circle cx="750" cy="25" r="1.9" fill="#fef08a" />
          <circle cx="890" cy="55" r="1.3" fill="#bae6fd" />
          <circle cx="1020" cy="35" r="1.6" fill="#f8fafc" />
          <circle cx="1140" cy="60" r="1.4" fill="#fef08a" />
        </g>

        {/* Earth in sky */}
        {game.site === 'moon' ? (
          <g transform="translate(160, 75)">
            <circle cx="0" cy="0" r="30" fill="#0284c7" />
            <path
              d="M-15,-13 C-7,-20 10,-10 15,-4 C19,6 8,18 -4,16 C-17,15 -21,0 -15,-13 Z"
              fill="#22c55e"
              opacity="0.85"
            />
            <circle cx="0" cy="0" r="31" fill="none" stroke="#7dd3fc" strokeWidth="1.5" opacity="0.6" />
            <text x="0" y="48" textAnchor="middle" fill="#bae6fd" fontSize="11" fontWeight="700">
              EARTH (1.3s Link)
            </text>
          </g>
        ) : (
          <g transform="translate(150, 65)">
            <circle cx="0" cy="0" r="8" fill="#38bdf8" />
            <circle cx="0" cy="0" r="18" fill="none" stroke="#38bdf8" strokeDasharray="3 3" opacity="0.5" />
            <text x="0" y="34" textAnchor="middle" fill="#fdba74" fontSize="10" fontWeight="700">
              EARTH (18m delay!)
            </text>
          </g>
        )}

        {/* Sun on right side */}
        {!night && (
          <g transform="translate(1060, 70)">
            <circle cx="0" cy="0" r={storm ? 64 : 46} fill="url(#sunGrad)" />
            <circle cx="0" cy="0" r="20" fill="#fffbeb" />
            {storm && (
              <text x="0" y="42" textAnchor="middle" fill="#f97316" fontSize="12" fontWeight="800">
                SOLAR FLARE!
              </text>
            )}
          </g>
        )}

        {/* Storm particle streaks */}
        {storm && (
          <g stroke="#f97316" strokeWidth="2.2" strokeDasharray="8 6" opacity="0.85">
            <line x1="1020" y1="85" x2="780" y2="180" />
            <line x1="1040" y1="105" x2="680" y2="210" />
            <line x1="1000" y1="65" x2="520" y2="175" />
          </g>
        )}

        {/* Terrain and Mountain Range stretching edge-to-edge (0 to 1200) */}
        {game.site === 'moon' ? (
          <>
            <polygon
              points="0,250 140,175 300,230 480,160 680,235 880,170 1060,220 1200,185 1200,340 0,340"
              fill="#1e293b"
            />
            <rect x="0" y="248" width="1200" height="92" fill="#334155" />
            <ellipse cx="280" cy="290" rx="55" ry="16" fill="#1e293b" opacity="0.6" />
            <ellipse cx="940" cy="300" rx="65" ry="18" fill="#1e293b" opacity="0.6" />
          </>
        ) : (
          <>
            <polygon
              points="0,250 160,170 340,225 540,155 760,230 960,165 1100,215 1200,180 1200,340 0,340"
              fill="#7c2d12"
            />
            <rect x="0" y="248" width="1200" height="92" fill="#b45309" />
            <ellipse cx="280" cy="290" rx="60" ry="16" fill="#7c2d12" opacity="0.6" />
            <ellipse cx="960" cy="300" rx="70" ry="18" fill="#7c2d12" opacity="0.6" />
          </>
        )}

        {/* INTERACTIVE MODULE 1: ACTIVE FORCEFIELD SHIELD DOME */}
        <g
          className="clickable-interactive-module"
          onClick={() => toggleBubble('shield')}
        >
          {shieldActive && (
            <>
              <ellipse
                cx="610"
                cy="250"
                rx="420"
                ry="145"
                fill="url(#shieldGrad)"
                stroke="#38bdf8"
                strokeWidth={2.5 + alloc.shield * 1.5}
              />
              <rect x="495" y="115" width="230" height="26" rx="13" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.8" />
              <text x="610" y="133" textAnchor="middle" fill="#7dd3fc" fontSize="12" fontWeight="800">
                🛡️ SHIELD DOME ({alloc.shield} cells active)
              </text>
            </>
          )}
          {!shieldActive && (
            <text x="610" y="145" textAnchor="middle" fill="#94a3b8" fontSize="11" opacity="0.75">
              (Shield Offline — Tap to Inspect)
            </text>
          )}
        </g>

        {/* INTERACTIVE MODULE 2: SOLAR PANELS */}
        <g
          transform="translate(240, 185)"
          className="clickable-interactive-module"
          onClick={() => toggleBubble('solar')}
        >
          <rect x="44" y="32" width="9" height="48" fill="#94a3b8" />
          <polygon
            points="0,16 105,0 96,48 -9,64"
            fill={dust || night ? '#475569' : '#0284c7'}
            stroke="#f8fafc"
            strokeWidth="2"
          />
          <line x1="35" y1="11" x2="28" y2="56" stroke="#7dd3fc" strokeWidth="1.8" />
          <line x1="70" y1="6" x2="63" y2="51" stroke="#7dd3fc" strokeWidth="1.8" />
          <rect x="22" y="84" width="56" height="22" rx="7" fill="#020617" stroke="#facc15" strokeWidth="1.5" />
          <text x="50" y="99" textAnchor="middle" fill="#facc15" fontSize="11" fontWeight="800">
            ⚡ SOLAR
          </text>
        </g>

        {/* CREW MEMBER 1: Engineer Sam Rivera (Inspecting Solar Panels) */}
        <g
          transform="translate(330, 240)"
          className="clickable-interactive-module"
          onClick={() => toggleBubble('engineer')}
          aria-label="Engineer Sam Rivera"
        >
          <title>Engineer Sam Rivera</title>
          {/* Suit Body */}
          <rect x="0" y="10" width="16" height="20" rx="5" fill="#f8fafc" stroke="#334155" strokeWidth="1.8" />
          {/* Blue Mission Armband */}
          <rect x="0" y="15" width="4" height="6" fill="#3b82f6" />
          {/* Backpack (PLSS) */}
          <rect x="-6" y="12" width="6" height="15" rx="3" fill="#cbd5e1" stroke="#334155" strokeWidth="1.2" />
          {/* Helmet & Golden Visor */}
          <circle cx="8" cy="8" r="8.5" fill="#f8fafc" stroke="#334155" strokeWidth="1.8" />
          <ellipse cx="9.5" cy="8" rx="5" ry="4.5" fill="#f59e0b" />
          {/* Legs */}
          <line x1="4" y1="30" x2="3" y2="42" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
          <line x1="12" y1="30" x2="13" y2="42" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
          {/* Arms holding Diagnostic Tool */}
          <line x1="16" y1="14" x2="24" y2="18" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />
          <rect x="23" y="14" width="7" height="9" rx="1.5" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
          {/* Name Tag Pill */}
          <rect x="-10" y="46" width="36" height="14" rx="4" fill="#020617" stroke="#38bdf8" strokeWidth="1" />
          <text x="8" y="56" textAnchor="middle" fill="#7dd3fc" fontSize="8" fontWeight="800">
            SAM
          </text>
        </g>

        {/* INTERACTIVE MODULE 3: HABITAT & ECLSS LIFE SUPPORT */}
        <g
          transform="translate(430, 180)"
          className="clickable-interactive-module"
          onClick={() => toggleBubble('hab')}
        >
          <rect x="-35" y="42" width="270" height="20" fill="#64748b" />
          <rect
            x="0"
            y="12"
            width="170"
            height="74"
            rx="24"
            fill="#f1f5f9"
            stroke="#334155"
            strokeWidth="3.5"
          />
          {/* Illuminated Portholes with Crew Peeking Inside */}
          <g>
            <circle cx="44" cy="48" r="14" fill={lifeActive ? '#38bdf8' : '#f97316'} stroke="#1e293b" strokeWidth="2.5" />
            <circle cx="44" cy="46" r="5" fill="#f8fafc" opacity="0.8" />
            <ellipse cx="44" cy="46" rx="3" ry="2" fill="#0284c7" />

            <circle cx="85" cy="48" r="14" fill={lifeActive ? '#38bdf8' : '#f97316'} stroke="#1e293b" strokeWidth="2.5" />
            <circle cx="85" cy="46" r="5" fill="#f8fafc" opacity="0.8" />
            <ellipse cx="85" cy="46" rx="3" ry="2" fill="#0284c7" />

            <circle cx="126" cy="48" r="14" fill={lifeActive ? '#38bdf8' : '#f97316'} stroke="#1e293b" strokeWidth="2.5" />
            <circle cx="126" cy="46" r="5" fill="#f8fafc" opacity="0.8" />
            <ellipse cx="126" cy="46" rx="3" ry="2" fill="#0284c7" />
          </g>
          <rect x="25" y="90" width="120" height="22" rx="11" fill="#020617" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="85" y="105" textAnchor="middle" fill="#bae6fd" fontSize="11" fontWeight="800">
            🏠 HAB (O₂ {game.air}%)
          </text>
        </g>

        {/* CREW MEMBER 2: Commander Maya Chen (Standing Outside Hab Waving) */}
        <g
          transform="translate(615, 235)"
          className="clickable-interactive-module"
          onClick={() => toggleBubble('commander')}
          aria-label="Commander Maya Chen"
        >
          <title>Commander Maya Chen</title>
          {/* Suit Body */}
          <rect x="0" y="10" width="16" height="20" rx="5" fill="#f8fafc" stroke="#334155" strokeWidth="1.8" />
          {/* Red Commander Stripe */}
          <rect x="12" y="15" width="4" height="6" fill="#ef4444" />
          {/* Backpack (PLSS) */}
          <rect x="-6" y="12" width="6" height="15" rx="3" fill="#cbd5e1" stroke="#334155" strokeWidth="1.2" />
          {/* Helmet & Golden Visor */}
          <circle cx="8" cy="8" r="8.5" fill="#f8fafc" stroke="#334155" strokeWidth="1.8" />
          <ellipse cx="9.5" cy="8" rx="5" ry="4.5" fill="#f59e0b" />
          {/* Legs */}
          <line x1="4" y1="30" x2="3" y2="42" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
          <line x1="12" y1="30" x2="13" y2="42" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
          {/* Waving Arm */}
          <line x1="16" y1="16" x2="24" y2="6" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />
          <circle cx="25" cy="5" r="3" fill="#38bdf8" />
          {/* Name Tag Pill */}
          <rect x="-10" y="46" width="38" height="14" rx="4" fill="#020617" stroke="#ef4444" strokeWidth="1" />
          <text x="9" y="56" textAnchor="middle" fill="#fca5a5" fontSize="8" fontWeight="800">
            MAYA
          </text>
        </g>

        {/* CREW MEMBER 3: Botanist Leo Tanaka (At Greenhouse Door with Veggie Basket) */}
        <g
          transform="translate(680, 245)"
          className="clickable-interactive-module"
          onClick={() => toggleBubble('botanist')}
          aria-label="Botanist Leo Tanaka"
        >
          <title>Botanist Leo Tanaka</title>
          {/* Suit Body */}
          <rect x="0" y="10" width="16" height="20" rx="5" fill="#f8fafc" stroke="#334155" strokeWidth="1.8" />
          {/* Green Botanist Armband */}
          <rect x="0" y="15" width="4" height="6" fill="#10b981" />
          {/* Backpack (PLSS) */}
          <rect x="-6" y="12" width="6" height="15" rx="3" fill="#cbd5e1" stroke="#334155" strokeWidth="1.2" />
          {/* Helmet & Golden Visor */}
          <circle cx="8" cy="8" r="8.5" fill="#f8fafc" stroke="#334155" strokeWidth="1.8" />
          <ellipse cx="9.5" cy="8" rx="5" ry="4.5" fill="#f59e0b" />
          {/* Legs */}
          <line x1="4" y1="30" x2="3" y2="42" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
          <line x1="12" y1="30" x2="13" y2="42" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
          {/* Harvest Basket with Fresh Leaves */}
          <line x1="16" y1="18" x2="22" y2="24" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />
          <rect x="20" y="22" width="10" height="8" rx="2" fill="#b45309" />
          <circle cx="23" cy="21" r="2.5" fill="#22c55e" />
          <circle cx="27" cy="21" r="2.5" fill="#22c55e" />
          {/* Name Tag Pill */}
          <rect x="-10" y="46" width="34" height="14" rx="4" fill="#020617" stroke="#10b981" strokeWidth="1" />
          <text x="7" y="56" textAnchor="middle" fill="#6ee7b7" fontSize="8" fontWeight="800">
            LEO
          </text>
        </g>

        {/* INTERACTIVE MODULE 4: CSA GREENHOUSE DOME */}
        <g
          transform="translate(720, 190)"
          className="clickable-interactive-module"
          onClick={() => toggleBubble('greenhouse')}
        >
          <path
            d="M 0,70 A 62,56 0 0,1 124,70 Z"
            fill={`rgba(16, 185, 129, ${greenhouseActive ? 0.3 + greenhouseGlow * 0.3 : 0.08})`}
            stroke="#10b981"
            strokeWidth="3"
          />
          {greenhouseActive && (
            <line x1="28" y1="35" x2="96" y2="35" stroke="#f43f5e" strokeWidth={2 + alloc.greenhouse * 1.4} />
          )}
          <g transform="translate(18, 48)">
            {[0, 22, 44, 66, 88].map((x, i) => (
              <g key={i} transform={`translate(${x}, 0)`}>
                <rect x="2" y={greenhouseActive ? 2 : 10} width="7" height={greenhouseActive ? 18 : 10} rx="3" fill={greenhouseActive ? '#22c55e' : '#71717a'} />
                <circle cx="5.5" cy={greenhouseActive ? 1 : 9} r="4.5" fill={greenhouseActive ? '#22c55e' : '#71717a'} />
              </g>
            ))}
          </g>
          <rect x="-5" y="68" width="134" height="12" rx="4" fill="#334155" />
          <rect x="18" y="84" width="88" height="22" rx="11" fill="#020617" stroke="#10b981" strokeWidth="1.5" />
          <text x="62" y="99" textAnchor="middle" fill="#6ee7b7" fontSize="11" fontWeight="800">
            🌱 CROPS
          </text>
        </g>

        {/* CREW MEMBER 4: Dr. Alex Vance (Science Officer with Tablet) */}
        <g
          transform="translate(865, 240)"
          className="clickable-interactive-module"
          onClick={() => toggleBubble('scientist')}
          aria-label="Dr. Alex Vance"
        >
          <title>Dr. Alex Vance</title>
          {/* Suit Body */}
          <rect x="0" y="10" width="16" height="20" rx="5" fill="#f8fafc" stroke="#334155" strokeWidth="1.8" />
          {/* Purple Science Armband */}
          <rect x="12" y="15" width="4" height="6" fill="#a855f7" />
          {/* Backpack (PLSS) */}
          <rect x="-6" y="12" width="6" height="15" rx="3" fill="#cbd5e1" stroke="#334155" strokeWidth="1.2" />
          {/* Helmet & Golden Visor */}
          <circle cx="8" cy="8" r="8.5" fill="#f8fafc" stroke="#334155" strokeWidth="1.8" />
          <ellipse cx="9.5" cy="8" rx="5" ry="4.5" fill="#f59e0b" />
          {/* Legs */}
          <line x1="4" y1="30" x2="3" y2="42" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
          <line x1="12" y1="30" x2="13" y2="42" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
          {/* Hands holding Science Spectrometer */}
          <line x1="16" y1="16" x2="22" y2="20" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />
          <rect x="20" y="16" width="8" height="10" rx="2" fill="#7c3aed" stroke="#c084fc" strokeWidth="1" />
          {/* Name Tag Pill */}
          <rect x="-10" y="46" width="38" height="14" rx="4" fill="#020617" stroke="#c084fc" strokeWidth="1" />
          <text x="9" y="56" textAnchor="middle" fill="#e9d5ff" fontSize="8" fontWeight="800">
            ALEX
          </text>
        </g>

        {/* INTERACTIVE MODULE 5: DEEP SPACE COMMS DISH */}
        <g
          transform="translate(925, 200)"
          className="clickable-interactive-module"
          onClick={() => toggleBubble('comms')}
        >
          <line x1="26" y1="60" x2="26" y2="28" stroke="#94a3b8" strokeWidth="4" />
          <path d="M 6,18 Q 26,40 46,14" fill="none" stroke="#f8fafc" strokeWidth="3.5" />
          <line x1="26" y1="26" x2="14" y2="7" stroke="#818cf8" strokeWidth="2.5" />
          {alloc.science > 0 && <circle cx="13" cy="6" r="4" fill="#818cf8" />}
          <rect x="-4" y="66" width="68" height="20" rx="10" fill="#020617" stroke="#818cf8" strokeWidth="1.5" />
          <text x="30" y="80" textAnchor="middle" fill="#c7d2fe" fontSize="10" fontWeight="800">
            📡 COMMS
          </text>
        </g>

        {/* INTERACTIVE MODULE 6: ROVER VEHICLE */}
        <g
          transform="translate(390, 275)"
          className="clickable-interactive-module"
          onClick={() => toggleBubble('rover')}
          aria-label="Pressurized Rover 01"
        >
          <title>Pressurized Rover 01</title>
          <rect x="0" y="4" width="34" height="16" rx="4" fill="#f8fafc" stroke="#334155" strokeWidth="1.5" />
          <rect x="8" y="0" width="18" height="6" rx="1.5" fill="#38bdf8" />
          <circle cx="5" cy="21" r="5" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
          <circle cx="17" cy="21" r="5" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
          <circle cx="29" cy="21" r="5" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
        </g>

        {/* Dust Storm Filter */}
        {dust && (
          <rect x="0" y="0" width="1200" height="340" fill="rgba(194, 65, 12, 0.28)" pointerEvents="none" />
        )}
      </svg>
    </div>
  );
}
