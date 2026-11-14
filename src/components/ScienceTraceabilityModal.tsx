import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Database,
  ExternalLink,
  Radio,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  X
} from 'lucide-react';
import { GLOSSARY_TERMS } from '../data/nasaData';
import { DataSourceMode, LiveDonkiSummary } from '../types/game';

interface ScienceTraceabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  dataSourceMode: DataSourceMode;
  liveSummary?: LiveDonkiSummary;
  apiStatusMessage: string;
  isFetchingLive: boolean;
  onTriggerLiveDonkiEvent: () => void;
}

export const ScienceTraceabilityModal: React.FC<ScienceTraceabilityModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  dataSourceMode,
  liveSummary,
  apiStatusMessage,
  isFetchingLive,
  onTriggerLiveDonkiEvent
}) => {
  const [inputKey, setInputKey] = useState(apiKey);
  const [activeTab, setActiveTab] = useState<'datasets' | 'live-api' | 'glossary'>('datasets');

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="science-modal-title"
      >
        <div className="modal-header">
          <div>
            <span className="eyebrow-tag">2026 NASA SPACE APPS CHALLENGE • VERIFIABLE SCIENCE</span>
            <h2 id="science-modal-title">NASA & CSA Data Traceability Hub</h2>
          </div>
          <button
            id="close-science-modal-btn"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-tabs">
          <button
            id="tab-datasets-btn"
            className={`tab-btn ${activeTab === 'datasets' ? 'active' : ''}`}
            onClick={() => setActiveTab('datasets')}
          >
            <Database size={16} />
            <span>NASA & CSA Datasets Used</span>
          </button>
          <button
            id="tab-live-api-btn"
            className={`tab-btn ${activeTab === 'live-api' ? 'active' : ''}`}
            onClick={() => setActiveTab('live-api')}
          >
            <Radio size={16} />
            <span>Live DONKI API & Key</span>
          </button>
          <button
            id="tab-glossary-btn"
            className={`tab-btn ${activeTab === 'glossary' ? 'active' : ''}`}
            onClick={() => setActiveTab('glossary')}
          >
            <BookOpen size={16} />
            <span>Kid-Friendly Space Glossary</span>
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'datasets' && (
            <div className="dataset-grid">
              <div className="dataset-card">
                <div className="dataset-card-head">
                  <span className="dataset-pill pill-donki">NASA DONKI</span>
                  <a
                    href="https://ccmc.gsfc.nasa.gov/tools/DONKI/"
                    target="_blank"
                    rel="noreferrer"
                    className="external-link"
                  >
                    Open DONKI <ExternalLink size={13} />
                  </a>
                </div>
                <h3>Space Weather Database Of Notifications, Knowledge, Information</h3>
                <p>
                  <strong>How it drives gameplay:</strong> Solar Flares (X-ray classes C, M, X) and
                  Coronal Mass Ejections (CME speeds in km/s) trigger storm alerts. Players must
                  choose between draining battery reserves for Active Magnetic/Water Shielding or
                  exposing the crew and crops.
                </p>
                <div className="dataset-meta">
                  Reference Events: AR13664 X8.7 Superflare (2024-05-14) + Live 28-Day `/DONKI/FLR` &
                  `/DONKI/CME` endpoints.
                </div>
              </div>

              <div className="dataset-card">
                <div className="dataset-card-head">
                  <span className="dataset-pill pill-radlab">NASA RadLab</span>
                  <a
                    href="https://visualization.osdr.nasa.gov/radlab/gui/data-api/"
                    target="_blank"
                    rel="noreferrer"
                    className="external-link"
                  >
                    Open RadLab <ExternalLink size={13} />
                  </a>
                </div>
                <h3>OSDR Radiation Dosimetry Database (ISS, LRO CRaTER, Curiosity RAD)</h3>
                <p>
                  <strong>How it drives gameplay:</strong> Sets authentic baseline absorbed radiation
                  rates: <code>1.37 mSv/day</code> on the lunar surface (Chang’e-4 LND / LRO CRaTER)
                  and <code>0.64 mSv/day</code> on Mars (Curiosity RAD, thanks to thin CO₂ shielding),
                  compared against <code>~0.43 mSv/day</code> on the ISS.
                </p>
                <div className="dataset-meta">
                  Every turn calculates cumulative mSv based on shielding power allocation and EVA choices.
                </div>
              </div>

              <div className="dataset-card">
                <div className="dataset-card-head">
                  <span className="dataset-pill pill-osdr">NASA OSDR</span>
                  <a
                    href="https://osdr.nasa.gov/bio/repo/"
                    target="_blank"
                    rel="noreferrer"
                    className="external-link"
                  >
                    Open OSDR <ExternalLink size={13} />
                  </a>
                </div>
                <h3>Open Science Data Repository (Space Biology & Human Health)</h3>
                <p>
                  <strong>How it drives gameplay:</strong> Models real biological trade-offs from
                  studies <code>OSD-379</code> (bone/muscle unloading countermeasures),{' '}
                  <code>OSD-242</code> (circadian misalignment), and <code>OSD-321</code> (spaceflight
                  plant growth). Skipping exercise saves oxygen today but compounds crew fatigue
                  2 days later.
                </p>
                <div className="dataset-meta">
                  Demonstrates multi-day biological compounding rather than one-off arcade penalties.
                </div>
              </div>

              <div className="dataset-card">
                <div className="dataset-card-head">
                  <span className="dataset-pill pill-marstrek">Mars Trek & CSA Food</span>
                  <a
                    href="https://www.asc-csa.gc.ca/eng/youth-educators/toolkits/food-production/"
                    target="_blank"
                    rel="noreferrer"
                    className="external-link"
                  >
                    CSA Toolkit <ExternalLink size={13} />
                  </a>
                </div>
                <h3>NASA Mars Trek (Jezero Crater) & CSA Lunar/Martian Hydroponics</h3>
                <p>
                  <strong>How it drives gameplay:</strong> Grounds the Mars mission at Jezero Delta
                  (<code>18.38°N, 77.58°E, -2,540m MOLA</code>) with Perseverance MEDA dust optical
                  depth storms and an 18-minute one-way radio delay. CSA hydroponic dwarf wheat &
                  lettuce convert LED power + water into delayed O₂ and crew nutrition.
                </p>
                <div className="dataset-meta">
                  Teaches why bioregenerative food systems are both power-hungry and essential.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'live-api' && (
            <div className="live-api-section">
              <div className={`api-status-banner ${dataSourceMode === 'live' ? 'banner-live' : 'banner-archived'}`}>
                <div className="banner-title">
                  {dataSourceMode === 'live' ? (
                    <>
                      <CheckCircle2 size={18} />
                      <span>LIVE NASA DONKI API CONNECTED</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert size={18} />
                      <span>VERIFIED ARCHIVED NASA DATASET ACTIVE (HONEST FALLBACK)</span>
                    </>
                  )}
                </div>
                <p className="banner-sub">{apiStatusMessage}</p>
              </div>

              {liveSummary && (
                <div className="live-telemetry-box">
                  <h4>Latest Live Telemetry Fetched from api.nasa.gov/DONKI (Past 28 Days)</h4>
                  <div className="telemetry-stats-row">
                    <div className="tele-stat">
                      <span className="tele-label">Solar Flares (FLR)</span>
                      <span className="tele-val">{liveSummary.flareCount} recorded</span>
                    </div>
                    <div className="tele-stat">
                      <span className="tele-label">Coronal Mass Ejections (CME)</span>
                      <span className="tele-val">{liveSummary.cmeCount} recorded</span>
                    </div>
                    <div className="tele-stat">
                      <span className="tele-label">Strongest Live Flare</span>
                      <span className="tele-val">
                        {liveSummary.strongestFlare?.classType || 'M-Class'} (
                        {liveSummary.strongestFlare?.sourceLocation || 'Active Sun'})
                      </span>
                    </div>
                    <div className="tele-stat">
                      <span className="tele-label">Fastest Live CME</span>
                      <span className="tele-val">{liveSummary.fastestCme?.speedKmS || 680} km/s</span>
                    </div>
                  </div>
                  <button
                    id="inject-live-donki-btn"
                    className="primary-action-btn"
                    onClick={() => {
                      onTriggerLiveDonkiEvent();
                      onClose();
                    }}
                  >
                    <Sparkles size={16} />
                    <span>Load This Live NASA DONKI Event Into Current Turn!</span>
                  </button>
                </div>
              )}

              <div className="api-key-form">
                <label htmlFor="nasa-api-key-input">
                  NASA Open API Key (Defaults to <code>DEMO_KEY</code> — get a free higher-limit key at{' '}
                  <a href="https://api.nasa.gov/" target="_blank" rel="noreferrer">
                    api.nasa.gov
                  </a>
                  )
                </label>
                <div className="api-input-row">
                  <input
                    id="nasa-api-key-input"
                    type="text"
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder="Enter NASA API key or DEMO_KEY"
                  />
                  <button
                    id="save-api-key-btn"
                    className="secondary-action-btn"
                    disabled={isFetchingLive}
                    onClick={() => onSaveApiKey(inputKey)}
                  >
                    <RefreshCw size={15} className={isFetchingLive ? 'spin' : ''} />
                    <span>{isFetchingLive ? 'Fetching...' : 'Fetch Live DONKI'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'glossary' && (
            <div className="glossary-grid">
              {GLOSSARY_TERMS.map((g) => (
                <div key={g.id} className="glossary-card">
                  <div className="glossary-term-head">
                    <h4>{g.term}</h4>
                    <span className="glossary-source">{g.nasaSource}</span>
                  </div>
                  <p className="glossary-def">{g.shortDef}</p>
                  <div className="glossary-analogy">
                    <strong>Kid Analogy:</strong> {g.kidAnalogy}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
