import { useCakeState } from './state/useCakeState';
import { SetupScreen } from './components/SetupScreen';
import { CakeScreen } from './components/CakeScreen';
import { CelebrationCard } from './components/CelebrationCard';
import './App.css';

export function App() {
  const { state, start, extinguishOne, reset } = useCakeState();

  return (
    <div className="app">
      {state.screen === 'setup' && <SetupScreen onStart={start} />}
      {state.screen === 'blowing' && (
        <CakeScreen
          name={state.name}
          candleCount={state.candleCount}
          litCount={state.litCount}
          onExtinguishOne={extinguishOne}
        />
      )}
      {state.screen === 'celebrate' && <CelebrationCard name={state.name} onStartOver={reset} />}
    </div>
  );
}
