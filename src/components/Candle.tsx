interface CandleProps {
  lit: boolean;
  justExtinguished: boolean;
}

export function Candle({ lit, justExtinguished }: CandleProps) {
  return (
    <div className={`candle ${lit ? 'candle-lit' : 'candle-unlit'}`}>
      {lit && <div className="flame" />}
      {justExtinguished && <div className="smoke-wisp" />}
      <div className="wick" />
      <div className="candle-stick" />
    </div>
  );
}
