import React, { useState, useMemo } from 'react';
import { speak } from './ui';

export type JargonCategory = 'all' | 'weather' | 'systems' | 'mars_moon' | 'science';

export interface JargonEntry {
  id: string;
  word: string;
  pronunciation: string;
  category: 'weather' | 'systems' | 'mars_moon' | 'science';
  categoryLabel: string;
  categoryColor: 'orange' | 'amber' | 'purple' | 'cyan' | 'green';
  definition: string;
  inGame: string;
  coolFact: string;
  quizQuestion: string;
  quizAnswer: string;
}

export const JARGON_ENTRIES: JargonEntry[] = [
  {
    id: 'sol',
    word: 'Sol',
    pronunciation: 'SAHL',
    category: 'mars_moon',
    categoryLabel: 'Mars & Moon',
    categoryColor: 'orange',
    definition: 'One full day and night on Mars! A Martian Sol lasts 24 hours and 39 minutes—just a tiny bit longer than an Earth day.',
    inGame: 'Your 12-day mission counts from Sol 1 to Sol 12.',
    coolFact: 'Mars rovers have special wristwatches made for Sols so engineers on Earth stay on Mars time!',
    quizQuestion: 'Is a Mars Sol longer or shorter than an Earth day?',
    quizAnswer: 'Longer! It is 39 minutes longer than an Earth day.'
  },
  {
    id: 'solar-flare',
    word: 'Solar Flare',
    pronunciation: 'SOH-ler FLAIR',
    category: 'weather',
    categoryLabel: 'Space Weather',
    categoryColor: 'amber',
    definition: 'A giant, super-bright flash of energy bursting off the surface of the Sun like a cosmic firework.',
    inGame: 'Flares trigger Solar Storm alerts where you must boost your Radiation Shield to 3 cells.',
    coolFact: 'Scientists rank flares by size: C (small), M (medium), and X (extra-huge!).',
    quizQuestion: 'Which letter stands for the strongest solar flares?',
    quizAnswer: 'X-Class! X-flares are the most powerful explosions in the solar system.'
  },
  {
    id: 'cme',
    word: 'CME (Coronal Mass Ejection)',
    pronunciation: 'kuh-ROH-nul mass ih-JEK-shun',
    category: 'weather',
    categoryLabel: 'Space Weather',
    categoryColor: 'purple',
    definition: 'A huge bubble of magnetic wind and tiny fast-moving particles burped out by the Sun into space.',
    inGame: 'When a CME reaches Mars or the Moon, your Radiation Shield keeps the astronauts safe inside.',
    coolFact: 'On Earth, gentle CMEs create glowing green and pink Northern Lights (auroras) in the sky!',
    quizQuestion: 'What pretty sky light show do gentle CMEs make on Earth?',
    quizAnswer: 'Auroras! (The Northern and Southern Lights).'
  },
  {
    id: 'eclss',
    word: 'ECLSS (Life Support)',
    pronunciation: 'EE-kliss',
    category: 'systems',
    categoryLabel: 'Base Systems',
    categoryColor: 'cyan',
    definition: 'Environmental Control and Life Support System! The space hardware that scrubs carbon dioxide, recycles sweat into drinking water, and pumps fresh oxygen.',
    inGame: 'Needs 3 power cells each Sol (1 for each astronaut) to keep cabin air steady and clean.',
    coolFact: 'On the International Space Station, ECLSS recycles 98% of all astronaut water—including urine!',
    quizQuestion: 'How many power cells does your outpost need to keep 3 astronauts breathing?',
    quizAnswer: '3 power cells! Exactly 1 cell for each astronaut.'
  },
  {
    id: 'moxie',
    word: 'MOXIE',
    pronunciation: 'MAHK-see',
    category: 'science',
    categoryLabel: 'NASA Science',
    categoryColor: 'cyan',
    definition: 'Mars Oxygen In-Situ Resource Utilization Experiment! A toaster-sized device on Perseverance that inhales toxic Martian air and breathes out pure oxygen.',
    inGame: 'Inspired NASA engineers to design outposts that make their own oxygen instead of hauling tanks from Earth.',
    coolFact: 'MOXIE proved humans can manufacture breathable air directly on Mars surface!',
    quizQuestion: 'What gas on Mars does MOXIE turn into breathable oxygen?',
    quizAnswer: 'Carbon Dioxide (CO₂)!'
  },
  {
    id: 'msv',
    word: 'mSv (Millisievert)',
    pronunciation: 'MIL-ih-SEE-vert',
    category: 'weather',
    categoryLabel: 'Space Weather',
    categoryColor: 'purple',
    definition: 'A unit used by NASA flight surgeons to measure how much radiation energy human body tissue absorbs in deep space.',
    inGame: 'Measures your crew’s total radiation. Keep it low by raising shields when storms strike.',
    coolFact: 'A chest X-ray is about 0.1 mSv. On Mars, an astronaut absorbs about 0.6 mSv every quiet day!',
    quizQuestion: 'Does an astronaut receive more radiation on Earth or on the Moon?',
    quizAnswer: 'On the Moon! Earth’s thick atmosphere blocks 99% of space radiation.'
  },
  {
    id: 'hydroponics',
    word: 'Hydroponics',
    pronunciation: 'HY-droh-PAHN-iks',
    category: 'systems',
    categoryLabel: 'Base Systems',
    categoryColor: 'green',
    definition: 'Growing crispy fresh vegetables in vitamin-rich water and pink LED light without using any soil or dirt.',
    inGame: 'Allocating cells to the Greenhouse grows meals in 3 steps AND generates bonus cabin oxygen.',
    coolFact: 'Astronauts on the ISS grew and tasted Outredgeous red romaine lettuce in microgravity!',
    quizQuestion: 'Do hydroponic greenhouse plants need dirt to grow in space?',
    quizAnswer: 'No dirt at all! They grow in nutrient water under special LED lamps.'
  },
  {
    id: 'regolith',
    word: 'Regolith (Space Dust)',
    pronunciation: 'REG-uh-lith',
    category: 'mars_moon',
    categoryLabel: 'Mars & Moon',
    categoryColor: 'orange',
    definition: 'Super-sharp powdery dust and pulverized rock that blankets the surfaces of the Moon and Mars.',
    inGame: 'Dust storms blow regolith across your solar arrays, choking sunlight electricity.',
    coolFact: 'Apollo astronauts said lunar regolith smelled like burnt fireworks when brought inside the lunar module!',
    quizQuestion: 'What did Apollo moonwalkers say moon dust smelled like?',
    quizAnswer: 'Spent gunpowder or fireworks!'
  },
  {
    id: 'osdr',
    word: 'OSDR (Space Biology)',
    pronunciation: 'OH-ess-dee-ar',
    category: 'science',
    categoryLabel: 'NASA Science',
    categoryColor: 'cyan',
    definition: 'NASA’s Open Science Data Repository! A free global public library of experiments on how space radiation and zero gravity affect genes, mice, and plants.',
    inGame: 'Every single sol debrief links directly to real peer-reviewed OSDR space biology studies.',
    coolFact: 'Anyone in the world—even students—can download and study real NASA gene sequencing data!',
    quizQuestion: 'Can kids and students explore NASA’s OSDR data for free?',
    quizAnswer: 'Yes! It is 100% open and accessible to the public.'
  },
  {
    id: 'comms-delay',
    word: 'Comms Latency',
    pronunciation: 'KAHMZ LAY-ten-see',
    category: 'mars_moon',
    categoryLabel: 'Mars & Moon',
    categoryColor: 'orange',
    definition: 'The delay it takes radio signals travelling at light speed (300,000 km/s) to cross deep space to Earth.',
    inGame: 'On Mars, messages take 1 sol to arrive, requiring commanders to plan ahead without instant Houston advice.',
    coolFact: 'Because Mars is so far, a radio message takes anywhere from 4 to 24 minutes one way!',
    quizQuestion: 'How long does a radio call take between the Moon and Earth?',
    quizAnswer: 'Only about 1.3 seconds! Practically instant compared to Mars.'
  }
];

