import { useRef, useState } from 'react';
import { ConfettiOverlay } from './ConfettiOverlay';
import { formatToday } from '../utils/date';
import { dataUrlToFile, downloadDataUrl, exportCardToPngDataUrl } from '../utils/exportCard';

interface CelebrationCardProps {
  name: string;
  onStartOver: () => void;
}

const canNativeShare =
  typeof navigator !== 'undefined' && typeof navigator.share === 'function';

export function CelebrationCard({ name, onStartOver }: CelebrationCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setError(null);
    setBusy(true);
    try {
      const dataUrl = await exportCardToPngDataUrl(cardRef.current);
      downloadDataUrl(dataUrl, `happy-birthday-${name.toLowerCase().replace(/\s+/g, '-')}.png`);
    } catch (err) {
      setError('Could not generate the image. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    setError(null);
    setBusy(true);
    try {
      const dataUrl = await exportCardToPngDataUrl(cardRef.current);
      const file = await dataUrlToFile(dataUrl, 'birthday-card.png');
      await navigator.share({
        files: [file],
        title: `Happy Birthday, ${name}!`,
        text: `🎂 Happy Birthday, ${name}!`,
      });
    } catch (err) {
      // Ignore user cancellation (AbortError); surface anything else quietly.
      if ((err as DOMException)?.name !== 'AbortError') {
        setError('Sharing was not available.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="screen celebration-screen">
      <ConfettiOverlay />

      <div className="celebration-card" ref={cardRef}>
        <div className="card-cake-icon">🎂</div>
        <h1>Happy Birthday, {name}!</h1>
        <p className="card-date">{formatToday()}</p>
        <p className="card-wish">Wishing you a day as wonderful as you are.</p>
      </div>

      {error && <p className="hint error">{error}</p>}

      <div className="controls">
        <button className="primary-button" onClick={handleDownload} disabled={busy}>
          Download Card ⬇️
        </button>
        {canNativeShare && (
          <button className="secondary-button" onClick={handleShare} disabled={busy}>
            Share 📤
          </button>
        )}
        <button className="text-button" onClick={onStartOver}>
          Start Over
        </button>
      </div>
    </div>
  );
}
