import React, { useState } from 'react';
import donki from '../data/donki.json';
import radlab from '../data/radlab.json';
import osdr from '../data/osdr.json';

interface ScienceTraceabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey?: string;
  onSaveApiKey?: (key: string) => void;
}

export function ScienceTraceabilityModal({
  isOpen,
  onClose,
  apiKey = (import.meta.env.VITE_NASA_API_KEY as string) || 'DEMO_KEY',
  onSaveApiKey
}: ScienceTraceabilityModalProps) {
  const [activeTab, setActiveTab] = useState<'datasets' | 'api' | 'glossary'>('datasets');
  const [keyInput, setKeyInput] = useState(apiKey);
  const [savedNote, setSavedNote] = useState(false);

  if (!isOpen) return null;

  const handleSaveKey = () => {
    if (onSaveApiKey) onSaveApiKey(keyInput);
    setSavedNote(true);
    setTimeout(() => setSavedNote(false), 2500);
  };

  return (
    <div className="trace-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="trace-modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="trace-modal-header">
          <div>
            <div className="trace-eyebrow">2026 NASA SPACE APPS CHALLENGE • VERIFIABLE SCIENCE</div>
            <h2 className="trace-title">NASA & CSA Data Traceability Hub</h2>
          </div>
          <button className="trace-close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        <div className="trace-tabs">
          <button
            className={`trace-tab ${activeTab === 'datasets' ? 'trace-tab-active' : ''}`}
            onClick={() => setActiveTab('datasets')}
          >
            📁 NASA & CSA Datasets Used
          </button>
          <button
            className={`trace-tab ${activeTab === 'api' ? 'trace-tab-active' : ''}`}
            onClick={() => setActiveTab('api')}
          >
            📶 Live DONKI API & Key
          </button>
          <button
            className={`trace-tab ${activeTab === 'glossary' ? 'trace-tab-active' : ''}`}
            onClick={() => setActiveTab('glossary')}
          >
            📖 Kid-Friendly Space Glossary
          </button>
        </div>

        <div className="trace-body">
          {activeTab === 'datasets' && (
            <div className="trace-dataset-grid">
              {/* Card 1: DONKI */}
              <div className="trace-card">
                <div className="trace-card-head">
                  <span className="trace-tag tag-donki">NASA DONKI</span>
                  <a
                    href="https://ccmc.gsfc.nasa.gov/tools/DONKI/"
                    target="_blank"
                    rel="noreferrer"
                    className="trace-link"
                  >
                    Open DONKI ↗
                  </a>
                </div>
                <h3>Space Weather Database Of Notifications, Knowledge, Information</h3>
                <p>
                  <strong>How it drives gameplay:</strong> Solar Flares (X-ray classes C, M, X) and Coronal Mass Ejections (CME speeds in km/s) trigger storm alerts. Players must choose between draining battery reserves for Active Magnetic/Water Shielding or exposing the crew and crops.
                </p>
                <div className="trace-meta">
                  Reference Events: {donki.flares.length} archived strong flares + {donki.solarParticleEvents.length} solar particle events ({donki.range.start} → {donki.range.end}).
                </div>
              </div>

              {/* Card 2: RadLab */}
              <div className="trace-card">
                <div className="trace-card-head">
                  <span className="trace-tag tag-radlab">NASA RadLab</span>
                  <a
                    href="https://visualization.osdr.nasa.gov/radlab/gui/data-api/"
                    target="_blank"
                    rel="noreferrer"
                    className="trace-link"
                  >
                    Open RadLab ↗
                  </a>
                </div>
                <h3>OSDR Radiation Dosimetry Database (ISS, LRO CRaTER, Curiosity RAD)</h3>
                <p>
                  <strong>How it drives gameplay:</strong> Sets authentic baseline absorbed radiation rates: 1.37 mSv/day on the lunar surface (Chang’e-4 LND / LRO CRaTER) and 0.64 mSv/day on Mars (Curiosity RAD, thanks to thin CO₂ shielding), compared against ~0.43 mSv/day on the ISS.
                </p>
                <div className="trace-meta">
                  Every turn calculates cumulative mSv based on shielding power allocation and EVA choices.
                </div>
              </div>

              {/* Card 3: OSDR */}
              <div className="trace-card">
                <div className="trace-card-head">
                  <span className="trace-tag tag-osdr">NASA OSDR</span>
                  <a
                    href="https://osdr.nasa.gov/bio/repo/"
                    target="_blank"
                    rel="noreferrer"
                    className="trace-link"
                  >
                    Open OSDR ↗
                  </a>
                </div>
                <h3>Open Science Data Repository (Space Biology & Human Health)</h3>
                <p>
                  <strong>How it drives gameplay:</strong> Models real biological trade-offs from studies OSD-379 (bone/muscle unloading countermeasures), OSD-242 (circadian misalignment), and OSD-321 (spaceflight plant growth). Skipping exercise saves oxygen today but compounds crew fatigue 2 days later.
                </p>
                <div className="trace-meta">
                  Demonstrates multi-day biological compounding rather than one-off arcade penalties.
                </div>
              </div>

              {/* Card 4: Mars Trek & CSA Food */}
              <div className="trace-card">
                <div className="trace-card-head">
                  <span className="trace-tag tag-csa">Mars Trek & CSA Food</span>
                  <a
                    href="https://www.asc-csa.gc.ca/eng/youth-educators/toolkits/food-production/"
                    target="_blank"
                    rel="noreferrer"
                    className="trace-link"
                  >
                    CSA Toolkit ↗
                  </a>
                </div>
                <h3>NASA Mars Trek (Jezero Crater) & CSA Lunar/Martian Hydroponics</h3>
                <p>
                  <strong>How it drives gameplay:</strong> Grounds the Mars mission at Jezero Delta (18.38°N, 77.58°E, -2,540m MOLA) with Perseverance MEDA dust optical depth storms and an 18-minute one-way radio delay. CSA hydroponic dwarf wheat & lettuce convert LED power + water into delayed O₂ and crew nutrition.
                </p>
                <div className="trace-meta">
                  Teaches why bioregenerative food systems are both power-hungry and essential.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="trace-api-box">
              <div className="trace-api-status-banner">
                <div className="banner-head">
                  <span className="live-dot" />
                  <strong>NASA DONKI OPEN API CONNECTIVITY</strong>
                </div>
                <p>
                  Calls <code>https://api.nasa.gov/DONKI/notifications</code> directly in the browser to evaluate the Sun's real-time mood.
                </p>
              </div>

              <div className="trace-api-key-form">
                <label htmlFor="trace-key-input">
                  NASA API Key (Loaded from <code>.env</code> as <code>VITE_NASA_API_KEY</code>):
                </label>
                <div className="trace-key-row">
                  <input
                    id="trace-key-input"
                    type="text"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder="Enter NASA API Key or DEMO_KEY"
                  />
                  <button className="btn btn-primary" onClick={handleSaveKey}>
                    Update Key
                  </button>
                </div>
                {savedNote && <div className="trace-saved-note">✓ Key updated successfully!</div>}
                <div className="trace-api-tip">
                  💡 Free personal NASA keys with higher hourly rate limits can be created at{' '}
                  <a href="https://api.nasa.gov/" target="_blank" rel="noreferrer">
                    api.nasa.gov
                  </a>
                  . If offline or rate-limited, the game automatically falls back to our curated NASA dataset.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'glossary' && (
            <div className="trace-glossary-grid">
              <div className="trace-glossary-item">
                <h4>mSv (Millisievert)</h4>
                <div className="glossary-analogy">
                  💡 <strong>Kid Analogy:</strong> Think of 1 mSv like getting 10 dental X-rays. On Earth we get ~2.4 mSv in a whole year; on the Moon you get more than half of that in a single day!
                </div>
                <div className="glossary-source">Source: NASA RadLab / OSDR Radiation Dosimetry</div>
              </div>

              <div className="trace-glossary-item">
                <h4>CME (Coronal Mass Ejection)</h4>
                <div className="glossary-analogy">
                  💡 <strong>Kid Analogy:</strong> Like a giant solar hurricane! Clouds of magnetized plasma blast through space at 500 to 2,500 km per second.
                </div>
                <div className="glossary-source">Source: NASA DONKI Space Weather Database</div>
              </div>

              <div className="trace-glossary-item">
                <h4>Sol (Martian Day)</h4>
                <div className="glossary-analogy">
                  💡 <strong>Kid Analogy:</strong> One rotation of Mars takes 24 hours and 39 minutes—almost 40 minutes longer than an Earth day, like an extra recess every day!
                </div>
                <div className="glossary-source">Source: NASA Mars Rover & Mars Trek Mission Ops</div>
              </div>

              <div className="trace-glossary-item">
                <h4>ECLSS (Life Support System)</h4>
                <div className="glossary-analogy">
                  💡 <strong>Kid Analogy:</strong> Since there are no lakes or trees on the Moon or Mars, ECLSS scrubs CO₂ from astronauts’ breath and filters every drop of water into clean air and drinks!
                </div>
                <div className="glossary-source">Source: NASA Artemis & ISS Life Support Engineering</div>
              </div>

              <div className="trace-glossary-item">
                <h4>Bioregenerative Hydroponics</h4>
                <div className="glossary-analogy">
                  💡 <strong>Kid Analogy:</strong> Plants act as double-duty superheroes: their leaves soak up CO₂ to release fresh oxygen, while crisp lettuce and strawberries give astronauts vitamins!
                </div>
                <div className="glossary-source">Source: Canadian Space Agency (CSA) Food Production</div>
              </div>

              <div className="trace-glossary-item">
                <h4>Space Biology (OSDR)</h4>
                <div className="glossary-analogy">
                  💡 <strong>Kid Analogy:</strong> In microgravity, your bones and muscles get lazy and shrink unless astronauts exercise on special machines every single day!
                </div>
                <div className="glossary-source">Source: NASA Open Science Data Repository (OSDR)</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
