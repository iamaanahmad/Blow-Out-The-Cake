import { describe, expect, it } from 'vitest';
import { cakeReducer, clampCandleCount, initialCakeState } from './useCakeState';

describe('clampCandleCount', () => {
  it('clamps values below the minimum', () => {
    expect(clampCandleCount(0)).toBe(1);
    expect(clampCandleCount(-5)).toBe(1);
  });

  it('clamps values above the maximum', () => {
    expect(clampCandleCount(20)).toBe(12);
  });

  it('leaves in-range values untouched', () => {
    expect(clampCandleCount(7)).toBe(7);
  });
});

describe('cakeReducer', () => {
  it('starts the cake with the given name and candle count', () => {
    const state = cakeReducer(initialCakeState, { type: 'START', name: 'Ada', candleCount: 4 });
    expect(state.screen).toBe('blowing');
    expect(state.name).toBe('Ada');
    expect(state.candleCount).toBe(4);
    expect(state.litCount).toBe(4);
  });

  it('defaults empty name to Friend', () => {
    const state = cakeReducer(initialCakeState, { type: 'START', name: '   ', candleCount: 3 });
    expect(state.name).toBe('Friend');
  });

  it('clamps candle count on start', () => {
    const state = cakeReducer(initialCakeState, { type: 'START', name: 'Ada', candleCount: 99 });
    expect(state.candleCount).toBe(12);
    expect(state.litCount).toBe(12);
  });

  it('extinguishes one candle at a time', () => {
    let state = cakeReducer(initialCakeState, { type: 'START', name: 'Ada', candleCount: 2 });
    state = cakeReducer(state, { type: 'EXTINGUISH_ONE' });
    expect(state.litCount).toBe(1);
    expect(state.screen).toBe('blowing');
  });

  it('transitions to celebrate when the last candle goes out', () => {
    let state = cakeReducer(initialCakeState, { type: 'START', name: 'Ada', candleCount: 1 });
    state = cakeReducer(state, { type: 'EXTINGUISH_ONE' });
    expect(state.litCount).toBe(0);
    expect(state.screen).toBe('celebrate');
  });

  it('ignores extinguish when not blowing or already at zero', () => {
    const state = cakeReducer(initialCakeState, { type: 'EXTINGUISH_ONE' });
    expect(state).toBe(initialCakeState);
  });

  it('resets back to initial state', () => {
    let state = cakeReducer(initialCakeState, { type: 'START', name: 'Ada', candleCount: 3 });
    state = cakeReducer(state, { type: 'RESET' });
    expect(state).toEqual(initialCakeState);
  });
});
