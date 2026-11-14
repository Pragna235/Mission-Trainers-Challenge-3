import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Award,
  BatteryCharging,
  BookOpen,
  CheckCircle,
  Clock,
  Compass,
  Cpu,
  Database,
  ExternalLink,
  Flame,
  HeartPulse,
  HelpCircle,
  Info,
  Leaf,
  Radio,
  RotateCcw,
  Shield,
  Sliders,
  Sparkles,
  Sun,
  Wind,
  Zap
} from 'lucide-react';
import {
  CURATED_MISSION_EVENTS,
  GLOSSARY_TERMS,
  MISSION_CONFIGS
} from './data/nasaData';
import {
  calculateSliderImpact,
  clampPercent,
  previewTurnOutcome
} from './engine/simulation';
import { fetchLiveDonkiSpaceWeather } from './services/nasaApi';
import {
  DataSourceMode,
  DayLogEntry,
  DelayedConsequence,
  DifficultyMode,
  GlossaryTerm,
  LiveDonkiSummary,
  MissionEventCard,
  MissionSiteId,
  PowerAllocation
} from './types/game';
import { OutpostVisualizer } from './components/OutpostVisualizer';
import { ScienceTraceabilityModal } from './components/ScienceTraceabilityModal';

const DEFAULT_ALLOCATION: PowerAllocation = {
  lifeSupport: 30,
  shielding: 25,
  greenhouse: 20,
  scienceComms: 20
};

