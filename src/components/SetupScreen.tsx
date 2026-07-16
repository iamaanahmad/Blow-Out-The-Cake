import { FormEvent, useState } from 'react';
import { MAX_CANDLES, MIN_CANDLES, clampCandleCount } from '../state/useCakeState';

interface SetupScreenProps {
  onStart: (name: string, candleCount: number) => void;
}

export function SetupScreen({ onStart }: SetupScreenProps) {
  const [name, setName] = useState('');
  const [candleCount, setCandleCount] = useState(5);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onStart(name, candleCount);
  };

  return (
    <div className="screen setup-screen">
      <h1>🎂 Blow Out The Cake</h1>
      <p className="subtitle">Set the scene, then blow into your mic to snuff the candles.</p>
      <form onSubmit={handleSubmit} className="setup-form">
        <label htmlFor="name-input">Who's celebrating?</label>
        <input
          id="name-input"
          type="text"
          placeholder="Friend"
          value={name}
          maxLength={40}
          onChange={(e) => setName(e.target.value)}
        />

        <label htmlFor="candle-input">How many candles?</label>
        <div className="stepper">
          <button
            type="button"
            aria-label="Decrease candle count"
            onClick={() => setCandleCount((c) => clampCandleCount(c - 1))}
          >
            −
          </button>
          <input
            id="candle-input"
            type="number"
            min={MIN_CANDLES}
            max={MAX_CANDLES}
            value={candleCount}
            onChange={(e) => setCandleCount(clampCandleCount(Number(e.target.value)))}
          />
          <button
            type="button"
            aria-label="Increase candle count"
            onClick={() => setCandleCount((c) => clampCandleCount(c + 1))}
          >
            +
          </button>
        </div>

        <button type="submit" className="primary-button">
          Light the candles 🔥
        </button>
      </form>
    </div>
  );
}
