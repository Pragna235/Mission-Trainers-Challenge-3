import type { ReactNode } from 'react';

export function speak(text: string) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/[“”]/g, ''));
  u.rate = 0.95;
  u.pitch = 1.05;
  window.speechSynthesis.speak(u);
}

export function SpeakButton({ text, label = 'Read aloud' }: { text: string; label?: string }) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  return (
    <button className="icon-btn" onClick={() => speak(text)} aria-label={label} title={label}>
      🔊
    </button>
  );
}

/** Clear attribution: every piece of real NASA data in the game carries one of these. */
export function RealTag({ kind, label, link }: { kind: 'live' | 'archived' | 'measured'; label: string; link?: string }) {
  const text = kind === 'live' ? 'LIVE NASA DATA' : kind === 'archived' ? 'REAL NASA DATA · ARCHIVED' : 'REAL MEASUREMENT';
  const body = (
    <>
      <span className={`badge badge-${kind}`}>🛰️ {text}</span> <span className="real-label">{label}</span>
    </>
  );
  return (
    <div className="real-tag">
      {link ? (
        <a href={link} target="_blank" rel="noreferrer">
          {body} ↗
        </a>
      ) : (
        body
      )}
    </div>
  );
}

export function Meter({
  icon,
  label,
  value,
  max = 100,
  display,
  help,
  warnBelow = 30,
}: {
  icon: string;
  label: string;
  value: number;
  max?: number;
  display?: ReactNode;
  help: string;
  warnBelow?: number;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const level = pct < warnBelow ? 'low' : pct < 60 ? 'mid' : 'high';
  return (
    <div className={`meter meter-${level}`} title={help}>
      <div className="meter-top">
        <span className="meter-icon" aria-hidden>
          {icon}
        </span>
        <span className="meter-label">{label}</span>
        <span className="meter-value">{display ?? `${Math.round(value)}%`}</span>
      </div>
      <div className="meter-bar" role="meter" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-label={label}>
        <div className="meter-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="meter-help">{help}</div>
    </div>
  );
}

export function Stars({ n, of = 3 }: { n: number; of?: number }) {
  return (
    <span className="stars" aria-label={`${n} of ${of} stars`}>
      {Array.from({ length: of }, (_, i) => (
        <span key={i} className={i < n ? 'star on' : 'star'}>
          ★
        </span>
      ))}
    </span>
  );
}

export function Term({ word, children }: { word: string; children: ReactNode }) {
  return (
    <span className="term" tabIndex={0} title={String(children)}>
      {word}
      <span className="term-tip">{children}</span>
    </span>
  );
}