export function App() {
  // Mission configuration state
  const [site, setSite] = useState<MissionSiteId>('moon');
  const [difficulty, setDifficulty] = useState<DifficultyMode>('cadet');
  const config = MISSION_CONFIGS[site];

  // Core simulation state
  const [day, setDay] = useState<number>(1);
  const [power, setPower] = useState<number>(85);
  const [lifeSupport, setLifeSupport] = useState<number>(85);
  const [health, setHealth] = useState<number>(90);
  const [cropHealth, setCropHealth] = useState<number>(80);
  const [radiationMsV, setRadiationMsV] = useState<number>(1.2);
  const [science, setScience] = useState<number>(15);

  const [allocation, setAllocation] = useState<PowerAllocation>(DEFAULT_ALLOCATION);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [delayedQueue, setDelayedQueue] = useState<DelayedConsequence[]>([]);
  const [triggeredToday, setTriggeredToday] = useState<DelayedConsequence[]>([]);
  const [missionLogs, setMissionLogs] = useState<DayLogEntry[]>([]);
  const [lastTurnFeedback, setLastTurnFeedback] = useState<{
    day: number;
    choiceTitle: string;
    whyItMatters: string;
    commDelayTriggered?: boolean;
  } | null>(null);

  // NASA API & Science Modal state
  const [apiKey, setApiKey] = useState<string>(
    (import.meta.env.VITE_NASA_API_KEY as string) || 'DEMO_KEY'
  );
  const [dataSourceMode, setDataSourceMode] = useState<DataSourceMode>('archived');
  const [liveSummary, setLiveSummary] = useState<LiveDonkiSummary | undefined>(undefined);
  const [liveDonkiCard, setLiveDonkiCard] = useState<MissionEventCard | null>(null);
  const [injectedLiveCard, setInjectedLiveCard] = useState<MissionEventCard | null>(null);
  const [apiStatusMessage, setApiStatusMessage] = useState<string>(
    'Connecting to NASA DONKI Space Weather API...'
  );
  const [isFetchingLive, setIsFetchingLive] = useState<boolean>(false);
  const [isScienceModalOpen, setIsScienceModalOpen] = useState<boolean>(false);
  const [activeGlossary, setActiveGlossary] = useState<GlossaryTerm>(GLOSSARY_TERMS[0]);

  // Build mission deck filtered for Moon or Mars
  const missionDeck = useMemo(() => {
    const valid = CURATED_MISSION_EVENTS.filter(
      (ev) => ev.site === 'both' || ev.site === site
    );
    // Order so site-specific cards & diverse categories appear across turns
    return valid;
  }, [site]);

  const currentEvent: MissionEventCard = useMemo(() => {
    if (injectedLiveCard) return injectedLiveCard;
    const idx = (day - 1) % missionDeck.length;
    return missionDeck[idx];
  }, [day, missionDeck, injectedLiveCard]);

  // Fetch live NASA DONKI telemetry on mount or when API key changes
  const loadNasaDonki = async (keyToUse: string) => {
    setIsFetchingLive(true);
    const res = await fetchLiveDonkiSpaceWeather(keyToUse);
    setIsFetchingLive(false);

    if (res.ok && res.summary && res.liveEventCard) {
      setDataSourceMode('live');
      setLiveSummary(res.summary);
      setLiveDonkiCard(res.liveEventCard);
      setApiStatusMessage(
        `Connected to api.nasa.gov/DONKI (${res.summary.flareCount} Solar Flares & ${res.summary.cmeCount} CMEs in past 28 days).`
      );
    } else {
      setDataSourceMode('archived');
      setApiStatusMessage(
        res.errorReason ||
          'Using Verified Archived NASA Datasets (DONKI May 2024 Superstorm, RadLab, OSDR, Mars Trek).'
      );
    }
  };

  useEffect(() => {
    loadNasaDonki(apiKey);
  }, []);

  // Reset mission when switching between Moon and Mars or clicking Restart
  const resetMission = (newSite: MissionSiteId = site, newDiff: DifficultyMode = difficulty) => {
    setSite(newSite);
    setDifficulty(newDiff);
    setDay(1);
    setPower(newDiff === 'cadet' ? 86 : 78);
    setLifeSupport(newDiff === 'cadet' ? 86 : 80);
    setHealth(newDiff === 'cadet' ? 92 : 85);
    setCropHealth(80);
    setRadiationMsV(newSite === 'moon' ? 1.37 : 0.64);
    setScience(10);
    setAllocation(DEFAULT_ALLOCATION);
    setSelectedChoiceId(null);
    setDelayedQueue([]);
    setTriggeredToday([]);
    setMissionLogs([]);
    setLastTurnFeedback(null);
    setInjectedLiveCard(null);
  };

  // Check win/loss conditions
  const gameStatus = useMemo(() => {
    if (power <= 0) {
      return {
        over: true,
        won: false,
        reason: 'Total Outpost Blackout (Power Reserve hit 0%)',
        lesson:
          'When batteries run completely flat in deep space, cabin heaters and oxygen scrubbers shut down together. Mission planners always protect a minimum 15–20% emergency power buffer!'
      };
    }
    if (lifeSupport <= 0) {
      return {
        over: true,
        won: false,
        reason: 'Life Support Depleted (O₂ & Clean Water hit 0%)',
        lesson:
          'Saving electricity by throttling ECLSS recyclers or letting hydroponic crops die creates an oxygen deficit that compounds over subsequent days.'
      };
    }
    if (health <= 0 || radiationMsV >= config.safeRadiationLimitMsV) {
      return {
        over: true,
        won: false,
        reason:
          radiationMsV >= config.safeRadiationLimitMsV
            ? `Radiation Limit Exceeded (${radiationMsV.toFixed(1)} / ${config.safeRadiationLimitMsV} mSv)`
            : 'Crew Health Critical (0%)',
        lesson:
          'Unshielded Solar Particle Events and skipped exercise countermeasures rapidly degrade crew health. Active shielding and water walls are essential during DONKI storm alerts!'
      };
    }
    if (day > config.totalDays) {
      const metScience = science >= config.scienceTarget;
      return {
        over: true,
        won: metScience,
        reason: metScience
          ? `Mission Accomplished! Survived all ${config.totalDays} ${config.dayUnitName}s & Exceeded Science Target (${science}/${config.scienceTarget} pts)!`
          : `Crew Survived ${config.totalDays} ${config.dayUnitName}s, but Missed Science Target (${science}/${config.scienceTarget} pts)`,
        lesson: metScience
          ? 'You mastered NASA’s core engineering trade-off: balancing power, life support, hydroponic food, and radiation shielding while still achieving high-priority science!'
          : 'You kept the crew alive—the #1 rule of human spaceflight! Next time, try using healthy greenhouse crops and pre-charged storm batteries to free up extra power for science instruments.'
      };
    }
    return { over: false, won: false, reason: '', lesson: '' };
  }, [power, lifeSupport, health, radiationMsV, day, config, science]);

  // Calculate live slider impact & preview outcome
  const sliderImpact = useMemo(
    () => calculateSliderImpact(allocation, config, cropHealth, difficulty),
    [allocation, config, cropHealth, difficulty]
  );

  const selectedChoice = useMemo(
    () => currentEvent.choices.find((c) => c.id === selectedChoiceId) || null,
    [currentEvent, selectedChoiceId]
  );

  const preview = useMemo(
    () =>
      previewTurnOutcome(
        { power, lifeSupport, health, radiationMsV, cropHealth, science },
        sliderImpact,
        selectedChoice
      ),
    [power, lifeSupport, health, radiationMsV, cropHealth, science, sliderImpact, selectedChoice]
  );

  // Execute turn
  const handleCommitTurn = () => {
    if (!selectedChoice || gameStatus.over) return;

    const nextDay = day + 1;

    // Check delayed consequences scheduled for nextDay
    const dueConsequences = delayedQueue.filter((d) => d.triggerDay === nextDay);
    const remainingQueue = delayedQueue.filter((d) => d.triggerDay !== nextDay);

    if (selectedChoice.effects.delayedEffect) {
      remainingQueue.push({
        triggerDay: day + selectedChoice.effects.delayedEffect.turnsLater,
        sourceTitle: currentEvent.title,
        description: selectedChoice.effects.delayedEffect.description,
        powerDelta: selectedChoice.effects.delayedEffect.powerDelta,
        lifeSupportDelta: selectedChoice.effects.delayedEffect.lifeSupportDelta,
        healthDelta: selectedChoice.effects.delayedEffect.healthDelta,
        cropHealthDelta: selectedChoice.effects.delayedEffect.cropHealthDelta,
        scienceDelta: selectedChoice.effects.delayedEffect.scienceDelta
      });
    }

    let finalPower = preview.power;
    let finalLifeSupport = preview.lifeSupport;
    let finalHealth = preview.health;
    let finalCropHealth = preview.cropHealth;
    let finalScience = preview.science;

    for (const item of dueConsequences) {
      if (item.powerDelta) finalPower = clampPercent(finalPower + item.powerDelta);
      if (item.lifeSupportDelta)
        finalLifeSupport = clampPercent(finalLifeSupport + item.lifeSupportDelta);
      if (item.healthDelta) finalHealth = clampPercent(finalHealth + item.healthDelta);
      if (item.cropHealthDelta)
        finalCropHealth = clampPercent(finalCropHealth + item.cropHealthDelta);
      if (item.scienceDelta) finalScience = Math.max(0, finalScience + item.scienceDelta);
    }

    const logEntry: DayLogEntry = {
      day,
      eventTitle: currentEvent.title,
      choiceLabel: selectedChoice.label,
      powerEnd: finalPower,
      lifeSupportEnd: finalLifeSupport,
      healthEnd: finalHealth,
      radiationMsV: preview.radiationMsV,
      scienceEarned: finalScience - science,
      lessonLearned: selectedChoice.whyItMatters,
      nasaSourceTag: `${currentEvent.nasaCitation.dataset}: ${currentEvent.nasaCitation.referenceId}`
    };

    setPower(finalPower);
    setLifeSupport(finalLifeSupport);
    setHealth(finalHealth);
    setCropHealth(finalCropHealth);
    setRadiationMsV(preview.radiationMsV);
    setScience(finalScience);
    setDelayedQueue(remainingQueue);
    setTriggeredToday(dueConsequences);
    setMissionLogs((prev) => [logEntry, ...prev]);
    setLastTurnFeedback({
      day,
      choiceTitle: selectedChoice.label,
      whyItMatters: selectedChoice.whyItMatters,
      commDelayTriggered: selectedChoice.commDelayPenaltyApply
    });
    setSelectedChoiceId(null);
    setInjectedLiveCard(null);
    setDay(nextDay);
  };

  // Preset power allocation helpers
  const applyPreset = (preset: 'nominal' | 'storm' | 'greenhouse' | 'science') => {
    if (preset === 'nominal') {
      setAllocation({ lifeSupport: 30, shielding: 25, greenhouse: 20, scienceComms: 20 });
    } else if (preset === 'storm') {
      setAllocation({ lifeSupport: 28, shielding: 40, greenhouse: 12, scienceComms: 10 });
    } else if (preset === 'greenhouse') {
      setAllocation({ lifeSupport: 28, shielding: 20, greenhouse: 32, scienceComms: 15 });
    } else if (preset === 'science') {
      setAllocation({ lifeSupport: 26, shielding: 20, greenhouse: 16, scienceComms: 34 });
    }
  };

  return (
    <div className="app-shell">
      {/* Top Mission Control Navigation Header */}
      <header className="top-nav">
        <div className="brand-block">
          <div className="brand-emblem" aria-hidden="true">
            <Compass size={22} />
          </div>
          <div>
            <div className="brand-eyebrow">2026 NASA SPACE APPS CHALLENGE • AGES 7–12</div>
            <h1 className="brand-title">Outpost Commander: Deep Space Trade-Offs</h1>
          </div>
        </div>

        {/* Mission Site Switcher (Moon vs. Mars) */}
        <div className="mission-switcher" role="group" aria-label="Select Mission Outpost">
          <button
            id="select-moon-mission-btn"
            className={`switch-btn ${site === 'moon' ? 'active-moon' : ''}`}
            onClick={() => resetMission('moon', difficulty)}
          >
            <span>🌕 Moon: Shackleton Base</span>
            <small>1.3s Comm • High Radiation</small>
          </button>
          <button
            id="select-mars-mission-btn"
            className={`switch-btn ${site === 'mars' ? 'active-mars' : ''}`}
            onClick={() => resetMission('mars', difficulty)}
          >
            <span>🔴 Mars: Jezero Outpost</span>
            <small>18m Delay • Dust Storms</small>
          </button>
        </div>

        {/* Mode & NASA Data Status Controls */}
        <div className="header-actions">
          <div className="difficulty-toggle" role="group" aria-label="Difficulty Mode">
            <button
              id="mode-cadet-btn"
              className={`diff-btn ${difficulty === 'cadet' ? 'active' : ''}`}
              onClick={() => setDifficulty('cadet')}
              title="Shows exact outcome previews before you lock in your decision"
            >
              Cadet (7–10)
            </button>
            <button
              id="mode-director-btn"
              className={`diff-btn ${difficulty === 'director' ? 'active' : ''}`}
              onClick={() => setDifficulty('director')}
              title="Tighter solar margins & realistic telemetry"
            >
              Flight Director (11+)
            </button>
          </div>

          <button
            id="open-nasa-science-hub-btn"
            className={`nasa-status-btn ${dataSourceMode === 'live' ? 'status-live' : 'status-archived'}`}
            onClick={() => setIsScienceModalOpen(true)}
          >
            <Database size={15} />
            <span>
              {dataSourceMode === 'live'
                ? 'LIVE NASA DONKI API'
                : 'VERIFIED NASA DATA (SNAPSHOT)'}
            </span>
          </button>
        </div>
      </header>

      {/* Interactive Kid-Friendly Space Glossary Strip */}
      <section className="glossary-strip" aria-label="Space Science Word Helper">
        <div className="glossary-strip-chips">
          <span className="strip-label">
            <BookOpen size={14} /> Tap a Space Word:
          </span>
          {GLOSSARY_TERMS.map((item) => (
            <button
              key={item.id}
              id={`glossary-chip-${item.id}`}
              className={`glossary-chip ${activeGlossary.id === item.id ? 'chip-active' : ''}`}
              onClick={() => setActiveGlossary(item)}
            >
              {item.term}
            </button>
          ))}
        </div>
        <div className="glossary-strip-explain">
          <strong>{activeGlossary.term}:</strong> {activeGlossary.shortDef}{' '}
          <span className="analogy-highlight">💡 {activeGlossary.kidAnalogy}</span>
        </div>
      </section>

      {/* Main Two-Column Outpost Command Layout */}
      <main className="main-workspace">
        {/* LEFT COLUMN: Visual Outpost, 3 Core Resource Gauges, & Daily Power Sliders */}
        <section className="left-column">
          {/* Core 3 Competing Resource Gauges + Science Goal */}
          <div className="telemetry-strip">
            {/* Gauge 1: Power Reserve */}
            <div className={`gauge-card ${power <= 25 ? 'gauge-danger' : ''}`}>
              <div className="gauge-head">
                <span className="gauge-title">
                  <BatteryCharging size={17} className="icon-amber" />
                  1. Power Reserve
                </span>
                <span className="gauge-value">
                  {power}%
                  {difficulty === 'cadet' && selectedChoice && (
                    <small
                      className={
                        preview.power >= power ? 'preview-pos' : 'preview-neg'
                      }
                    >
                      {' '}
                      → {preview.power}%
                    </small>
                  )}
                </span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill fill-amber"
                  style={{ width: `${power}%` }}
                />
              </div>
              <div className="gauge-sub">
                <span>Solar + Fuel Cell Bank</span>
                <span>Draw: {sliderImpact.totalAllocatedPercent}%</span>
              </div>
            </div>

            {/* Gauge 2: Life Support & Crops */}
            <div className={`gauge-card ${lifeSupport <= 25 ? 'gauge-danger' : ''}`}>
              <div className="gauge-head">
                <span className="gauge-title">
                  <Wind size={17} className="icon-cyan" />
                  2. Life Support & Food
                </span>
                <span className="gauge-value">
                  {lifeSupport}%
                  {difficulty === 'cadet' && selectedChoice && (
                    <small
                      className={
                        preview.lifeSupport >= lifeSupport ? 'preview-pos' : 'preview-neg'
                      }
                    >
                      {' '}
                      → {preview.lifeSupport}%
                    </small>
                  )}
                </span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill fill-cyan"
                  style={{ width: `${lifeSupport}%` }}
                />
              </div>
              <div className="gauge-sub">
                <span>O₂ & Water Loop</span>
                <span className="crop-tag">🌱 Crops: {cropHealth}%</span>
              </div>
            </div>

            {/* Gauge 3: Shielding & Crew Health + RadLab Dosimeter */}
            <div
              className={`gauge-card ${
                health <= 25 || radiationMsV >= config.safeRadiationLimitMsV * 0.8
                  ? 'gauge-danger'
                  : ''
              }`}
            >
              <div className="gauge-head">
                <span className="gauge-title">
                  <Shield size={17} className="icon-emerald" />
                  3. Crew & Shielding
                </span>
                <span className="gauge-value">
                  {health}%
                  {difficulty === 'cadet' && selectedChoice && (
                    <small
                      className={
                        preview.health >= health ? 'preview-pos' : 'preview-neg'
                      }
                    >
                      {' '}
                      → {preview.health}%
                    </small>
                  )}
                </span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill fill-emerald"
                  style={{ width: `${health}%` }}
                />
              </div>
              <div className="gauge-sub">
                <span>
                  Dose: <strong>{radiationMsV.toFixed(1)}</strong> / {config.safeRadiationLimitMsV}{' '}
                  mSv
                </span>
                <span>RadLab Limit</span>
              </div>
            </div>

            {/* Mission Science & Comm Delay Bar */}
            <div className="gauge-card">
              <div className="gauge-head">
                <span className="gauge-title">
                  <Award size={17} className="icon-sky" />
                  Mission Science
                </span>
                <span className="gauge-value">
                  {science} / {config.scienceTarget}
                  {difficulty === 'cadet' && selectedChoice && (
                    <small className="preview-pos"> → {preview.science}</small>
                  )}
                </span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill fill-sky"
                  style={{
                    width: `${Math.min(100, Math.round((science / config.scienceTarget) * 100))}%`
                  }}
                />
              </div>
              <div className="gauge-sub">
                <span>
                  <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
                  Comm Delay: {config.commDelayDisplay}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive SVG Outpost Visualizer */}
          <OutpostVisualizer
            site={site}
            day={Math.min(day, config.totalDays)}
            totalDays={config.totalDays}
            power={power}
            lifeSupport={lifeSupport}
            health={health}
            cropHealth={cropHealth}
            radiationMsV={radiationMsV}
            safeRadiationLimitMsV={config.safeRadiationLimitMsV}
            allocation={allocation}
            currentEvent={currentEvent}
          />

          {/* Step 1: Daily Power Allocation Sliders (Every choice has a cost!) */}
          <div className="power-budget-panel">
            <div className="panel-header-row">
              <div>
                <span className="step-badge">STEP 1 EVERY {config.dayUnitName.toUpperCase()}</span>
                <h3>Split Outpost Power Across Competing Systems</h3>
              </div>
              <div className="preset-buttons">
                <button
                  id="preset-nominal-btn"
                  className="preset-btn"
                  onClick={() => applyPreset('nominal')}
                >
                  Balanced
                </button>
                <button
                  id="preset-storm-btn"
                  className="preset-btn"
                  onClick={() => applyPreset('storm')}
                >
                  Storm Shield
                </button>
                <button
                  id="preset-greenhouse-btn"
                  className="preset-btn"
                  onClick={() => applyPreset('greenhouse')}
                >
                  Grow Crops
                </button>
                <button
                  id="preset-science-btn"
                  className="preset-btn"
                  onClick={() => applyPreset('science')}
                >
                  Science Push
                </button>
              </div>
            </div>

            <p className="panel-helper-text">
              Your solar arrays harvest enough electricity for <strong>~95% total load</strong> each{' '}
              {config.dayUnitName}. Cranking all sliders high drains your battery; turning a slider
              down saves power today, but hurts oxygen, crops, or radiation dose tomorrow!
            </p>

            <div className="sliders-grid">
              {/* Slider 1: ECLSS Life Support */}
              <div className="slider-box">
                <div className="slider-label-row">
                  <span>
                    <Wind size={15} className="icon-cyan" /> Life Support (ECLSS O₂/Water)
                  </span>
                  <strong>{allocation.lifeSupport}%</strong>
                </div>
                <input
                  id="slider-life-support"
                  type="range"
                  min={10}
                  max={50}
                  step={2}
                  value={allocation.lifeSupport}
                  onChange={(e) =>
                    setAllocation({ ...allocation, lifeSupport: Number(e.target.value) })
                  }
                />
                <div className="slider-effect-note">
                  {sliderImpact.lifeSupportFromSliders >= 0
                    ? `+${sliderImpact.lifeSupportFromSliders}% O₂/Water stability (incl. crop O₂ bonus)`
                    : `${sliderImpact.lifeSupportFromSliders}% O₂ drop — crew air getting stuffy!`}
                </div>
              </div>

              {/* Slider 2: Active Radiation & Thermal Shielding */}
              <div className="slider-box">
                <div className="slider-label-row">
                  <span>
                    <Shield size={15} className="icon-emerald" /> Radiation & Thermal Shielding
                  </span>
                  <strong>{allocation.shielding}%</strong>
                </div>
                <input
                  id="slider-shielding"
                  type="range"
                  min={10}
                  max={50}
                  step={2}
                  value={allocation.shielding}
                  onChange={(e) =>
                    setAllocation({ ...allocation, shielding: Number(e.target.value) })
                  }
                />
                <div className="slider-effect-note">
                  Baseline Cosmic Ray Dose today: +{sliderImpact.radiationMsVFromSliders} mSv
                </div>
              </div>

              {/* Slider 3: CSA Greenhouse & Hydroponic Food */}
              <div className="slider-box">
                <div className="slider-label-row">
                  <span>
                    <Leaf size={15} className="icon-emerald" /> CSA Hydroponic Greenhouse LEDs
                  </span>
                  <strong>{allocation.greenhouse}%</strong>
                </div>
                <input
                  id="slider-greenhouse"
                  type="range"
                  min={5}
                  max={45}
                  step={2}
                  value={allocation.greenhouse}
                  onChange={(e) =>
                    setAllocation({ ...allocation, greenhouse: Number(e.target.value) })
                  }
                />
                <div className="slider-effect-note">
                  {sliderImpact.cropHealthFromSliders >= 0
                    ? `Crops thriving (+${sliderImpact.cropHealthFromSliders}% Crop Health)`
                    : `Crops dimming (${sliderImpact.cropHealthFromSliders}% Crop Health)`}
                </div>
              </div>

              {/* Slider 4: Science & Deep Space Comms */}
              <div className="slider-box">
                <div className="slider-label-row">
                  <span>
                    <Radio size={15} className="icon-sky" /> Science Lab & Earth Comms
                  </span>
                  <strong>{allocation.scienceComms}%</strong>
                </div>
                <input
                  id="slider-science-comms"
                  type="range"
                  min={5}
                  max={45}
                  step={2}
                  value={allocation.scienceComms}
                  onChange={(e) =>
                    setAllocation({ ...allocation, scienceComms: Number(e.target.value) })
                  }
                />
                <div className="slider-effect-note">
                  Generates +{sliderImpact.scienceFromSliders} Science Points today
                </div>
              </div>
            </div>

            {/* Slider Warnings / Net Battery Balance */}
            <div className="slider-summary-bar">
              <div className="net-battery-pill">
                <Zap size={15} />
                <span>
                  Total Power Draw: <strong>{sliderImpact.totalAllocatedPercent}%</strong> (
                  {sliderImpact.netPowerFromSliders >= 0
                    ? `Battery charges +${sliderImpact.netPowerFromSliders}%`
                    : `Battery drains ${sliderImpact.netPowerFromSliders}%`}
                  )
                </span>
              </div>
              {sliderImpact.warnings.length > 0 && (
                <div className="slider-warning-text">
                  <AlertTriangle size={15} />
                  <span>{sliderImpact.warnings[0]}</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Turn-Based NASA Dilemma Card, Real Data Citation, & Mission Log */}
        <section className="right-column">
          {/* Compounding Consequences Banner (if an earlier turn's delayed effect triggered today!) */}
          {triggeredToday.length > 0 && (
            <div className="compounding-alert-box" role="status">
              <div className="compounding-head">
                <Clock size={17} />
                <strong>Compounding Consequence From an Earlier Decision!</strong>
              </div>
              {triggeredToday.map((item, idx) => (
                <p key={idx}>
                  • <strong>{item.sourceTitle}:</strong> {item.description}
                </p>
              ))}
            </div>
          )}

          {/* Last Turn Feedback Toast */}
          {lastTurnFeedback && !gameStatus.over && (
            <div className="last-turn-banner">
              <div className="last-turn-title">
                <CheckCircle size={16} />
                <span>
                  {config.dayUnitName} {lastTurnFeedback.day} Outcome:{' '}
                  <strong>{lastTurnFeedback.choiceTitle}</strong>
                </span>
              </div>
              <p>{lastTurnFeedback.whyItMatters}</p>
            </div>
          )}

          {!gameStatus.over ? (
            <div className="event-decision-card">
              <div className="event-card-top">
                <div className="event-badges">
                  <span className="step-badge">
                    STEP 2 • {config.dayUnitName.toUpperCase()} {day} OF {config.totalDays}
                  </span>
                  <span className={`severity-badge sev-${currentEvent.severity}`}>
                    {currentEvent.severity === 'critical'
                      ? 'CRITICAL MISSION EVENT'
                      : currentEvent.severity === 'warning'
                      ? 'ENGINEERING TRADE-OFF'
                      : 'SCIENCE & OPS DILEMMA'}
                  </span>
                  {currentEvent.isLiveDonki && (
                    <span className="live-donki-badge">
                      <Sparkles size={13} /> LIVE NASA API TELEMETRY
                    </span>
                  )}
                </div>

                {liveDonkiCard && !currentEvent.isLiveDonki && (
                  <button
                    id="load-live-donki-inline-btn"
                    className="mini-live-btn"
                    onClick={() => setInjectedLiveCard(liveDonkiCard)}
                    title="Replace this card with today's actual solar flare/CME from NASA DONKI!"
                  >
                    <Sparkles size={13} /> Test Live DONKI Storm
                  </button>
                )}
              </div>

              <h2 className="event-title">{currentEvent.title}</h2>
              {currentEvent.flrClassOrSpeed && (
                <div className="telemetry-sub-pill">{currentEvent.flrClassOrSpeed}</div>
              )}

              <p className="event-story">{currentEvent.storyKidFriendly}</p>

              <div className="constraint-callout">
                <strong>⚖️ Real Engineering Constraint:</strong> {currentEvent.engineeringConstraint}
              </div>

              {/* Traceable NASA Dataset Citation Box */}
              <div className="nasa-citation-box">
                <div className="citation-header">
                  <span className="citation-badge">
                    📊 Grounded in {currentEvent.nasaCitation.dataset} Data ({currentEvent.nasaCitation.referenceId})
                  </span>
                  <a
                    href={currentEvent.nasaCitation.url}
                    target="_blank"
                    rel="noreferrer"
                    className="citation-link"
                  >
                    Verify Source <ExternalLink size={12} />
                  </a>
                </div>
                <div className="citation-measured">
                  <strong>NASA Measurement:</strong> {currentEvent.nasaCitation.measuredValue}
                </div>
                <p className="citation-explain">{currentEvent.nasaCitation.explanation}</p>
              </div>

              {/* Decision Options (No Safe/Free Choice!) */}
              <div className="choices-list" role="radiogroup" aria-label="Mission Decision Choices">
                <div className="choices-prompt">
                  Choose your response (every choice has a real resource cost):
                </div>
                {currentEvent.choices.map((choice) => {
                  const isSelected = selectedChoiceId === choice.id;
                  return (
                    <button
                      key={choice.id}
                      id={`choice-btn-${choice.id}`}
                      type="button"
                      className={`choice-card ${isSelected ? 'choice-selected' : ''}`}
                      onClick={() => setSelectedChoiceId(choice.id)}
                    >
                      <div className="choice-card-header">
                        <span className="choice-radio-indicator" />
                        <span className="choice-label">{choice.label}</span>
                      </div>
                      <div className="choice-tradeoff-pills">
                        <span
                          className={`impact-pill ${
                            choice.effects.powerDelta >= 0 ? 'pill-pos' : 'pill-neg'
                          }`}
                        >
                          ⚡ {choice.effects.powerDelta >= 0 ? '+' : ''}
                          {choice.effects.powerDelta} Power
                        </span>
                        <span
                          className={`impact-pill ${
                            choice.effects.lifeSupportDelta >= 0 ? 'pill-pos' : 'pill-neg'
                          }`}
                        >
                          🫧 {choice.effects.lifeSupportDelta >= 0 ? '+' : ''}
                          {choice.effects.lifeSupportDelta} Life Support
                        </span>
                        <span
                          className={`impact-pill ${
                            choice.effects.healthDelta >= 0 ? 'pill-pos' : 'pill-neg'
                          }`}
                        >
                          ❤️ {choice.effects.healthDelta >= 0 ? '+' : ''}
                          {choice.effects.healthDelta} Health
                        </span>
                        <span
                          className={`impact-pill ${
                            choice.effects.radiationDoseMsV <= 0.4 ? 'pill-pos' : 'pill-warn'
                          }`}
                        >
                          ☢️ {choice.effects.radiationDoseMsV >= 0 ? '+' : ''}
                          {choice.effects.radiationDoseMsV} mSv
                        </span>
                        <span className="impact-pill pill-sci">
                          🔬 +{choice.effects.scienceDelta} Science
                        </span>
                      </div>
                      {choice.effects.delayedEffect && (
                        <div className="delayed-warning-tag">
                          ⏳ <strong>Compounds in {choice.effects.delayedEffect.turnsLater} days:</strong>{' '}
                          {choice.effects.delayedEffect.description}
                        </div>
                      )}
                      {isSelected && (
                        <div className="choice-why-preview">
                          <strong>Why this matters:</strong> {choice.whyItMatters}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="commit-action-bar">
                <button
                  id="commit-turn-btn"
                  className="commit-turn-btn"
                  disabled={!selectedChoice}
                  onClick={handleCommitTurn}
                >
                  <span>
                    {selectedChoice
                      ? `Execute ${config.dayUnitName} ${day} Command & Advance →`
                      : `Select a Decision Above to Complete ${config.dayUnitName} ${day}`}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            /* End-of-Mission Debrief & Replay Screen */
            <div className="mission-debrief-card">
              <div className={`debrief-banner ${gameStatus.won ? 'debrief-win' : 'debrief-loss'}`}>
                <span className="step-badge">MISSION DEBRIEF & ENGINEERING REPORT</span>
                <h2>{gameStatus.won ? '🏆 Outpost Mission Succeeded!' : '⚠️ Mission Ended Early'}</h2>
                <p className="debrief-reason">{gameStatus.reason}</p>
              </div>

              <div className="debrief-lesson-box">
                <h3>What Real NASA Mission Planners Learn From This:</h3>
                <p>{gameStatus.lesson}</p>
              </div>

              <div className="debrief-final-metrics">
                <div className="debrief-metric">
                  <span>Final Power</span>
                  <strong>{power}%</strong>
                </div>
                <div className="debrief-metric">
                  <span>Final Life Support</span>
                  <strong>{lifeSupport}%</strong>
                </div>
                <div className="debrief-metric">
                  <span>Final Crew Health</span>
                  <strong>{health}%</strong>
                </div>
                <div className="debrief-metric">
                  <span>Total Radiation Dose</span>
                  <strong>
                    {radiationMsV.toFixed(2)} / {config.safeRadiationLimitMsV} mSv
                  </strong>
                </div>
                <div className="debrief-metric">
                  <span>Science Achieved</span>
                  <strong>
                    {science} / {config.scienceTarget} pts
                  </strong>
                </div>
              </div>

              <div className="debrief-actions">
                <button
                  id="replay-same-site-btn"
                  className="primary-action-btn"
                  onClick={() => resetMission(site, difficulty)}
                >
                  <RotateCcw size={16} />
                  <span>Play {config.name} Again</span>
                </button>
                <button
                  id="switch-other-site-btn"
                  className="secondary-action-btn"
                  onClick={() =>
                    resetMission(site === 'moon' ? 'mars' : 'moon', difficulty)
                  }
                >
                  <Compass size={16} />
                  <span>
                    Try {site === 'moon' ? 'Mars: Jezero Outpost' : 'Moon: Shackleton Base'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Mission Telemetry Log & Site Reference Facts */}
          <div className="mission-log-panel">
            <div className="log-panel-head">
              <h3>
                <Activity size={16} /> Mission Decision Log & NASA Site Facts
              </h3>
              <button
                id="restart-mission-small-btn"
                className="text-reset-btn"
                onClick={() => resetMission(site, difficulty)}
              >
                <RotateCcw size={13} /> Reset Mission
              </button>
            </div>

            <div className="site-quick-facts">
              <strong>📍 {config.locationName} ({config.coordinates}):</strong>
              <ul>
                {config.siteFacts.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>

            {missionLogs.length > 0 && (
              <div className="log-history-list">
                {missionLogs.map((entry) => (
                  <div key={entry.day} className="log-entry-item">
                    <div className="log-entry-top">
                      <strong>
                        {config.dayUnitName} {entry.day}: {entry.choiceLabel}
                      </strong>
                      <span className="log-source-tag">{entry.nasaSourceTag}</span>
                    </div>
                    <p className="log-entry-lesson">{entry.lessonLearned}</p>
                    <div className="log-entry-stats">
                      <span>⚡ Pwr: {entry.powerEnd}%</span>
                      <span>🫧 O₂: {entry.lifeSupportEnd}%</span>
                      <span>❤️ Health: {entry.healthEnd}%</span>
                      <span>☢️ Dose: {entry.radiationMsV} mSv</span>
                      <span>🔬 +{entry.scienceEarned} Sci</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* NASA & CSA Science Traceability Modal */}
      <ScienceTraceabilityModal
        isOpen={isScienceModalOpen}
        onClose={() => setIsScienceModalOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={(newKey) => {
          setApiKey(newKey);
          loadNasaDonki(newKey);
        }}
        dataSourceMode={dataSourceMode}
        liveSummary={liveSummary}
        apiStatusMessage={apiStatusMessage}
        isFetchingLive={isFetchingLive}
        onTriggerLiveDonkiEvent={() => {
          if (liveDonkiCard) {
            setInjectedLiveCard(liveDonkiCard);
          }
        }}
      />
    </div>
  );
}

export default App;
