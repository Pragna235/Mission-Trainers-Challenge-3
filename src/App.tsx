import { useState } from 'react';
import { newGame, type GameState, type RealFlare, type RealSep } from './engine/game';
import type { SiteId } from './engine/sites';
import donki from './data/donki.json';
import { TitleScreen, useSun } from './components/Title';
import { PlayScreen } from './components/Play';
import { EndScreen } from './components/End';
import { SciencePage } from './components/Science';

type Screen = 'title' | 'play' | 'end' | 'science';

export default function App() {
  const [screen, setScreen] = useState<Screen>('title');
  const [game, setGame] = useState<GameState | null>(null);
  const { sun, error } = useSun();

  const start = (site: SiteId) => {
    setGame(
      newGame(site, {
        sunMood: sun?.mood ?? 'active',
        flares: donki.flares as RealFlare[],
        seps: donki.solarParticleEvents as RealSep[],
      }),
    );
    setScreen('play');
    window.scrollTo(0, 0);
  };

  return (
    <div className="app">
      <div className="stars-bg" aria-hidden />
      {screen === 'title' && <TitleScreen sun={sun} sunError={error} onStart={start} onScience={() => setScreen('science')} />}
      {screen === 'science' && <SciencePage onBack={() => setScreen(game && game.status === 'playing' ? 'play' : 'title')} />}
      {screen === 'play' && game && <PlayScreen key={game.seed} game={game} setGame={setGame} onEnd={() => setScreen('end')} onQuit={() => setScreen('title')} />}
      {screen === 'end' && game && (
        <EndScreen
          game={game}
          onReplay={() => start(game.site)}
          onOther={() => start(game.site === 'mars' ? 'moon' : 'mars')}
          onMenu={() => setScreen('title')}
        />
      )}
    </div>
  );
}
