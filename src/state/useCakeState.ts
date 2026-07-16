import { useReducer } from 'react';

export type Screen = 'setup' | 'blowing' | 'celebrate';

export interface CakeState {
  screen: Screen;
  name: string;
  candleCount: number;
  litCount: number;
}

export const MIN_CANDLES = 1;
export const MAX_CANDLES = 12;

type CakeAction =
  | { type: 'START'; name: string; candleCount: number }
  | { type: 'EXTINGUISH_ONE' }
  | { type: 'RESET' };

export const initialCakeState: CakeState = {
  screen: 'setup',
  name: '',
  candleCount: 5,
  litCount: 0,
};

export function clampCandleCount(value: number): number {
  if (Number.isNaN(value)) return MIN_CANDLES;
  return Math.min(MAX_CANDLES, Math.max(MIN_CANDLES, Math.round(value)));
}

export function cakeReducer(state: CakeState, action: CakeAction): CakeState {
  switch (action.type) {
    case 'START': {
      const trimmedName = action.name.trim();
      const candleCount = clampCandleCount(action.candleCount);
      return {
        screen: 'blowing',
        name: trimmedName.length > 0 ? trimmedName : 'Friend',
        candleCount,
        litCount: candleCount,
      };
    }
    case 'EXTINGUISH_ONE': {
      if (state.screen !== 'blowing' || state.litCount <= 0) return state;
      const nextLitCount = state.litCount - 1;
      return {
        ...state,
        litCount: nextLitCount,
        screen: nextLitCount === 0 ? 'celebrate' : 'blowing',
      };
    }
    case 'RESET':
      return initialCakeState;
    default:
      return state;
  }
}

export function useCakeState() {
  const [state, dispatch] = useReducer(cakeReducer, initialCakeState);

  return {
    state,
    start: (name: string, candleCount: number) => dispatch({ type: 'START', name, candleCount }),
    extinguishOne: () => dispatch({ type: 'EXTINGUISH_ONE' }),
    reset: () => dispatch({ type: 'RESET' }),
  };
}
