import React from 'react';
import { MissionEventCard, MissionSiteId, PowerAllocation } from '../types/game';

interface OutpostVisualizerProps {
  site: MissionSiteId;
  day: number;
  totalDays: number;
  power: number;
  lifeSupport: number;
  health: number;
  cropHealth: number;
  radiationMsV: number;
  safeRadiationLimitMsV: number;
  allocation: PowerAllocation;
  currentEvent: MissionEventCard;
}

export const OutpostVisualizer: React.FC<OutpostVisualizerProps> = ({
  site,
  day,
  totalDays,
  power,
  lifeSupport,
  health,
  cropHealth,
  radiationMsV,
  safeRadiationLimitMsV,
  allocation,
  currentEvent
}) => {
  const isSolarStorm = currentEvent.category === 'solar-storm';
  const isDustOrShadow = currentEvent.category === 'environment';
  const shieldStrength = Math.min(1, allocation.shielding / 35);
  const greenhouseGlow = Math.min(1, allocation.greenhouse / 30);

  return (
    <div className={`outpost-stage ${site === 'moon' ? 'stage-moon' : 'stage-mars'}`}>
      <div className="stage-hud-overlay">
        <div className="stage-badge">
          <span className="status-dot" />
          <span>
            {site === 'moon' ? 'SHACKLETON CRATER RIM (89.9°S)' : 'JEZERO CRATER DELTA (18.4°N)'}
          </span>
        </div>
        <div className="stage-badge">
          <span>
            {site === 'moon' ? `LUNAR CYCLE ${day}/${totalDays}` : `MARTIAN SOL ${day}/${totalDays}`}
          </span>
        </div>
      </div>

      <svg
        viewBox="0 0 800 300"
        className="outpost-svg"
        role="img"
        aria-label={`Interactive ${site === 'moon' ? 'Lunar' : 'Martian'} Outpost Diagram`}
      >
        <defs>
          <linearGradient id="moonSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#060b14" />
            <stop offset="70%" stopColor="#0f1b2e" />
            <stop offset="100%" stopColor="#1b2838" />
          </linearGradient>
          <linearGradient id="marsSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isDustOrShadow ? '#5c2d16' : '#2d1610'} />
            <stop offset="65%" stopColor={isDustOrShadow ? '#9e471e' : '#6e2e1a'} />
            <stop offset="100%" stopColor="#b85a2a" />
          </linearGradient>
          <radialGradient id="shieldDomeGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(56, 189, 248, 0.02)" />
            <stop offset="75%" stopColor={`rgba(56, 189, 248, ${0.12 + shieldStrength * 0.25})`} />
            <stop offset="100%" stopColor={`rgba(14, 165, 233, ${0.35 + shieldStrength * 0.45})`} />
          </radialGradient>
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="45%" stopColor={isSolarStorm ? '#f97316' : '#facc15'} />
            <stop offset="100%" stopColor="rgba(249, 115, 22, 0)" />
          </radialGradient>
        </defs>

        {/* Sky Background */}
        <rect
          x="0"
          y="0"
          width="800"
          height="300"
          fill={site === 'moon' ? 'url(#moonSky)' : 'url(#marsSky)'}
        />

        {/* Stars */}
        <g opacity={site === 'moon' ? 0.85 : 0.35}>
          <circle cx="70" cy="40" r="1.4" fill="#e2e8f0" />
          <circle cx="155" cy="28" r="1.1" fill="#94a3b8" />
          <circle cx="240" cy="62" r="1.5" fill="#f8fafc" />
          <circle cx="420" cy="30" r="1.3" fill="#e2e8f0" />
          <circle cx="530" cy="52" r="1.6" fill="#cbd5e1" />
          <circle cx="630" cy="25" r="1.2" fill="#e2e8f0" />
          <circle cx="745" cy="48" r="1.5" fill="#f8fafc" />
        </g>

        {/* Earth in the Sky (Large on Moon, tiny pale blue dot on Mars with Comm Delay rings!) */}
        {site === 'moon' ? (
          <g transform="translate(115, 68)">
            <circle cx="0" cy="0" r="24" fill="#0284c7" />
            <path
              d="M-12,-10 C-4,-15 8,-8 12,-2 C15,5 6,14 -4,12 C-14,10 -16,0 -12,-10 Z"
              fill="#22c55e"
              opacity="0.75"
            />
            <circle cx="0" cy="0" r="25" fill="none" stroke="#bae6fd" strokeWidth="1.2" opacity="0.5" />
            <text x="0" y="38" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="JetBrains Mono">
              EARTH (1.3s Link)
            </text>
          </g>
        ) : (
          <g transform="translate(115, 62)">
            <circle cx="0" cy="0" r="6" fill="#38bdf8" />
            <circle
              cx="0"
              cy="0"
              r="14"
              fill="none"
              stroke="#38bdf8"
              strokeDasharray="3 3"
              opacity="0.6"
            />
            <circle
              cx="0"
              cy="0"
              r="24"
              fill="none"
              stroke="#38bdf8"
              strokeDasharray="2 4"
              opacity="0.35"
            />
            <text x="0" y="36" textAnchor="middle" fill="#fdba74" fontSize="10" fontFamily="JetBrains Mono">
              EARTH (18m Delay)
            </text>
          </g>
        )}

        {/* The Sun & Solar Activity */}
        <g transform="translate(690, 62)">
          <circle cx="0" cy="0" r={isSolarStorm ? 56 : 42} fill="url(#sunGlow)" />
          <circle cx="0" cy="0" r="18" fill="#fef9c3" />
          {isSolarStorm && (
            <text
              x="0"
              y="48"
              textAnchor="middle"
              fill="#fb923c"
              fontSize="10"
              fontWeight="700"
              fontFamily="JetBrains Mono"
            >
              SOLAR STORM ACTIVE!
            </text>
          )}
        </g>

        {/* Incoming Solar Particle Streaks during Solar Storm or high GCR */}
        {isSolarStorm && (
          <g stroke="#fb923c" strokeWidth="1.8" strokeDasharray="8 6" opacity="0.8">
            <line x1="650" y1="75" x2="480" y2="145" />
            <line x1="635" y1="95" x2="440" y2="170" />
            <line x1="665" y1="105" x2="510" y2="180" />
            <line x1="620" y1="60" x2="360" y2="135" />
          </g>
        )}

        {/* Distant Mountains / Crater Rim */}
        {site === 'moon' ? (
          <>
            <polygon
              points="0,220 90,155 195,205 310,145 430,210 570,160 700,200 800,165 800,300 0,300"
              fill="#1e293b"
            />
            <polygon
              points="0,235 140,195 280,230 460,190 640,225 800,200 800,300 0,300"
              fill="#334155"
            />
            <rect x="0" y="232" width="800" height="68" fill="#475569" />
          </>
        ) : (
          <>
            <polygon
              points="0,215 110,150 215,195 340,140 465,205 600,155 720,195 800,160 800,300 0,300"
              fill="#7c2d12"
            />
            <polygon
              points="0,235 160,195 310,228 490,188 660,225 800,198 800,300 0,300"
              fill="#9a3412"
            />
            <rect x="0" y="232" width="800" height="68" fill="#b45309" />
          </>
        )}

        {/* Active Radiation & Thermal Shielding Dome around Habitat */}
        <ellipse
          cx="415"
          cy="228"
          rx="235"
          ry="98"
          fill="url(#shieldDomeGrad)"
          stroke={isSolarStorm ? '#38bdf8' : '#7dd3fc'}
          strokeWidth={1 + shieldStrength * 2.5}
          strokeDasharray={allocation.shielding >= 25 ? 'none' : '6 4'}
        />
        <text
          x="415"
          y="122"
          textAnchor="middle"
          fill="#7dd3fc"
          fontSize="10"
          fontFamily="JetBrains Mono"
        >
          SHIELDING DOME ({allocation.shielding}% PWR • {radiationMsV.toFixed(1)}/{safeRadiationLimitMsV} mSv)
        </text>

        {/* Left Module: Solar Array Wing & Battery Bank */}
        <g transform="translate(215, 168)">
          {/* Mast */}
          <rect x="36" y="28" width="6" height="44" fill="#94a3b8" />
          {/* Solar Wing */}
          <polygon
            points="0,8 78,0 72,38 -6,46"
            fill={isDustOrShadow ? '#475569' : '#0284c7'}
            stroke="#e2e8f0"
            strokeWidth="1.5"
          />
          <line x1="25" y1="5" x2="19" y2="43" stroke="#bae6fd" strokeWidth="1" opacity="0.6" />
          <line x1="52" y1="3" x2="46" y2="40" stroke="#bae6fd" strokeWidth="1" opacity="0.6" />
          {/* Battery Unit */}
          <rect x="18" y="60" width="44" height="22" rx="4" fill="#0f172a" stroke="#facc15" strokeWidth="1.5" />
          <rect
            x="22"
            y="64"
            width={Math.max(4, Math.round((power / 100) * 36))}
            height="14"
            rx="2"
            fill={power > 35 ? '#eab308' : '#ef4444'}
          />
          <text x="40" y="96" textAnchor="middle" fill="#fef08a" fontSize="10" fontFamily="JetBrains Mono">
            PWR {power}%
          </text>
        </g>

        {/* Center Module: Main Crew Habitat & ECLSS Life Support */}
        <g transform="translate(335, 166)">
          {/* Connecting Pressurized Tunnel */}
          <rect x="-25" y="45" width="210" height="18" fill="#64748b" />
          {/* Main Hab Cylinder */}
          <rect
            x="0"
            y="16"
            width="130"
            height="64"
            rx="18"
            fill="#e2e8f0"
            stroke="#475569"
            strokeWidth="2.5"
          />
          {/* Water-Wall Radiation Layer Indicator */}
          <rect
            x="6"
            y="22"
            width="118"
            height="10"
            rx="5"
            fill="#0284c7"
            opacity={0.35 + shieldStrength * 0.55}
          />
          {/* Viewport Windows */}
          <circle
            cx="36"
            cy="48"
            r="11"
            fill={allocation.lifeSupport >= 22 ? '#38bdf8' : '#f97316'}
            stroke="#1e293b"
            strokeWidth="2"
          />
          <circle
            cx="65"
            cy="48"
            r="11"
            fill={allocation.lifeSupport >= 22 ? '#38bdf8' : '#f97316'}
            stroke="#1e293b"
            strokeWidth="2"
          />
          <circle
            cx="94"
            cy="48"
            r="11"
            fill={allocation.lifeSupport >= 22 ? '#38bdf8' : '#f97316'}
            stroke="#1e293b"
            strokeWidth="2"
          />
          {/* NASA Meatball / Crew Health Status Tag */}
          <text x="65" y="96" textAnchor="middle" fill="#bae6fd" fontSize="10" fontFamily="JetBrains Mono">
            ECLSS O₂ {lifeSupport}% • CREW {health}%
          </text>
        </g>

        {/* Right Module: CSA Hydroponic Greenhouse Dome */}
        <g transform="translate(505, 174)">
          {/* Glass Bio-Dome */}
          <path
            d="M 0,66 A 48,44 0 0,1 96,66 Z"
            fill={`rgba(16, 185, 129, ${0.18 + greenhouseGlow * 0.28})`}
            stroke="#34d399"
            strokeWidth="2"
          />
          {/* Grow Lights Top Bar */}
          <line
            x1="24"
            y1="34"
            x2="72"
            y2="34"
            stroke="#f43f5e"
            strokeWidth={1.5 + greenhouseGlow * 2.5}
          />
          {/* Hydroponic Plants (scale with cropHealth) */}
          <g transform="translate(18, 48)">
            {[0, 18, 36, 54].map((xPos, idx) => {
              const plantH = Math.max(5, Math.round((cropHealth / 100) * 16));
              const plantColor = cropHealth > 45 ? '#22c55e' : '#eab308';
              return (
                <g key={idx} transform={`translate(${xPos}, 0)`}>
                  <rect x="0" y={16 - plantH} width="6" height={plantH} rx="3" fill={plantColor} />
                  <circle cx="3" cy={15 - plantH} r="4" fill={plantColor} />
                </g>
              );
            })}
          </g>
          <rect x="-4" y="64" width="104" height="10" rx="3" fill="#334155" />
          <text x="48" y="90" textAnchor="middle" fill="#6ee7b7" fontSize="10" fontFamily="JetBrains Mono">
            CROPS {cropHealth}%
          </text>
        </g>

        {/* Far Right: Deep Space Comms Dish & Science Rover */}
        <g transform="translate(640, 185)">
          <line x1="20" y1="55" x2="20" y2="28" stroke="#cbd5e1" strokeWidth="3" />
          <path d="M 4,20 Q 20,38 36,16" fill="none" stroke="#f8fafc" strokeWidth="2.5" />
          <line x1="20" y1="26" x2="10" y2="10" stroke="#38bdf8" strokeWidth="1.8" />
          {allocation.scienceComms >= 15 && (
            <circle cx="8" cy="8" r="3.5" fill="#38bdf8" />
          )}
          <text x="20" y="74" textAnchor="middle" fill="#cbd5e1" fontSize="9.5" fontFamily="JetBrains Mono">
            COMMS/SCI ({allocation.scienceComms}%)
          </text>
        </g>

        {/* Dust Overlay if Mars Dust Storm is active */}
        {site === 'mars' && isDustOrShadow && (
          <rect
            x="0"
            y="0"
            width="800"
            height="300"
            fill="rgba(180, 83, 9, 0.24)"
            pointerEvents="none"
          />
        )}
      </svg>
    </div>
  );
};
