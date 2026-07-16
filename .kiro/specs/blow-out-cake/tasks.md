# Implementation Plan

- [x] 1. Scaffold the project
  - Initialize a Vite + React + TypeScript project in the repo root
  - Install dependencies: react, react-dom, html-to-image
  - Set up Vitest + React Testing Library for unit tests
  - Configure `package.json` scripts: `dev`, `build`, `preview`, `test`, `lint`
  - _Requirements: 5.1_

- [x] 2. Build core state management
  - [x] 2.1 Implement `useCakeState` hook/reducer with `screen`, `name`, `candleCount`, `litCount`
    - Actions: `START(name, candleCount)`, `EXTINGUISH_ONE`, `RESET`
    - Clamp `candleCount` to [1, 12]; default empty name to "Friend"
    - _Requirements: 1.2, 1.3, 4.4_
  - [x] 2.2 Write unit tests for the reducer covering setup, countdown to celebration, and reset
    - _Requirements: 1.2, 1.3, 4.4_

- [x] 3. Build the Setup screen
  - [x] 3.1 Implement `SetupScreen` component with name text input and candle count stepper (1-12)
    - _Requirements: 1.1_
  - [x] 3.2 Wire submit action to dispatch `START` and transition to the Blowing screen
    - _Requirements: 1.2, 1.4_

- [x] 4. Build the microphone blow detector
  - [x] 4.1 Implement `useMicBlowDetector` hook using Web Audio API (AudioContext + AnalyserNode)
    - RMS volume computation over `requestAnimationFrame` loop, sustain + cooldown timing
    - Feature detection for unsupported browsers
    - _Requirements: 2.1, 2.2, 2.3, 5.3_
  - [x] 4.2 Handle permission denied and unsupported cases by exposing `supported = false`
    - _Requirements: 2.5, 5.3_
  - [x] 4.3 Implement `stop()` to release the media stream and disconnect audio nodes
    - _Requirements: 3.3_

- [x] 5. Build the Cake / Blowing screen
  - [x] 5.1 Implement `Candle` component with lit/flicker/extinguish/smoke-wisp animation states
    - _Requirements: 2.4, 2.6_
  - [x] 5.2 Implement `CakeScreen` rendering candles from `litCount`, wiring mic detector's `onBlow` to `EXTINGUISH_ONE`
    - _Requirements: 1.2, 2.3, 2.4_
  - [x] 5.3 Add fallback "Blow" button shown when `supported` is false, calling the same extinguish action
    - _Requirements: 2.5, 5.3_
  - [x] 5.4 Transition to Celebration screen and stop the mic when `litCount` reaches 0
    - _Requirements: 3.1, 3.3_
  - [x] 5.5 Write unit tests for fallback button decrementing candles and triggering celebration at zero
    - _Requirements: 2.5_

- [x] 6. Build the Celebration screen
  - [x] 6.1 Implement `ConfettiOverlay` canvas particle animation triggered on entering Celebration
    - _Requirements: 3.1_
  - [x] 6.2 Implement `CelebrationCard` displaying personalized name and current date
    - _Requirements: 3.2_
  - [x] 6.3 Implement `exportCard` utility using html-to-image to rasterize the card to PNG and trigger download
    - _Requirements: 4.1_
  - [x] 6.4 Implement conditional Share button using the Web Share API when available, hidden otherwise
    - _Requirements: 4.2, 4.3_
  - [x] 6.5 Implement "Start Over" action resetting state back to Setup
    - _Requirements: 4.4_

- [x] 7. Responsive styling and polish
  - [x] 7.1 Style all three screens for mobile and desktop viewport widths
    - _Requirements: 5.2_
  - [x] 7.2 Add birthday-themed visual polish (colors, fonts, cake/candle illustration)
    - _Requirements: 1.4_

- [x] 8. Final verification
  - [x] 8.1 Run unit test suite and fix any failures
    - _Requirements: all_
  - [x] 8.2 Run production build and confirm static `dist/` output
    - _Requirements: 5.1_
  - [ ] 8.3 Manually verify microphone flow, fallback button flow, confetti, download, and share on a real browser
    - _Requirements: 2.1-2.6, 3.1-3.3, 4.1-4.3_
