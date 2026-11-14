import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Award,
  BatteryCharging,
  BookOpen,
  CheckCircle,
  Clock,
  Compass,
  Database,
  ExternalLink,
  Flame,
  HeartPulse,
  Info,
  Leaf,
  Radio,
  RotateCcw,
  Shield,
  Sliders,
  Sparkles,
  Sun,
  Volume2,
  VolumeX,
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
import { sound } from './utils/sound';

const DEFAULT_ALLOCATION: PowerAllocation = {
  lifeSupport: 30,
  shielding: 25,
  greenhouse: 20,
  scienceComms: 20
};

export function App() {
  // Mission configuration
  const [site, setSite] = useState<MissionSiteId>('moon');
  const [difficulty, setDifficulty] = useState<DifficultyMode>('cadet');
  const config = MISSION_CONFIGS[site];

  // Core simulation stats
  const [day, setDay] = useState<number>(1);
  const [power, setPower] = useState<number>(85);
  const [lifeSupport, setLifeSupport] = useState<number>(85);
  const [health, setHealth] = useState<number>(92);
  const [cropHealth, setCropHealth] = useState<number>(80);
  const [radiationMsV, setRadiationMsV] = useState<number>(1.37);
  const [science, setScience] = useState<number>(15);

  const [allocation, setAllocation] = useState<PowerAllocation>(DEFAULT_ALLOCATION);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [delayedQueue, setDelayedQueue] = useState<DelayedConsequence[]>([]);
  const [triggeredToday, setTriggeredToday] = useState<DelayedConsequence[]>([]);
  const [missionLogs, setMissionLogs] = useState<DayLogEntry[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Show/Hide optional panels so screen stays completely clean
  const [showPowerSliders, setShowPowerSliders] = useState<boolean>(false);
  const [showLogsDrawer, setShowLogsDrawer] = useState<boolean>(false);

  // NASA API & Traceability modal
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

  // Sound toggle
  const toggleSound = () => {
    sound.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) sound.click();
  };

  // Build filtered mission deck for Moon or Mars
  const missionDeck = useMemo(() => {
    return CURATED_MISSION_EVENTS.filter(
      (ev) => ev.site === 'both' || ev.site === site
    );
  }, [site]);

  const currentEvent: MissionEventCard = useMemo(() => {
    if (injectedLiveCard) return injectedLiveCard;
    const idx = (day - 1) % missionDeck.length;
    return missionDeck[idx];
  }, [day, missionDeck, injectedLiveCard]);

  // Load NASA DONKI telemetry
  const loadNasaDonki = async (keyToUse: string) => {
    setIsFetchingLive(true);
    const res = await fetchLiveDonkiSpaceWeather(keyToUse);
    setIsFetchingLive(false);

    if (res.ok && res.summary && res.liveEventCard) {
      setDataSourceMode('live');
      setLiveSummary(res.summary);
      setLiveDonkiCard(res.liveEventCard);
      setApiStatusMessage(
        `Connected to api.nasa.gov/DONKI (${res.summary.flareCount} Flares & ${res.summary.cmeCount} CMEs in past 28d).`
      );
    } else {
      setDataSourceMode('archived');
      setApiStatusMessage(
        res.errorReason ||
          'Running on Verified Archived NASA Datasets (DONKI May 2024 Superflare, RadLab, OSDR, Mars Trek).'
      );
    }
  };

  useEffect(() => {
    loadNasaDonki(apiKey);
  }, []);

  // Reset Mission
  const resetMission = (newSite: MissionSiteId = site, newDiff: DifficultyMode = difficulty) => {
    sound.click();
    setSite(newSite);
    setDifficulty(newDiff);
    setDay(1);
    setPower(85);
    setLifeSupport(85);
    setHealth(92);
    setCropHealth(80);
    setRadiationMsV(newSite === 'moon' ? 1.37 : 0.64);
    setScience(15);
    setAllocation(DEFAULT_ALLOCATION);
    setSelectedChoiceId(null);
    setDelayedQueue([]);
    setTriggeredToday([]);
    setMissionLogs([]);
    setInjectedLiveCard(null);
  };

  // Check Game Over / Victory
  const gameStatus = useMemo(() => {
    if (power <= 0) {
      return {
        over: true,
        won: false,
        title: 'Total Outpost Blackout! ⚡',
        reason: 'Your batteries completely died! Cabin heaters and life support shut down together.',
        lesson: 'NASA Rule: Always keep an emergency 20% power reserve for heaters and air scrubbers!'
      };
    }
    if (lifeSupport <= 0) {
      return {
        over: true,
        won: false,
        title: 'Life Support Ran Out! 🫧',
        reason: 'Oxygen & clean water hit 0%. The crew had to evacuate to their return craft.',
        lesson: 'NASA Rule: Throttling ECLSS or letting greenhouse plants die costs more air tomorrow!'
      };
    }
    if (health <= 0 || radiationMsV >= config.safeRadiationLimitMsV) {
      return {
        over: true,
        won: false,
        title: 'Radiation Safety Exceeded! ☢️',
        reason: `Radiation reached ${radiationMsV.toFixed(1)} / ${config.safeRadiationLimitMsV} mSv.`,
        lesson: 'NASA Rule: Active shielding and water-walls are essential during solar flares!'
      };
    }
    if (day > config.totalDays) {
      const won = science >= config.scienceTarget;
      return {
        over: true,
        won,
        title: won ? '🏆 Mission Accomplished! Outstanding Job Commander!' : '🚀 Mission Complete - Crew Survived!',
        reason: won
          ? `You survived all ${config.totalDays} ${config.dayUnitName}s and collected ${science} Science Stars!`
          : `You kept the whole crew safe (${science}/${config.scienceTarget} science stars).`,
        lesson: won
          ? 'You proved you can balance power, food, life support, and radiation shielding like a real NASA flight director!'
          : 'Keeping humans alive is #1 in spaceflight! Next time, harvest fresh crops to free up more battery power for science.'
      };
    }
    return { over: false, won: false, title: '', reason: '', lesson: '' };
  }, [power, lifeSupport, health, radiationMsV, day, config, science]);

  // Daily slider impacts
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

  // Commit turn & launch next Sol
  const handleCommitTurn = () => {
    if (!selectedChoice || gameStatus.over) return;

    sound.advance();
    const nextDay = day + 1;

    // Check compounding effects
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
    setSelectedChoiceId(null);
    setInjectedLiveCard(null);
    setDay(nextDay);
  };

  // Quick Preset Power Helpers
  const applyPreset = (preset: 'nominal' | 'storm' | 'greenhouse' | 'science') => {
    sound.shield();
    if (preset === 'nominal') {
      setAllocation({ lifeSupport: 30, shielding: 25, greenhouse: 20, scienceComms: 20 });
    } else if (preset === 'storm') {
      setAllocation({ lifeSupport: 28, shielding: 42, greenhouse: 10, scienceComms: 10 });
    } else if (preset === 'greenhouse') {
      setAllocation({ lifeSupport: 28, shielding: 20, greenhouse: 34, scienceComms: 12 });
    } else if (preset === 'science') {
      setAllocation({ lifeSupport: 26, shielding: 20, greenhouse: 16, scienceComms: 34 });
    }
  };

  return (
    <div className="game-app-wrapper">
      {/* ------------------------------------------------------------------ */}
      {/* 1. TOP GAME CONTROL BAR                                            */}
      {/* ------------------------------------------------------------------ */}
      <header className="game-navbar">
        <div className="game-branding">
          <div className="game-logo-rocket" onClick={() => sound.click()}>🚀</div>
          <div>
            <h1 className="game-title">Outpost Commander</h1>
            <div className="game-tagline">2026 NASA Space Apps Challenge • Ages 7–12</div>
          </div>
        </div>

        {/* Planet Outpost Selector (Moon vs Mars) */}
        <div className="game-planet-tabs" role="group" aria-label="Select Mission Destination">
          <button
            id="tab-moon"
            className={`planet-tab-btn ${site === 'moon' ? 'planet-tab-active-moon' : ''}`}
            onClick={() => resetMission('moon')}
          >
            <span className="planet-icon">🌕</span>
            <div className="planet-text">
              <strong>Moon Base</strong>
              <small>Shackleton Crater</small>
            </div>
          </button>
          <button
            id="tab-mars"
            className={`planet-tab-btn ${site === 'mars' ? 'planet-tab-active-mars' : ''}`}
            onClick={() => resetMission('mars')}
          >
            <span className="planet-icon">🔴</span>
            <div className="planet-text">
              <strong>Mars Outpost</strong>
              <small>Jezero Crater (18m Delay)</small>
            </div>
          </button>
        </div>

        {/* Audio & NASA Science modal button */}
        <div className="game-header-tools">
          <button
            id="audio-toggle-btn"
            className="tool-circle-btn"
            onClick={toggleSound}
            title={soundEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects'}
            aria-label="Toggle Sound"
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          <button
            id="open-science-modal-btn"
            className="nasa-pill-btn"
            onClick={() => {
              sound.click();
              setIsScienceModalOpen(true);
            }}
          >
            <Database size={15} />
            <span>NASA Data & Rules</span>
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* 2. CHUNKY ARCADE HUD STATUS STRIP                                  */}
      {/* ------------------------------------------------------------------ */}
      <section className="arcade-hud-strip" aria-label="Outpost Status Meters">
        {/* Battery Power */}
        <div className={`arcade-hud-meter ${power <= 25 ? 'hud-danger' : ''}`}>
          <div className="meter-icon-box box-amber">⚡</div>
          <div className="meter-content">
            <div className="meter-label-row">
              <span>BATTERY</span>
              <strong>{power}%</strong>
            </div>
            <div className="chunky-bar-track">
              <div className="chunky-bar-fill fill-amber" style={{ width: `${power}%` }} />
            </div>
            <div className="meter-sub">Draw: {sliderImpact.totalAllocatedPercent}%</div>
          </div>
        </div>

        {/* Life Support (O2 & Water) */}
        <div className={`arcade-hud-meter ${lifeSupport <= 25 ? 'hud-danger' : ''}`}>
          <div className="meter-icon-box box-cyan">🫧</div>
          <div className="meter-content">
            <div className="meter-label-row">
              <span>AIR & WATER</span>
              <strong>{lifeSupport}%</strong>
            </div>
            <div className="chunky-bar-track">
              <div className="chunky-bar-fill fill-cyan" style={{ width: `${lifeSupport}%` }} />
            </div>
            <div className="meter-sub">Cabin ECLSS</div>
          </div>
        </div>

        {/* Radiation & Shielding */}
        <div
          className={`arcade-hud-meter ${
            health <= 25 || radiationMsV >= config.safeRadiationLimitMsV * 0.8
              ? 'hud-danger'
              : ''
          }`}
        >
          <div className="meter-icon-box box-emerald">🛡️</div>
          <div className="meter-content">
            <div className="meter-label-row">
              <span>CREW SAFETY</span>
              <strong>{health}%</strong>
            </div>
            <div className="chunky-bar-track">
              <div className="chunky-bar-fill fill-emerald" style={{ width: `${health}%` }} />
            </div>
            <div className="meter-sub">
              Dose: {radiationMsV.toFixed(1)} / {config.safeRadiationLimitMsV} mSv
            </div>
          </div>
        </div>

        {/* Hydroponic Food Crops */}
        <div className="arcade-hud-meter">
          <div className="meter-icon-box box-green">🥗</div>
          <div className="meter-content">
            <div className="meter-label-row">
              <span>CSA CROPS</span>
              <strong>{cropHealth}%</strong>
            </div>
            <div className="chunky-bar-track">
              <div className="chunky-bar-fill fill-green" style={{ width: `${cropHealth}%` }} />
            </div>
            <div className="meter-sub">Dwarf Wheat & Lettuce</div>
          </div>
        </div>

        {/* Mission Science Stars */}
        <div className="arcade-hud-meter meter-stars">
          <div className="meter-icon-box box-purple">⭐</div>
          <div className="meter-content">
            <div className="meter-label-row">
              <span>DISCOVERY</span>
              <strong>{science} / {config.scienceTarget}</strong>
            </div>
            <div className="chunky-bar-track">
              <div
                className="chunky-bar-fill fill-purple"
                style={{
                  width: `${Math.min(100, Math.round((science / config.scienceTarget) * 100))}%`
                }}
              />
            </div>
            <div className="meter-sub">Target Goal</div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 3. HERO GAMEPLAY CANVAS (LARGE INTERACTIVE OUTPOST)                */}
      {/* ------------------------------------------------------------------ */}
      <main className="game-stage-container">
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
        <div className="canvas-hint-pill">
          💡 Tap any building, the forcefield shield, or the astronaut to inspect your base!
        </div>
      </main>

      {/* ------------------------------------------------------------------ */}
      {/* 4. MISSION ACTION STATION (TURNS & DECISIONS)                       */}
      {/* ------------------------------------------------------------------ */}
      <section className="action-station">
        {/* Compounding Delayed Alert (if earlier turn consequence hit today!) */}
        {triggeredToday.length > 0 && (
          <div className="delayed-alert-banner animate-bounce">
            <Clock size={20} className="icon-pulse" />
            <div>
              <strong>Compounding Consequence Triggered Today!</strong>
              {triggeredToday.map((c, idx) => (
                <div key={idx}>• {c.description}</div>
              ))}
            </div>
          </div>
        )}

        {!gameStatus.over ? (
          <div className="event-action-card">
            {/* Event Header Banner */}
            <div className="event-banner-head">
              <div className="day-badge-chunky">
                {site === 'moon' ? 'LUNAR CYCLE' : 'MARTIAN SOL'} {day} OF {config.totalDays}
              </div>
              <div className="event-title-group">
                <h2 className="event-hero-title">{currentEvent.title}</h2>
                <p className="event-hero-story">{currentEvent.storyKidFriendly}</p>
              </div>
            </div>

            {/* Quick Science Fact / Real NASA Citation Badge */}
            <div className="nasa-fact-badge">
              <span>🔬 <strong>Real NASA Science ({currentEvent.nasaCitation.dataset}):</strong> {currentEvent.nasaCitation.measuredValue}</span>
              <button
                className="fact-verify-btn"
                onClick={() => {
                  sound.click();
                  setIsScienceModalOpen(true);
                }}
              >
                Why this happens <Info size={13} />
              </button>
            </div>

            {/* 3 Big Chunky Action Cards (Every Choice Has A Cost!) */}
            <div className="action-cards-grid" role="radiogroup" aria-label="Select Mission Decision">
              {currentEvent.choices.map((choice) => {
                const isSelected = selectedChoiceId === choice.id;
                return (
                  <button
                    key={choice.id}
                    id={`choice-${choice.id}`}
                    type="button"
                    className={`big-choice-btn ${isSelected ? 'choice-active' : ''}`}
                    onClick={() => {
                      sound.click();
                      setSelectedChoiceId(choice.id);
                    }}
                  >
                    <div className="choice-btn-top">
                      <div className="choice-radio-dot">{isSelected ? '✓' : ''}</div>
                      <span className="choice-btn-title">{choice.label}</span>
                    </div>

                    {/* Trade-off summary pills */}
                    <div className="choice-tradeoff-tags">
                      <span
                        className={`trade-tag ${
                          choice.effects.powerDelta >= 0 ? 'tag-pos' : 'tag-neg'
                        }`}
                      >
                        ⚡ {choice.effects.powerDelta >= 0 ? '+' : ''}
                        {choice.effects.powerDelta}% Power
                      </span>
                      <span
                        className={`trade-tag ${
                          choice.effects.lifeSupportDelta >= 0 ? 'tag-pos' : 'tag-neg'
                        }`}
                      >
                        🫧 {choice.effects.lifeSupportDelta >= 0 ? '+' : ''}
                        {choice.effects.lifeSupportDelta}% Air
                      </span>
                      <span
                        className={`trade-tag ${
                          choice.effects.healthDelta >= 0 ? 'tag-pos' : 'tag-neg'
                        }`}
                      >
                        ❤️ {choice.effects.healthDelta >= 0 ? '+' : ''}
                        {choice.effects.healthDelta}% Safety
                      </span>
                      <span
                        className={`trade-tag ${
                          choice.effects.radiationDoseMsV <= 0.4 ? 'tag-pos' : 'tag-warn'
                        }`}
                      >
                        ☢️ {choice.effects.radiationDoseMsV >= 0 ? '+' : ''}
                        {choice.effects.radiationDoseMsV} mSv
                      </span>
                      <span className="trade-tag tag-sci">
                        ⭐ +{choice.effects.scienceDelta} Stars
                      </span>
                    </div>

                    {/* Consequence explanation */}
                    <div className="choice-explain-text">
                      {choice.whyItMatters}
                    </div>

                    {choice.effects.delayedEffect && (
                      <div className="delayed-tag-pill">
                        ⏳ <strong>Compounds in {choice.effects.delayedEffect.turnsLater} days:</strong>{' '}
                        {choice.effects.delayedEffect.description}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Power Sliders Toggle (Keep screen clean by default, open when child wants to tweak power) */}
            <div className="power-quick-controls">
              <div className="power-quick-header">
                <div className="quick-presets-group">
                  <span className="quick-label">⚡ Power Preset:</span>
                  <button
                    className="preset-pill"
                    onClick={() => applyPreset('nominal')}
                  >
                    Nominal Balanced
                  </button>
                  <button
                    className="preset-pill"
                    onClick={() => applyPreset('storm')}
                  >
                    🛡️ Max Shield
                  </button>
                  <button
                    className="preset-pill"
                    onClick={() => applyPreset('greenhouse')}
                  >
                    🥗 Farm Surge
                  </button>
                  <button
                    className="preset-pill"
                    onClick={() => applyPreset('science')}
                  >
                    🔭 Science Push
                  </button>
                </div>

                <button
                  className="customize-power-link"
                  onClick={() => {
                    sound.click();
                    setShowPowerSliders(!showPowerSliders);
                  }}
                >
                  <Sliders size={14} />
                  <span>{showPowerSliders ? 'Hide Sliders' : 'Customize Power Sliders'}</span>
                </button>
              </div>

              {/* Expandable Power Sliders */}
              {showPowerSliders && (
                <div className="expandable-sliders-box">
                  <div className="slider-row">
                    <span>🫧 Life Support (ECLSS): <strong>{allocation.lifeSupport}%</strong></span>
                    <input
                      type="range"
                      min={10}
                      max={50}
                      step={2}
                      value={allocation.lifeSupport}
                      onChange={(e) =>
                        setAllocation({ ...allocation, lifeSupport: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="slider-row">
                    <span>🛡️ Radiation Shielding: <strong>{allocation.shielding}%</strong></span>
                    <input
                      type="range"
                      min={10}
                      max={50}
                      step={2}
                      value={allocation.shielding}
                      onChange={(e) =>
                        setAllocation({ ...allocation, shielding: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="slider-row">
                    <span>🥗 Greenhouse Crops: <strong>{allocation.greenhouse}%</strong></span>
                    <input
                      type="range"
                      min={5}
                      max={45}
                      step={2}
                      value={allocation.greenhouse}
                      onChange={(e) =>
                        setAllocation({ ...allocation, greenhouse: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="slider-row">
                    <span>📡 Science & Comms: <strong>{allocation.scienceComms}%</strong></span>
                    <input
                      type="range"
                      min={5}
                      max={45}
                      step={2}
                      value={allocation.scienceComms}
                      onChange={(e) =>
                        setAllocation({ ...allocation, scienceComms: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="slider-info-note">
                    Total Load: <strong>{sliderImpact.totalAllocatedPercent}%</strong> (
                    {sliderImpact.netPowerFromSliders >= 0
                      ? `Battery charges +${sliderImpact.netPowerFromSliders}%`
                      : `Battery drains ${sliderImpact.netPowerFromSliders}%`}
                    )
                  </div>
                </div>
              )}
            </div>

            {/* BIG ARCADE ADVANCE / NEXT SOL BUTTON */}
            <div className="launch-next-action-row">
              <button
                id="launch-next-sol-btn"
                className="giant-arcade-btn"
                disabled={!selectedChoice}
                onClick={handleCommitTurn}
              >
                <span>
                  {selectedChoice
                    ? `CONFIRM ACTION & LAUNCH NEXT ${config.dayUnitName.toUpperCase()} 🚀`
                    : `SELECT ONE OF THE 3 ACTION CARDS ABOVE TO PROCEED 👆`}
                </span>
              </button>
            </div>
          </div>
        ) : (
          /* End-of-Mission Debrief & Replay */
          <div className="game-over-card">
            <div className={`game-over-banner ${gameStatus.won ? 'banner-win' : 'banner-lost'}`}>
              <h2>{gameStatus.title}</h2>
              <p className="game-over-reason">{gameStatus.reason}</p>
            </div>

            <div className="game-over-lesson">
              <h3>What Real NASA Mission Planners Learn:</h3>
              <p>{gameStatus.lesson}</p>
            </div>

            <div className="game-over-stats-grid">
              <div className="stat-pod">
                <span>Final Battery</span>
                <strong>{power}%</strong>
              </div>
              <div className="stat-pod">
                <span>Final Life Support</span>
                <strong>{lifeSupport}%</strong>
              </div>
              <div className="stat-pod">
                <span>Total Radiation</span>
                <strong>{radiationMsV.toFixed(1)} / {config.safeRadiationLimitMsV} mSv</strong>
              </div>
              <div className="stat-pod">
                <span>Discovery Stars</span>
                <strong>{science} / {config.scienceTarget} ⭐</strong>
              </div>
            </div>

            <div className="game-over-actions">
              <button
                id="replay-btn"
                className="giant-arcade-btn"
                onClick={() => resetMission(site, difficulty)}
              >
                🔄 Play Again on {config.name}
              </button>
              <button
                id="switch-planet-btn"
                className="secondary-arcade-btn"
                onClick={() => resetMission(site === 'moon' ? 'mars' : 'moon', difficulty)}
              >
                🚀 Fly to {site === 'moon' ? 'Mars Outpost' : 'Moon Base'}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 5. OPTIONAL MISSION LOG DRAWER (Hidden by default, click to open)  */}
      {/* ------------------------------------------------------------------ */}
      <footer className="game-footer">
        <button
          className="drawer-toggle-btn"
          onClick={() => setShowLogsDrawer(!showLogsDrawer)}
        >
          <Activity size={16} />
          <span>{showLogsDrawer ? 'Hide Mission Log & Site Telemetry' : 'View Mission Log & Site Facts'}</span>
        </button>

        {showLogsDrawer && (
          <div className="drawer-content">
            <div className="site-fact-sheet">
              <strong>📍 {config.locationName} ({config.coordinates}):</strong>
              <ul>
                {config.siteFacts.map((fact, idx) => (
                  <li key={idx}>{fact}</li>
                ))}
              </ul>
            </div>

            {missionLogs.length > 0 ? (
              <div className="mini-logs-list">
                {missionLogs.map((entry) => (
                  <div key={entry.day} className="log-row">
                    <strong>{config.dayUnitName} {entry.day}:</strong> {entry.choiceLabel} (
                    ⚡ {entry.powerEnd}% | 🫧 {entry.lifeSupportEnd}% | ☢️ {entry.radiationMsV} mSv | ⭐ +{entry.scienceEarned})
                  </div>
                ))}
              </div>
            ) : (
              <div className="mini-logs-empty">No turns completed yet.</div>
            )}
          </div>
        )}
      </footer>

      {/* NASA Science & Data Traceability Modal for Teachers/Judges */}
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
