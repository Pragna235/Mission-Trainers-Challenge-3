import React from 'react';
import type { Allocation, GameState } from '../engine/game';
import { SITES } from '../engine/sites';

interface OutpostSchematicProps {
  game: GameState;
  alloc: Allocation;
}

export function OutpostSchematic({ game, alloc }: OutpostSchematicProps) {
  const site = SITES[game.site];
  const night = Boolean(site.nightStartSol && game.sol >= site.nightStartSol);
  const dust = game.plan.some(
    (e) => e.kind === 'dustStorm' && game.sol >= e.sol && game.sol < e.sol + (e.length ?? 0)
  );
  const storm = game.plan.some(
    (e) => e.kind === 'radiationStorm' && e.sol === game.sol
  );

  const shieldActive = alloc.shield > 0;
  const shieldOpacity = Math.min(0.85, 0.2 + alloc.shield * 0.18);
  const greenhouseActive = alloc.greenhouse > 0;
  const greenhouseGlow = Math.min(1, 0.3 + alloc.greenhouse * 0.22);
  const lifeActive = alloc.life >= 3;

  return (
    <div className={`outpost-schematic-wrap ${game.site === 'moon' ? 'theme-moon' : 'theme-mars'}`}>
      <div className="schematic-hud">
        <span className="schematic-badge">
          {game.site === 'moon' ? '🌕 SHACKLETON CRATER RIM' : '🔴 JEZERO CRATER DELTA'}
        </span>
        {storm && <span className="schematic-warning">⚡ SOLAR FLARE ACTIVE!</span>}
        {dust && <span className="schematic-warning">🌪️ DUST STORM ACTIVE!</span>}
        {night && <span className="schematic-warning">🌑 LUNAR NIGHT!</span>}
      </div>

      <svg
        viewBox="0 0 800 200"
        className="schematic-svg"
        role="img"
        aria-label="Live Outpost Schematic"
      >
        <defs>
          <linearGradient id="skyGradMoon" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#030712" />
            <stop offset="60%" stopColor="#0b1329" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          <linearGradient id="skyGradMars" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={dust ? '#431407' : '#1c0f0a'} />
            <stop offset="70%" stopColor={dust ? '#7c2d12' : '#451a03'} />
            <stop offset="100%" stopColor={dust ? '#b45309' : '#9a3412'} />
          </linearGradient>

          <radialGradient id="shieldGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(56, 189, 248, 0.05)" />
            <stop offset="80%" stopColor={`rgba(56, 189, 248, ${shieldOpacity * 0.5})`} />
            <stop offset="100%" stopColor={`rgba(14, 165, 233, ${shieldOpacity})`} />
          </radialGradient>

          <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="40%" stopColor={storm ? '#f97316' : '#facc15'} />
            <stop offset="100%" stopColor="rgba(249, 115, 22, 0)" />
          </radialGradient>
        </defs>

        {/* Sky */}
        <rect
          x="0"
          y="0"
          width="800"
          height="200"
          fill={game.site === 'moon' ? 'url(#skyGradMoon)' : 'url(#skyGradMars)'}
        />

        {/* Stars */}
        <g opacity={game.site === 'moon' ? 0.8 : 0.4}>
          <circle cx="60" cy="25" r="1.5" fill="#f8fafc" />
          <circle cx="150" cy="45" r="1.2" fill="#bae6fd" />
          <circle cx="280" cy="20" r="1.8" fill="#fef08a" />
          <circle cx="420" cy="35" r="1.3" fill="#f8fafc" />
          <circle cx="560" cy="18" r="1.6" fill="#bae6fd" />
          <circle cx="710" cy="40" r="1.4" fill="#f8fafc" />
        </g>

        {/* Earth in the sky */}
        {game.site === 'moon' ? (
          <g transform="translate(100, 48)">
            <circle cx="0" cy="0" r="18" fill="#0284c7" />
            <path
              d="M-9,-8 C-4,-12 6,-6 9,-2 C12,4 5,12 -2,10 C-11,9 -13,0 -9,-8 Z"
              fill="#22c55e"
              opacity="0.85"
            />
            <circle cx="0" cy="0" r="19" fill="none" stroke="#7dd3fc" strokeWidth="1.2" opacity="0.6" />
            <text x="0" y="28" textAnchor="middle" fill="#bae6fd" fontSize="9" fontWeight="700">
              EARTH (1.3s)
            </text>
          </g>
        ) : (
          <g transform="translate(90, 42)">
            <circle cx="0" cy="0" r="5" fill="#38bdf8" />
            <circle cx="0" cy="0" r="12" fill="none" stroke="#38bdf8" strokeDasharray="2 3" opacity="0.5" />
            <text x="0" y="24" textAnchor="middle" fill="#fdba74" fontSize="8.5" fontWeight="700">
              EARTH (18m delay!)
            </text>
          </g>
        )}

        {/* Sun (or hidden during lunar night) */}
        {!night && (
          <g transform="translate(710, 45)">
            <circle cx="0" cy="0" r={storm ? 44 : 32} fill="url(#sunGrad)" />
            <circle cx="0" cy="0" r="14" fill="#fffbeb" />
            {storm && (
              <text x="0" y="26" textAnchor="middle" fill="#f97316" fontSize="9" fontWeight="800">
                SOLAR FLARE!
              </text>
            )}
          </g>
        )}

        {/* Storm particle streaks */}
        {storm && (
          <g stroke="#f97316" strokeWidth="1.8" strokeDasharray="6 4" opacity="0.8">
            <line x1="680" y1="55" x2="520" y2="120" />
            <line x1="695" y1="70" x2="450" y2="135" />
            <line x1="670" y1="40" x2="380" y2="115" />
          </g>
        )}

        {/* Crater / Terrain */}
        {game.site === 'moon' ? (
          <>
            <polygon
              points="0,150 90,105 200,140 330,95 470,145 610,105 740,135 800,115 800,200 0,200"
              fill="#1e293b"
            />
            <rect x="0" y="152" width="800" height="48" fill="#334155" />
          </>
        ) : (
          <>
            <polygon
              points="0,150 110,100 230,135 360,90 510,140 650,100 750,130 800,110 800,200 0,200"
              fill="#7c2d12"
            />
            <rect x="0" y="152" width="800" height="48" fill="#b45309" />
          </>
        )}

        {/* ACTIVE FORCEFIELD SHIELD DOME (Visual response to alloc.shield) */}
        {shieldActive && (
          <g>
            <ellipse
              cx="405"
              cy="155"
              rx="240"
              ry="75"
              fill="url(#shieldGrad)"
              stroke="#38bdf8"
              strokeWidth={1.5 + alloc.shield * 0.8}
            />
            <text x="405" y="90" textAnchor="middle" fill="#7dd3fc" fontSize="9.5" fontWeight="800">
              SHIELD ACTIVE ({alloc.shield} cells)
            </text>
          </g>
        )}

        {/* Solar Panels & Battery Wing */}
        <g transform="translate(195, 115)">
          <rect x="28" y="20" width="5" height="30" fill="#94a3b8" />
          <polygon
            points="0,10 60,0 55,30 -5,40"
            fill={dust || night ? '#475569' : '#0284c7'}
            stroke="#e2e8f0"
            strokeWidth="1.2"
          />
          <line x1="20" y1="7" x2="16" y2="35" stroke="#7dd3fc" strokeWidth="1" />
          <line x1="40" y1="3" x2="36" y2="31" stroke="#7dd3fc" strokeWidth="1" />
          <text x="28" y="60" textAnchor="middle" fill="#facc15" fontSize="8.5" fontWeight="700">
            ☀️ PANELS
          </text>
        </g>

        {/* Main Crew Habitat (ECLSS) */}
        <g transform="translate(325, 110)">
          <rect x="-20" y="26" width="160" height="12" fill="#64748b" />
          <rect
            x="0"
            y="8"
            width="105"
            height="46"
            rx="14"
            fill="#f1f5f9"
            stroke="#334155"
            strokeWidth="2"
          />
          <circle cx="28" cy="30" r="8" fill={lifeActive ? '#38bdf8' : '#f97316'} stroke="#1e293b" strokeWidth="1.5" />
          <circle cx="52" cy="30" r="8" fill={lifeActive ? '#38bdf8' : '#f97316'} stroke="#1e293b" strokeWidth="1.5" />
          <circle cx="76" cy="30" r="8" fill={lifeActive ? '#38bdf8' : '#f97316'} stroke="#1e293b" strokeWidth="1.5" />
          <text x="52" y="65" textAnchor="middle" fill="#bae6fd" fontSize="8.5" fontWeight="700">
            🫧 HAB ({alloc.life} cells)
          </text>
        </g>

        {/* CSA Hydroponic Greenhouse Bio-Dome (Visual response to alloc.greenhouse) */}
        <g transform="translate(460, 118)">
          <path
            d="M 0,44 A 38,36 0 0,1 76,44 Z"
            fill={`rgba(16, 185, 129, ${greenhouseActive ? 0.25 + greenhouseGlow * 0.25 : 0.08})`}
            stroke="#10b981"
            strokeWidth="1.8"
          />
          {greenhouseActive && (
            <line x1="18" y1="22" x2="58" y2="22" stroke="#f43f5e" strokeWidth={1 + alloc.greenhouse * 0.8} />
          )}
          {/* Plants */}
          <g transform="translate(14, 30)">
            {[0, 12, 24, 36].map((x, i) => (
              <g key={i} transform={`translate(${x}, 0)`}>
                <rect x="1" y={greenhouseActive ? 2 : 6} width="4" height={greenhouseActive ? 12 : 8} rx="2" fill={greenhouseActive ? '#22c55e' : '#a1a1aa'} />
                <circle cx="3" cy={greenhouseActive ? 1 : 5} r="3" fill={greenhouseActive ? '#22c55e' : '#a1a1aa'} />
              </g>
            ))}
          </g>
          <rect x="-2" y="43" width="80" height="7" rx="2" fill="#334155" />
          <text x="38" y="58" textAnchor="middle" fill="#6ee7b7" fontSize="8.5" fontWeight="700">
            🌱 CROPS ({alloc.greenhouse} cells)
          </text>
        </g>

        {/* Comms Dish (Visual response to alloc.science) */}
        <g transform="translate(575, 125)">
          <line x1="16" y1="36" x2="16" y2="18" stroke="#94a3b8" strokeWidth="2.5" />
          <path d="M 4,12 Q 16,24 28,8" fill="none" stroke="#f8fafc" strokeWidth="2" />
          <line x1="16" y1="16" x2="8" y2="4" stroke="#818cf8" strokeWidth="1.5" />
          {alloc.science > 0 && <circle cx="7" cy="3" r="2.5" fill="#818cf8" />}
          <text x="16" y="50" textAnchor="middle" fill="#c7d2fe" fontSize="8.5" fontWeight="700">
            📡 COMMS ({alloc.science})
          </text>
        </g>

        {/* Cute Astronaut walking outside */}
        <g transform="translate(290, 150)">
          <rect x="0" y="6" width="10" height="14" rx="4" fill="#f8fafc" stroke="#334155" strokeWidth="1.2" />
          <circle cx="5" cy="4" r="5.5" fill="#f8fafc" stroke="#334155" strokeWidth="1.2" />
          <ellipse cx="6" cy="4" rx="3.5" ry="3" fill="#f59e0b" />
          <line x1="3" y1="20" x2="2" y2="28" stroke="#f8fafc" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="7" y1="20" x2="8" y2="28" stroke="#f8fafc" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="10" y1="10" x2="15" y2="4" stroke="#f8fafc" strokeWidth="2" strokeLinecap="round" />
          <circle cx="16" cy="3" r="1.8" fill="#38bdf8" />
        </g>

        {/* Dust storm overlay */}
        {dust && (
          <rect x="0" y="0" width="800" height="200" fill="rgba(194, 65, 12, 0.3)" pointerEvents="none" />
        )}
      </svg>
    </div>
  );
}
