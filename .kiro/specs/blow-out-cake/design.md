# Design Document

## Overview

The app is a single-page client-side application built with React and TypeScript, bundled with Vite. It has no backend: all state lives in memory for the duration of the session. The app moves through three screens driven by a simple state machine: **Setup → Blowing → Celebration**. The microphone-driven interaction uses the Web Audio API's `AnalyserNode` to sample volume in real time and drive candle extinguishing. Card export uses `html-to-image` (or canvas-based rendering) to rasterize the celebration card as a downloadable PNG, and the native Web Share API is used opportunistically for sharing.

## Architecture

```
src/
  main.tsx                 Entry point, mounts <App />
  App.tsx                  Top-level state machine (screen: 'setup' | 'blowing' | 'celebrate')
  state/
    useCakeState.ts         Hook holding name, candleCount, litCandles, screen
  audio/
    useMicBlowDetector.ts    Hook wrapping Web Audio API; emits onBlow() callbacks
  components/
    SetupScreen.tsx          Name input + candle count stepper + Start button
    CakeScreen.tsx           Renders cake + candles, wires mic/fallback button, smoke fx
    Candle.tsx               Single candle: flame, flicker/out animation, smoke wisp
    ConfettiOverlay.tsx      Full-screen confetti animation (canvas-based)
    CelebrationCard.tsx      Personalized card, Download + Share actions, Start Over
  utils/
    exportCard.ts            Rasterizes a DOM node to PNG (html-to-image wrapper)
    date.ts                  Formats current date for the card
  styles/                    CSS (plain CSS modules or a single App.css)
```

### State machine

`App.tsx` owns:
- `screen: 'setup' | 'blowing' | 'celebrate'`
- `name: string`
- `candleCount: number`
- `litCount: number` (candles still lit, counts down to 0)

Transitions:
- Setup submit → `screen = 'blowing'`, `litCount = candleCount`
- `litCount` reaches 0 in Blowing → `screen = 'celebrate'`
- Start Over (from Celebration) → reset all state, `screen = 'setup'`

## Components and Interfaces

### `useMicBlowDetector`

```ts
interface BlowDetectorOptions {
  onBlow: () => void;       // fired once per detected sustained blow
  threshold?: number;       // RMS volume threshold, default tuned via testing
  sustainMs?: number;       // how long volume must stay above threshold, default ~150ms
  cooldownMs?: number;      // minimum time between two blow events, default ~400ms
}

interface BlowDetectorResult {
  supported: boolean;       // false if getUserMedia/AudioContext unsupported or denied
  permissionState: 'idle' | 'requesting' | 'granted' | 'denied';
  start: () => Promise<void>;
  stop: () => void;
}

function useMicBlowDetector(options: BlowDetectorOptions): BlowDetectorResult
```

Implementation notes:
- Uses `navigator.mediaDevices.getUserMedia({ audio: true })`, pipes the stream into an `AudioContext` → `AnalyserNode` (`fftSize = 512`).
- On each `requestAnimationFrame` tick, reads time-domain data, computes RMS volume.
- Tracks consecutive above-threshold time; once it exceeds `sustainMs`, fires `onBlow()` and starts a cooldown to avoid firing multiple times for one continuous blow.
- `stop()` disconnects the analyser and stops all media stream tracks (releases the mic indicator).
- If `getUserMedia` throws (denied) or `AudioContext`/`mediaDevices` is undefined, `supported` is set to `false` so the UI can fall back to the manual Blow button.

### `CakeScreen`

- Calls `useMicBlowDetector({ onBlow: extinguishNext })` on mount; calls `start()` after requesting permission via a "Ready? Tap to enable mic" affordance (browsers require a user gesture in many cases before audio APIs behave well on mobile).
- Renders one `<Candle>` per candle index, `lit={index < litCount}`.
- If `supported` is `false` (denied/unsupported), renders a large "Blow!" button that calls `extinguishNext` directly on click/tap, satisfying Requirement 2.5.
- `extinguishNext` decrements `litCount` by exactly 1 per call (guards against double-fires) and triggers the candle-out animation + smoke wisp for that candle.
- When `litCount` hits 0, calls `stop()` on the detector and transitions `screen` to `'celebrate'`.

### `Candle`

- Pure presentational component. Props: `lit: boolean`, `justExtinguished: boolean`.
- CSS keyframe animation: flickering flame while lit, a quick flicker-out transition (scale/opacity) plus a rising, fading smoke wisp `div` when transitioning from lit to unlit.

### `ConfettiOverlay`

- Canvas-based particle system: on mount, spawns N colored rectangles/circles with randomized velocity, gravity, and rotation, animated via `requestAnimationFrame` for ~4-6 seconds, then removes itself from the DOM (stays mounted underneath the card afterward at low opacity or unmounts based on a timer).
- No external animation library required, keeping the bundle small and dependency-free beyond React.

### `CelebrationCard`

- Renders a styled card DOM node (ref'd) containing: "Happy Birthday, {name}!", the formatted current date, and a decorative cake/candle illustration or emoji.
- "Download Card" button calls `exportCard(cardRef.current)` → uses `html-to-image`'s `toPng` to rasterize the node, then triggers a synthetic `<a download>` click with the resulting data URL.
- "Share" button only renders `if (navigator.share && navigator.canShare)`; on click, converts the PNG data URL to a `File` and calls `navigator.share({ files: [file], title, text })`. Wrapped in try/catch to silently ignore user-cancellation errors.
- "Start Over" button invokes a callback passed from `App.tsx` that resets state.

## Data Models

No persisted data models; all state is ephemeral React state scoped to `App`:

```ts
interface CakeState {
  screen: 'setup' | 'blowing' | 'celebrate';
  name: string;
  candleCount: number;   // 1-12
  litCount: number;      // 0..candleCount
}
```

## Error Handling

- **Microphone permission denied**: caught in `useMicBlowDetector.start()`; sets `permissionState = 'denied'`, `supported = false`; UI falls back to manual Blow button (Req 2.5).
- **Web Audio API unsupported** (very old browsers): feature-detected via `typeof window.AudioContext === 'undefined' && typeof (window as any).webkitAudioContext === 'undefined'`; same fallback path (Req 5.3).
- **PNG export failure** (e.g., `html-to-image` throws due to CORS/canvas taint, unlikely since no external images): caught, shows a small inline error message near the Download button, app remains usable.
- **Web Share cancellation**: `navigator.share()` rejecting with `AbortError` is swallowed silently (user simply closed the share sheet).
- **Invalid setup input**: candle count is clamped to [1, 12] via the numeric stepper's min/max; empty name defaults to "Friend" per Req 1.3.

## Testing Strategy

Given the app's core interaction depends on live microphone input (hard to unit test meaningfully), testing focuses on:

1. **Unit tests (Vitest + React Testing Library)**:
   - `useCakeState`/reducer logic: setup → blowing → celebrate transitions, candle countdown, reset on Start Over.
   - `Candle` renders lit vs. unlit states correctly based on props.
   - Fallback Blow button decrements `litCount` and triggers celebration at 0.
   - Name defaulting to "Friend" when empty on submit.
   - Candle count clamped to 1-12.
2. **Manual verification checklist** (documented in README) for the microphone path, confetti animation, PNG download, and Web Share, since these depend on real browser APIs/hardware not reliably simulated in a headless test run.
3. **Build verification**: `npm run build` must succeed and produce a deployable `dist/` static bundle; `npm run lint` (if configured) and `npm run test` must pass before considering implementation complete.
