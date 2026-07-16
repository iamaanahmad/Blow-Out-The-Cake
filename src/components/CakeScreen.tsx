import { useEffect, useRef, useState } from 'react';
import { Candle } from './Candle';
import { useMicBlowDetector } from '../audio/useMicBlowDetector';

interface CakeScreenProps {
  name: string;
  candleCount: number;
  litCount: number;
  onExtinguishOne: () => void;
}

export function CakeScreen({ name, candleCount, litCount, onExtinguishOne }: CakeScreenProps) {
  const [micEnabled, setMicEnabled] = useState(false);
  const [justExtinguishedIndex, setJustExtinguishedIndex] = useState<number | null>(null);
  const prevLitCountRef = useRef(litCount);

  const { supported, permissionState, start, stop } = useMicBlowDetector({
    onBlow: onExtinguishOne,
  });

  useEffect(() => {
    if (prevLitCountRef.current > litCount) {
      // the candle at index `litCount` (0-based) just went out
      setJustExtinguishedIndex(litCount);
      const timeout = setTimeout(() => setJustExtinguishedIndex(null), 900);
      prevLitCountRef.current = litCount;
      return () => clearTimeout(timeout);
    }
    prevLitCountRef.current = litCount;
  }, [litCount]);

  useEffect(() => {
    if (litCount === 0) {
      stop();
    }
  }, [litCount, stop]);

  const handleEnableMic = async () => {
    setMicEnabled(true);
    await start();
  };

  const showFallbackButton = !micEnabled || (micEnabled && !supported && permissionState !== 'requesting');

  return (
    <div className="screen cake-screen">
      <h1>Happy Birthday, {name}!</h1>
      <p className="subtitle">
        {micEnabled && supported
          ? 'Blow into your mic to snuff the candles 🌬️'
          : 'Blow into your mic, or use the button below.'}
      </p>

      <div className="cake">
        <div className="candle-row">
          {Array.from({ length: candleCount }, (_, i) => (
            <Candle key={i} lit={i < litCount} justExtinguished={i === justExtinguishedIndex} />
          ))}
        </div>
        <div className="cake-top" />
        <div className="cake-middle" />
        <div className="cake-base" />
      </div>

      <div className="controls">
        {!micEnabled && (
          <button className="secondary-button" onClick={handleEnableMic}>
            🎤 Enable microphone
          </button>
        )}
        {permissionState === 'denied' && <p className="hint">Mic access denied — use the button instead.</p>}
        {showFallbackButton && (
          <button className="primary-button blow-button" onClick={onExtinguishOne}>
            Blow! 💨
          </button>
        )}
      </div>
    </div>
  );
}
