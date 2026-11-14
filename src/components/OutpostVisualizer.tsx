import React, { useState } from 'react';
import { MissionEventCard, MissionSiteId, PowerAllocation } from '../types/game';
import { sound } from '../utils/sound';

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
  onSelectModule?: (moduleId: string) => void;
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
  currentEvent,
  onSelectModule
}) => {
  const [activeBubble, setActiveBubble] = useState<string | null>(null);
  const isSolarStorm = currentEvent.category === 'solar-storm';
  const isDustOrShadow = currentEvent.category === 'environment';

  const shieldStrength = Math.min(1, Math.max(0.1, allocation.shielding / 35));
  const greenhouseGlow = Math.min(1, Math.max(0.2, allocation.greenhouse / 30));

  const handleModuleClick = (mod: string, sfx: () => void) => {
    sfx();
    setActiveBubble((prev) => (prev === mod ? null : mod));
    if (onSelectModule) onSelectModule(mod);
  };

  return (
    <div className={`game-outpost-viewport ${site === 'moon' ? 'viewport-moon' : 'viewport-mars'}`}>
      {/* Top Playfield Quick Status Chips */}
      <div className="viewport-hud-bar">
        <div className="hud-pill site-pill">
          <span className="live-pulse-dot" />
          <span>{site === 'moon' ? '🌕 ARTEMIS LUNAR BASE' : '🔴 JEZERO MARS HABITAT'}</span>
        </div>
        <div className="hud-pill sol-pill">
          <span>{site === 'moon' ? `DAY ${day} / ${totalDays}` : `SOL ${day} / ${totalDays}`}</span>
        </div>
        {isSolarStorm && (
          <div className="hud-pill storm-warning-pill animate-flash">
            <span>⚡ SOLAR STORM INCOMING!</span>
          </div>
        )}
        {site === 'mars' && (
          <div className="hud-pill comm-pill">
            <span>📡 EARTH: 18m LIGHT-DELAY</span>
          </div>
        )}
      </div>

      {/* Interactive Module Info Bubble Popup when child taps a building */}
      {activeBubble && (
        <div className="module-interactive-bubble">
          {activeBubble === 'solar' && (
            <div>
              <strong>☀️ Solar Array Bank</strong>
              <p>Harvesting sunlight. Battery level: {power}%. Draw: {allocation.lifeSupport + allocation.shielding + allocation.greenhouse + allocation.scienceComms}%</p>
            </div>
          )}
          {activeBubble === 'shield' && (
            <div>
              <strong>🛡️ Active Forcefield Shield</strong>
              <p>Shield power: {allocation.shielding}%. Blocks deadly solar radiation! Dose: {radiationMsV.toFixed(1)} / {safeRadiationLimitMsV} mSv</p>
            </div>
          )}
          {activeBubble === 'greenhouse' && (
            <div>
              <strong>🥗 CSA Hydroponic Bio-Dome</strong>
              <p>Dwarf wheat & red romaine lettuce. Health: {cropHealth}%. Generates fresh oxygen and keeps astronauts smiling!</p>
            </div>
          )}
          {activeBubble === 'hab' && (
            <div>
              <strong>🏠 Crew Living Quarters (ECLSS)</strong>
              <p>Recycling cabin air & water. O₂: {lifeSupport}%. Crew Health: {health}%. Astronauts feel great!</p>
            </div>
          )}
          {activeBubble === 'comms' && (
            <div>
              <strong>📡 Deep Space Dish</strong>
              <p>{site === 'moon' ? '1.3s direct link to Houston!' : '18-minute speed-of-light delay! Houston cannot guide emergency repairs in real time!'}</p>
            </div>
          )}
          <button className="bubble-close-btn" onClick={() => setActiveBubble(null)}>✕</button>
        </div>
      )}

      {/* Main Vector Game Illustration */}
      <svg
        viewBox="0 0 900 420"
        className="game-canvas-svg"
        role="img"
        aria-label="Interactive Space Outpost Playground"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="moonSkyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#030712" />
            <stop offset="45%" stopColor="#0b1329" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          <linearGradient id="marsSkyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isDustOrShadow ? '#431407' : '#1c0f0a'} />
            <stop offset="50%" stopColor={isDustOrShadow ? '#7c2d12' : '#451a03'} />
            <stop offset="100%" stopColor={isDustOrShadow ? '#b45309' : '#9a3412'} />
          </linearGradient>

          <radialGradient id="plasmaShieldGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(56, 189, 248, 0.05)" />
            <stop offset="70%" stopColor={`rgba(56, 189, 248, ${0.15 + shieldStrength * 0.3})`} />
            <stop offset="100%" stopColor={`rgba(14, 165, 233, ${0.35 + shieldStrength * 0.5})`} />
          </radialGradient>

          <radialGradient id="sunEnergyGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="40%" stopColor={isSolarStorm ? '#f97316' : '#facc15'} />
            <stop offset="100%" stopColor="rgba(249, 115, 22, 0)" />
          </radialGradient>

          <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Dynamic Sky */}
        <rect
          x="0"
          y="0"
          width="900"
          height="420"
          fill={site === 'moon' ? 'url(#moonSkyGrad)' : 'url(#marsSkyGrad)'}
        />

        {/* Twinkling Starfield */}
        <g opacity={site === 'moon' ? 0.9 : 0.45}>
          <circle cx="65" cy="50" r="1.8" fill="#f8fafc" className="star-twinkle" />
          <circle cx="140" cy="30" r="1.3" fill="#bae6fd" />
          <circle cx="230" cy="70" r="2.2" fill="#fef08a" className="star-twinkle" />
          <circle cx="380" cy="35" r="1.5" fill="#f8fafc" />
          <circle cx="510" cy="60" r="2" fill="#bae6fd" className="star-twinkle" />
          <circle cx="670" cy="40" r="1.4" fill="#f8fafc" />
          <circle cx="780" cy="75" r="2.1" fill="#fef08a" className="star-twinkle" />
          <circle cx="850" cy="30" r="1.5" fill="#bae6fd" />
        </g>

        {/* Planet Earth in the sky */}
        {site === 'moon' ? (
          <g transform="translate(140, 95)" className="celestial-body">
            <circle cx="0" cy="0" r="32" fill="#0284c7" />
            <path
              d="M-18,-15 C-8,-22 12,-12 18,-4 C22,6 8,20 -6,18 C-20,16 -24,2 -18,-15 Z"
              fill="#22c55e"
              opacity="0.85"
            />
            <circle cx="0" cy="0" r="33" fill="none" stroke="#7dd3fc" strokeWidth="1.8" opacity="0.6" />
            <text x="0" y="52" textAnchor="middle" fill="#bae6fd" fontSize="12" fontWeight="700">
              EARTH (1.3s away)
            </text>
          </g>
        ) : (
          <g transform="translate(130, 85)" className="celestial-body">
            <circle cx="0" cy="0" r="8" fill="#38bdf8" />
            <circle cx="0" cy="0" r="18" fill="none" stroke="#38bdf8" strokeDasharray="3 3" opacity="0.5" />
            <circle cx="0" cy="0" r="30" fill="none" stroke="#38bdf8" strokeDasharray="2 4" opacity="0.3" />
            <text x="0" y="46" textAnchor="middle" fill="#fdba74" fontSize="11" fontWeight="700">
              EARTH (Tiny blue dot • 18m comm delay!)
            </text>
          </g>
        )}

        {/* The Blazing Sun */}
        <g transform="translate(760, 90)">
          <circle cx="0" cy="0" r={isSolarStorm ? 75 : 55} fill="url(#sunEnergyGlow)" />
          <circle cx="0" cy="0" r="25" fill="#fffbeb" filter="url(#glowFilter)" />
          <text
            x="0"
            y={isSolarStorm ? 56 : 44}
            textAnchor="middle"
            fill={isSolarStorm ? '#fb923c' : '#facc15'}
            fontSize="12"
            fontWeight="800"
          >
            {isSolarStorm ? '🔥 SOLAR FLARE!' : '☀️ THE SUN'}
          </text>
        </g>

        {/* Solar Storm Energy Beams shooting down at the base */}
        {isSolarStorm && (
          <g stroke="#f97316" strokeWidth="2.5" strokeDasharray="10 8" opacity="0.85" className="solar-beams-anim">
            <line x1="710" y1="110" x2="520" y2="210" />
            <line x1="700" y1="130" x2="440" y2="230" />
            <line x1="730" y1="140" x2="560" y2="250" />
            <line x1="680" y1="90" x2="350" y2="210" />
          </g>
        )}

        {/* Mountain Ridge / Crater Terrain */}
        {site === 'moon' ? (
          <>
            {/* Distant Peaks */}
            <polygon
              points="0,310 110,210 240,280 380,195 530,285 710,215 880,270 900,265 900,420 0,420"
              fill="#1e293b"
            />
            {/* Midground Hills */}
            <polygon
              points="0,330 160,265 340,315 560,255 770,305 900,275 900,420 0,420"
              fill="#334155"
            />
            {/* Crater Surface Floor */}
            <rect x="0" y="325" width="900" height="95" fill="#475569" />
            {/* Lunar Surface Craters */}
            <ellipse cx="210" cy="360" rx="35" ry="10" fill="#334155" opacity="0.7" />
            <ellipse cx="680" cy="375" rx="45" ry="12" fill="#334155" opacity="0.7" />
            <ellipse cx="440" cy="395" rx="28" ry="8" fill="#334155" opacity="0.7" />
          </>
        ) : (
          <>
            {/* Mars Jezero Delta Rim */}
            <polygon
              points="0,310 120,205 260,275 410,190 570,280 730,205 890,265 900,260 900,420 0,420"
              fill="#7c2d12"
            />
            <polygon
              points="0,330 180,260 380,310 610,250 800,300 900,270 900,420 0,420"
              fill="#9a3412"
            />
            <rect x="0" y="325" width="900" height="95" fill="#c2410c" />
            <ellipse cx="190" cy="365" rx="40" ry="12" fill="#9a3412" opacity="0.7" />
            <ellipse cx="690" cy="380" rx="55" ry="14" fill="#9a3412" opacity="0.7" />
          </>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* INTERACTIVE MODULE 1: ACTIVE RADIATION SHIELD DOME                 */}
        {/* ------------------------------------------------------------------ */}
        <g
          className="clickable-module"
          onClick={() => handleModuleClick('shield', () => sound.shield())}
        >
          <ellipse
            cx="455"
            cy="320"
            rx="320"
            ry="140"
            fill="url(#plasmaShieldGlow)"
            stroke={isSolarStorm ? '#38bdf8' : '#7dd3fc'}
            strokeWidth={2 + shieldStrength * 4}
            strokeDasharray={allocation.shielding >= 25 ? 'none' : '8 6'}
            filter={shieldStrength > 0.6 ? 'url(#glowFilter)' : undefined}
          />
          <rect x="360" y="172" width="190" height="24" rx="12" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="455" y="188" textAnchor="middle" fill="#7dd3fc" fontSize="11" fontWeight="800">
            🛡️ SHIELD DOME ({allocation.shielding}%)
          </text>
        </g>

        {/* ------------------------------------------------------------------ */}
        {/* INTERACTIVE MODULE 2: SOLAR PANELS & BATTERY                       */}
        {/* ------------------------------------------------------------------ */}
        <g
          transform="translate(170, 235)"
          className="clickable-module"
          onClick={() => handleModuleClick('solar', () => sound.click())}
        >
          {/* Solar Mast */}
          <rect x="48" y="40" width="8" height="55" fill="#94a3b8" />
          {/* Dual Tilt Wings */}
          <polygon
            points="0,15 104,0 96,48 -8,63"
            fill={isDustOrShadow ? '#475569' : '#0284c7'}
            stroke="#f8fafc"
            strokeWidth="2"
          />
          <line x1="34" y1="10" x2="26" y2="58" stroke="#7dd3fc" strokeWidth="1.5" />
          <line x1="68" y1="5" x2="60" y2="53" stroke="#7dd3fc" strokeWidth="1.5" />

          {/* Battery Box */}
          <rect x="24" y="80" width="56" height="26" rx="6" fill="#0f172a" stroke="#facc15" strokeWidth="2" />
          <rect
            x="28"
            y="84"
            width={Math.max(4, Math.round((power / 100) * 48))}
            height="18"
            rx="4"
            fill={power > 35 ? '#facc15' : '#ef4444'}
          />
          {/* Label Badge */}
          <rect x="14" y="112" width="76" height="20" rx="10" fill="#020617" stroke="#facc15" strokeWidth="1" />
          <text x="52" y="126" textAnchor="middle" fill="#fef08a" fontSize="11" fontWeight="800">
            ⚡ {power}% PWR
          </text>
        </g>

        {/* ------------------------------------------------------------------ */}
        {/* INTERACTIVE MODULE 3: CREW HABITAT & ECLSS                         */}
        {/* ------------------------------------------------------------------ */}
        <g
          transform="translate(350, 235)"
          className="clickable-module"
          onClick={() => handleModuleClick('hab', () => sound.click())}
        >
          {/* Pressurized Tunnel Link */}
          <rect x="-40" y="55" width="280" height="22" rx="4" fill="#64748b" />
          {/* Main Hab Pod */}
          <rect
            x="0"
            y="16"
            width="170"
            height="85"
            rx="24"
            fill="#f1f5f9"
            stroke="#334155"
            strokeWidth="3.5"
          />
          {/* Water Radiation Protection Layer */}
          <rect
            x="8"
            y="24"
            width="154"
            height="14"
            rx="7"
            fill="#0284c7"
            opacity={0.35 + shieldStrength * 0.55}
          />
          {/* Viewport Portholes with happy astronaut silhouette inside */}
          <circle cx="45" cy="62" r="15" fill="#38bdf8" stroke="#1e293b" strokeWidth="3" />
          <circle cx="85" cy="62" r="15" fill="#38bdf8" stroke="#1e293b" strokeWidth="3" />
          <circle cx="125" cy="62" r="15" fill="#38bdf8" stroke="#1e293b" strokeWidth="3" />
          {/* Astronaut eyes / happy face in center window */}
          <circle cx="81" cy="60" r="2" fill="#0f172a" />
          <circle cx="89" cy="60" r="2" fill="#0f172a" />
          <path d="M 81,66 Q 85,70 89,66" stroke="#0f172a" strokeWidth="1.5" fill="none" />

          {/* Module Label */}
          <rect x="25" y="112" width="120" height="22" rx="11" fill="#020617" stroke="#38bdf8" strokeWidth="1" />
          <text x="85" y="127" textAnchor="middle" fill="#bae6fd" fontSize="11" fontWeight="800">
            🏠 HAB (O₂ {lifeSupport}%)
          </text>
        </g>

        {/* ------------------------------------------------------------------ */}
        {/* INTERACTIVE MODULE 4: CSA HYDROPONIC GREENHOUSE DOME               */}
        {/* ------------------------------------------------------------------ */}
        <g
          transform="translate(565, 245)"
          className="clickable-module"
          onClick={() => handleModuleClick('greenhouse', () => sound.success())}
        >
          {/* Greenhouse Glass Dome */}
          <path
            d="M 0,80 A 62,56 0 0,1 124,80 Z"
            fill={`rgba(16, 185, 129, ${0.18 + greenhouseGlow * 0.35})`}
            stroke="#10b981"
            strokeWidth="3"
          />
          {/* Overhead LED Grow Light Bar */}
          <line
            x1="30"
            y1="40"
            x2="94"
            y2="40"
            stroke="#f43f5e"
            strokeWidth={2 + greenhouseGlow * 3}
          />
          {/* Growing Crops (Lettuce & Wheat) */}
          <g transform="translate(20, 56)">
            {[0, 22, 44, 66].map((x, i) => {
              const h = Math.max(6, Math.round((cropHealth / 100) * 22));
              const col = cropHealth > 50 ? '#22c55e' : '#eab308';
              return (
                <g key={i} transform={`translate(${x}, 0)`}>
                  <rect x="2" y={22 - h} width="7" height={h} rx="3.5" fill={col} />
                  <circle cx="5.5" cy={20 - h} r="5" fill={col} />
                  {/* Strawberry or flower dot */}
                  {cropHealth > 65 && <circle cx="5.5" cy={20 - h} r="2" fill="#ef4444" />}
                </g>
              );
            })}
          </g>
          {/* Base Rim */}
          <rect x="-4" y="78" width="132" height="12" rx="4" fill="#334155" />
          {/* Module Label */}
          <rect x="12" y="102" width="100" height="20" rx="10" fill="#020617" stroke="#10b981" strokeWidth="1" />
          <text x="62" y="116" textAnchor="middle" fill="#6ee7b7" fontSize="11" fontWeight="800">
            🥗 CROPS ({cropHealth}%)
          </text>
        </g>

        {/* ------------------------------------------------------------------ */}
        {/* INTERACTIVE MODULE 5: DEEP SPACE DISH & SCIENCE ROVER              */}
        {/* ------------------------------------------------------------------ */}
        <g
          transform="translate(735, 260)"
          className="clickable-module"
          onClick={() => handleModuleClick('comms', () => sound.click())}
        >
          {/* Mast & Parabolic Dish */}
          <line x1="28" y1="70" x2="28" y2="35" stroke="#94a3b8" strokeWidth="4" />
          <path d="M 8,24 Q 28,48 48,18" fill="none" stroke="#f8fafc" strokeWidth="3.5" />
          <line x1="28" y1="32" x2="16" y2="12" stroke="#38bdf8" strokeWidth="2.5" />
          <circle cx="14" cy="10" r="4" fill="#38bdf8" filter="url(#glowFilter)" />

          {/* Module Label */}
          <rect x="-6" y="86" width="70" height="20" rx="10" fill="#020617" stroke="#818cf8" strokeWidth="1" />
          <text x="29" y="100" textAnchor="middle" fill="#c7d2fe" fontSize="10.5" fontWeight="800">
            📡 COMMS
          </text>
        </g>

        {/* ------------------------------------------------------------------ */}
        {/* CUTE ASTRONAUT ROAMING OUTSIDE (Waving & Exploring!)               */}
        {/* ------------------------------------------------------------------ */}
        <g
          transform="translate(295, 310)"
          className="clickable-module astronaut-float"
          onClick={() => handleModuleClick('hab', () => sound.click())}
        >
          {/* Backpack */}
          <rect x="-4" y="10" width="8" height="18" rx="3" fill="#cbd5e1" stroke="#334155" strokeWidth="1.5" />
          {/* Body Suit */}
          <rect x="2" y="12" width="16" height="20" rx="6" fill="#f8fafc" stroke="#334155" strokeWidth="2" />
          {/* Helmet */}
          <circle cx="10" cy="8" r="10" fill="#f8fafc" stroke="#334155" strokeWidth="2" />
          {/* Gold Visor */}
          <ellipse cx="11" cy="8" rx="6" ry="5" fill="#f59e0b" />
          {/* Legs */}
          <line x1="6" y1="32" x2="5" y2="44" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
          <line x1="14" y1="32" x2="16" y2="44" stroke="#f8fafc" strokeWidth="4" strokeLinecap="round" />
          {/* Waving Arm */}
          <line x1="18" y1="16" x2="26" y2="6" stroke="#f8fafc" strokeWidth="3" strokeLinecap="round" />
          <circle cx="27" cy="5" r="3" fill="#38bdf8" />
          {/* Flag / Scanner */}
          <line x1="28" y1="5" x2="28" y2="-6" stroke="#94a3b8" strokeWidth="1.5" />
          <polygon points="28,-6 40,-1 28,4" fill="#ef4444" />
        </g>

        {/* Martian Dust Cloud Overlay (During Dust Storms) */}
        {site === 'mars' && isDustOrShadow && (
          <rect
            x="0"
            y="0"
            width="900"
            height="420"
            fill="rgba(194, 65, 12, 0.28)"
            pointerEvents="none"
          />
        )}
      </svg>
    </div>
  );
};
