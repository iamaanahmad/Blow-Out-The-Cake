# Requirements Document

## Introduction

This feature is a virtual birthday cake web app. The user speaks a single wish into existence by blowing into their microphone, which extinguishes candles on a rendered cake one by one in response to real-time microphone volume. Once all candles are out, the app celebrates with a confetti animation and generates a personalized, shareable birthday card. The experience must work entirely in the browser with no backend, no account creation, and no data persistence beyond the current session.

**Original one-sentence prompt:** "Build a virtual birthday cake web app where blowing into your microphone snuffs out its candles one by one until a personalized confetti celebration and shareable card appear."

## Requirements

### Requirement 1: Cake setup and personalization

**User Story:** As a visitor, I want to enter a name and choose a number of candles, so that the cake feels personalized to the birthday person.

#### Acceptance Criteria

1. WHEN the app loads THEN the system SHALL display a setup screen with a text input for a name and a numeric control for candle count (minimum 1, maximum 12).
2. WHEN the user submits the setup form with a non-empty name THEN the system SHALL render a cake with exactly the chosen number of lit candles.
3. IF the user submits the setup form with an empty name THEN the system SHALL default the name to "Friend" and proceed without blocking the user.
4. WHEN the cake is rendered THEN the system SHALL display the personalized name in a "Happy Birthday, {name}!" heading above the cake.

### Requirement 2: Microphone-based candle blowing

**User Story:** As a user, I want to blow into my microphone to extinguish the candles, so that the interaction feels physical and fun rather than click-based.

#### Acceptance Criteria

1. WHEN the cake screen loads THEN the system SHALL request microphone permission via the browser's Web Audio API.
2. IF microphone permission is granted THEN the system SHALL continuously analyze microphone input volume in real time.
3. WHEN the analyzed input volume exceeds a defined "blow" threshold for a sustained short interval THEN the system SHALL extinguish exactly one currently-lit candle.
4. WHEN multiple candles remain lit and a sustained blow is detected THEN the system SHALL extinguish candles one at a time (not all at once) with a brief animated flicker-then-out transition per candle.
5. IF microphone permission is denied or unavailable THEN the system SHALL display a fallback control (a "Blow" button or tap-to-blow gesture) that extinguishes one candle per activation, so the app remains usable without a microphone.
6. WHEN a candle is extinguished THEN the system SHALL provide a smoke-wisp visual effect at that candle's position.

### Requirement 3: Celebration on completion

**User Story:** As a user, I want a celebratory moment once all candles are out, so that the experience has a satisfying payoff.

#### Acceptance Criteria

1. WHEN the last lit candle is extinguished THEN the system SHALL trigger a full-screen confetti animation within 500ms.
2. WHEN the confetti animation triggers THEN the system SHALL display a personalized birthday message card containing the entered name and the current date.
3. WHEN the celebration is displayed THEN the system SHALL stop listening to the microphone to conserve resources.

### Requirement 4: Shareable card

**User Story:** As a user, I want to save or share the birthday card, so that I can send the moment to someone else.

#### Acceptance Criteria

1. WHEN the celebration card is displayed THEN the system SHALL provide a "Download Card" action that exports the card as a PNG image.
2. IF the browser supports the native Web Share API THEN the system SHALL provide a "Share" action that invokes it with the generated image.
3. IF the native Web Share API is unavailable THEN the system SHALL hide the Share action and rely on the Download action only.
4. WHEN the user activates "Start Over" THEN the system SHALL return to the setup screen and reset all candle and celebration state.

### Requirement 5: Deployability and standalone operation

**User Story:** As a challenge reviewer, I want to run or visit the app without any setup burden, so that I can verify it works quickly.

#### Acceptance Criteria

1. WHEN the project is built THEN the system SHALL produce a static site deployable to any static host with no server-side runtime required.
2. WHEN the app is opened on a modern desktop or mobile browser THEN the system SHALL render correctly at both mobile and desktop viewport widths.
3. IF the Web Audio API is unsupported by the browser THEN the system SHALL detect this and immediately present the fallback "Blow" button path from Requirement 2.5.
