import { useCallback, useEffect, useRef, useState } from 'react';

export type PermissionState = 'idle' | 'requesting' | 'granted' | 'denied';

export interface BlowDetectorOptions {
  onBlow: () => void;
  threshold?: number;
  sustainMs?: number;
  cooldownMs?: number;
}

export interface BlowDetectorResult {
  supported: boolean;
  permissionState: PermissionState;
  start: () => Promise<void>;
  stop: () => void;
}

function isWebAudioSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  return Boolean(AudioCtx && navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

/**
 * Listens to the microphone and fires `onBlow` whenever sustained loud input
 * (a "blow") is detected. Falls back gracefully by reporting `supported: false`
 * when the Web Audio API is unavailable or permission is denied.
 */
export function useMicBlowDetector({
  onBlow,
  threshold = 0.12,
  sustainMs = 150,
  cooldownMs = 400,
}: BlowDetectorOptions): BlowDetectorResult {
  const [supported, setSupported] = useState<boolean>(() => isWebAudioSupported());
  const [permissionState, setPermissionState] = useState<PermissionState>('idle');

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const aboveThresholdSinceRef = useRef<number | null>(null);
  const lastBlowAtRef = useRef<number>(0);
  const onBlowRef = useRef(onBlow);
  onBlowRef.current = onBlow;

  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    aboveThresholdSinceRef.current = null;
  }, []);

  const tick = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const buffer = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(buffer);

    let sumSquares = 0;
    for (let i = 0; i < buffer.length; i += 1) {
      const normalized = (buffer[i] - 128) / 128;
      sumSquares += normalized * normalized;
    }
    const rms = Math.sqrt(sumSquares / buffer.length);

    const now = performance.now();

    if (rms >= threshold) {
      if (aboveThresholdSinceRef.current === null) {
        aboveThresholdSinceRef.current = now;
      }
      const sustainedFor = now - aboveThresholdSinceRef.current;
      const cooledDown = now - lastBlowAtRef.current >= cooldownMs;
      if (sustainedFor >= sustainMs && cooledDown) {
        lastBlowAtRef.current = now;
        aboveThresholdSinceRef.current = now;
        onBlowRef.current();
      }
    } else {
      aboveThresholdSinceRef.current = null;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [threshold, sustainMs, cooldownMs]);

  const start = useCallback(async () => {
    if (!isWebAudioSupported()) {
      setSupported(false);
      return;
    }

    setPermissionState('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext: AudioContext = new AudioCtx();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);

      streamRef.current = stream;
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      setPermissionState('granted');
      setSupported(true);

      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      setPermissionState('denied');
      setSupported(false);
    }
  }, [tick]);

  useEffect(() => stop, [stop]);

  return { supported, permissionState, start, stop };
}
