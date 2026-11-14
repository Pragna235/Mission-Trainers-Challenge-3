import React from 'react';

export const GLOSSARY_TERMS = [
  {
    term: 'mSv (Millisievert)',
    analogy: 'Think of 1 mSv like getting 10 dental X-rays at once. On Earth we get ~2.4 mSv in an entire year; on the Moon you get more than half of that in a single day!',
    source: 'NASA RadLab / OSDR Radiation Dosimetry'
  },
  {
    term: 'CME (Coronal Mass Ejection)',
    analogy: 'A giant solar hurricane! Clouds of magnetized plasma blast out from the Sun at 500 to 2,500 km per second, showering unprotected spacecraft with radiation.',
    source: 'NASA DONKI Space Weather Database'
  },
  {
    term: 'Sol (Martian Day)',
    analogy: 'One full rotation of Mars: 24 hours, 39 minutes, and 35 seconds. It is 40 minutes longer than an Earth day—like getting an extra recess every day!',
    source: 'NASA Mars Exploration Rover Mission'
  },
  {
    term: 'ECLSS (Life Support System)',
    analogy: 'Because there are no lakes or trees in space, ECLSS recycles astronauts’ breath (CO₂) back into fresh oxygen and purifies every drop of water.',
    source: 'NASA Artemis & ISS Life Support Engineering'
  },
  {
    term: 'Hydroponics',
    analogy: 'Growing plants in water and LED light without soil. Plants do double duty: their leaves make fresh oxygen, and crunchy fresh salads boost crew morale and nutrition!',
    source: 'Canadian Space Agency (CSA) Food Production'
  },
  {
    term: 'Space Biology (OSDR)',
    analogy: 'Without gravity pulling down on you, human bones and muscles get lazy and shrink unless astronauts exercise on special bungee machines every single day.',
    source: 'NASA Open Science Data Repository (OSDR)'
  }
];

export function GlossaryModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="trace-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="trace-modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="trace-modal-header">
          <div>
            <div className="trace-eyebrow">SPACE EXPLORATION WORDS MADE SIMPLE</div>
            <h2 className="trace-title">📖 Space Glossary for Kids</h2>
          </div>
          <button className="trace-close-btn" onClick={onClose} aria-label="Close glossary">
            ✕
          </button>
        </div>

        <div className="trace-body">
          <div className="trace-glossary-grid">
            {GLOSSARY_TERMS.map((item, idx) => (
              <div key={idx} className="trace-glossary-item">
                <h4>{item.term}</h4>
                <div className="glossary-analogy">
                  💡 <strong>Kid Analogy:</strong> {item.analogy}
                </div>
                <div className="glossary-source">NASA Science Reference: {item.source}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