export function JargonDecoderModal({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<JargonCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const filteredEntries = useMemo(() => {
    return JARGON_ENTRIES.filter((entry) => {
      const matchesCategory =
        selectedCategory === 'all' || entry.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        entry.word.toLowerCase().includes(q) ||
        entry.definition.toLowerCase().includes(q) ||
        entry.pronunciation.toLowerCase().includes(q) ||
        entry.categoryLabel.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  const toggleFlip = (id: string) => {
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSpeak = (entry: JargonEntry) => {
    const text = `${entry.word}. Pronounced: ${entry.pronunciation}. ${entry.definition} In our game: ${entry.inGame}. Cool fact: ${entry.coolFact}`;
    speak(text);
  };

  if (!isOpen) return null;

  return (
    <div
      className="jargon-decoder-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Space Words & NASA Jargon Decoder"
    >
      <div
        className="jargon-decoder-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header matching screenshot */}
        <div className="jargon-header-top">
          <div className="jargon-header-info">
            <h1 className="jargon-main-title">
              Space Words & NASA Jargon Decoder
            </h1>
            <p className="jargon-subtitle">
              Ever wonder what Sol, CME, or MOXIE means? Tap the speaker button to hear any word aloud, or flip the quiz card to test your space smarts!
            </p>
          </div>

          <div className="jargon-search-box">
            <span className="search-glass-icon" aria-hidden>🔍</span>
            <input
              type="text"
              className="jargon-search-input"
              placeholder="Search space words..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search space words"
            />
            {searchQuery && (
              <button
                className="btn-clear-search"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <button
            className="jargon-close-btn"
            onClick={onClose}
            aria-label="Close decoder"
          >
            ✕
          </button>
        </div>

        {/* Category Pills Navigation */}
        <div className="jargon-filter-tabs">
          <button
            type="button"
            className={`filter-pill-btn ${selectedCategory === 'all' ? 'pill-active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            All Words
          </button>
          <button
            type="button"
            className={`filter-pill-btn ${selectedCategory === 'weather' ? 'pill-active' : ''}`}
            onClick={() => setSelectedCategory('weather')}
          >
            Space Weather
          </button>
          <button
            type="button"
            className={`filter-pill-btn ${selectedCategory === 'systems' ? 'pill-active' : ''}`}
            onClick={() => setSelectedCategory('systems')}
          >
            Base Systems
          </button>
          <button
            type="button"
            className={`filter-pill-btn ${selectedCategory === 'mars_moon' ? 'pill-active' : ''}`}
            onClick={() => setSelectedCategory('mars_moon')}
          >
            Mars & Moon
          </button>
          <button
            type="button"
            className={`filter-pill-btn ${selectedCategory === 'science' ? 'pill-active' : ''}`}
            onClick={() => setSelectedCategory('science')}
          >
            NASA Science
          </button>
        </div>

        {/* Jargon Cards Grid matching screenshot layout */}
        <div className="jargon-cards-grid">
          {filteredEntries.map((entry) => {
            const isFlipped = Boolean(flippedCards[entry.id]);
            return (
              <div
                key={entry.id}
                className={`jargon-card card-color-${entry.categoryColor}`}
              >
                {/* Card Top Row: Tag + Speaker */}
                <div className="jargon-card-top-row">
                  <span className={`jargon-category-tag tag-color-${entry.categoryColor}`}>
                    {entry.categoryLabel}
                  </span>
                  <button
                    className="jargon-speak-btn"
                    onClick={() => handleSpeak(entry)}
                    aria-label={`Listen to ${entry.word}`}
                    title="Hear word read aloud"
                  >
                    🔊
                  </button>
                </div>

                {/* Word Title & Pronunciation */}
                <h2 className="jargon-word-title">{entry.word}</h2>
                <div className="jargon-pronunciation">
                  Say it: <code>"{entry.pronunciation}"</code>
                </div>

                {/* Definition */}
                <p className="jargon-definition">{entry.definition}</p>

                {/* In Our Game Box */}
                <div className="jargon-ingame-box">
                  <div className="ingame-label">
                    <span className="rocket-glyph">🚀</span>
                    <strong>In our game:</strong>
                  </div>
                  <p>{entry.inGame}</p>
                </div>

                {/* Cool Fact Box */}
                <div className="jargon-coolfact-box">
                  <span className="bulb-glyph">💡</span>
                  <div>
                    <strong>Cool Fact:</strong> {entry.coolFact}
                  </div>
                </div>

                {/* Interactive Quiz Footer */}
                <div className="jargon-quiz-footer">
                  <div className="quiz-question-row">
                    <span className="quiz-q-mark">❓</span>
                    <span className="quiz-question-text">{entry.quizQuestion}</span>
                  </div>

                  {!isFlipped ? (
                    <button
                      type="button"
                      className={`btn-check-answer btn-theme-${entry.categoryColor}`}
                      onClick={() => toggleFlip(entry.id)}
                    >
                      Tap to Check Answer!
                    </button>
                  ) : (
                    <div className="quiz-answer-revealed">
                      <div className="answer-header">
                        <span className="check-icon">✅</span>
                        <strong>NASA Answer:</strong>
                      </div>
                      <p className="answer-text">{entry.quizAnswer}</p>
                      <button
                        type="button"
                        className="btn-hide-answer"
                        onClick={() => toggleFlip(entry.id)}
                      >
                        Hide Answer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredEntries.length === 0 && (
          <div className="jargon-empty-search">
            <span className="empty-icon">🛰️</span>
            <h3>No space words found for "{searchQuery}"</h3>
            <p>Try searching for Sol, CME, ECLSS, or select "All Words"!</p>
            <button
              className="btn-reset-filters"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
