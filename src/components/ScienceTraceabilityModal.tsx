import React from 'react';
import { speak } from './ui';

interface ScienceTraceabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KID_GLOSSARY_ITEMS = [
  {
    id: 'msv',
    term: 'mSv (Millisievert)',
    analogy: 'Think of 1 mSv like getting 10 dental X-rays. On Earth we get ~2.4 mSv in an entire year; on the Moon you get more than half of that in a single day!',
    source: 'NASA RadLab / OSDR Radiation Dosimetry'
  },
  {
    id: 'cme',
    term: 'CME (Coronal Mass Ejection)',
    analogy: 'Like a giant solar hurricane! Clouds of magnetized plasma blast through space at 500 to 2,500 km per second, showering unprotected spacecraft with radiation.',
    source: 'NASA DONKI Space Weather Database'
  },
  {
    id: 'sol',
    term: 'Sol (Martian Day)',
    analogy: 'One rotation of Mars takes 24 hours and 39 minutes—almost 40 minutes longer than an Earth day, like an extra recess every day!',
    source: 'NASA Mars Rover & Mars Trek Mission Ops'
  },
  {
    id: 'eclss',
    term: 'ECLSS (Life Support System)',
    analogy: 'Since there are no lakes or trees on the Moon or Mars, ECLSS scrubs CO₂ from astronauts’ breath and filters every drop of water into clean air and drinks!',
    source: 'NASA Artemis & ISS Life Support Engineering'
  },
  {
    id: 'hydroponics',
    term: 'Bioregenerative Hydroponics',
    analogy: 'Plants act as double-duty superheroes: their leaves soak up CO₂ to release fresh oxygen, while crisp lettuce and strawberries give astronauts vitamins!',
    source: 'Canadian Space Agency (CSA) Food Production'
  },
  {
    id: 'osdr',
    term: 'Space Biology (OSDR)',
    analogy: 'In microgravity, your bones and muscles get lazy and shrink unless astronauts exercise on special machines every single day!',
    source: 'NASA Open Science Data Repository (OSDR)'
  }
];

export function ScienceTraceabilityModal({
  isOpen,
  onClose
}: ScienceTraceabilityModalProps) {
  if (!isOpen) return null;

  const handleSpeak = (term: string, analogy: string) => {
    speak(`${term}. Kid Analogy: ${analogy}`);
  };

  return (
    <div className="trace-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="trace-modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="trace-modal-header">
          <div>
            <div className="trace-eyebrow">2026 NASA SPACE APPS CHALLENGE • SPACE WORDS</div>
            <h2 className="trace-title">📖 Kid-Friendly Space Glossary</h2>
          </div>
          <button className="trace-close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        <div className="trace-body" style={{ marginTop: '16px' }}>
          <div className="trace-glossary-grid">
            {KID_GLOSSARY_ITEMS.map((item) => (
              <div key={item.id} className="trace-glossary-item">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <h4 style={{ margin: 0 }}>{item.term}</h4>
                  <button
                    className="jargon-speak-btn"
                    onClick={() => handleSpeak(item.term, item.analogy)}
                    aria-label={`Listen to ${item.term}`}
                    title="Hear analogy read aloud"
                    style={{ width: '28px', height: '28px', fontSize: '0.85rem' }}
                  >
                    🔊
                  </button>
                </div>
                <div className="glossary-analogy">
                  💡 <strong>Kid Analogy:</strong> {item.analogy}
                </div>
                <div className="glossary-source">
                  Source: {item.source}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
