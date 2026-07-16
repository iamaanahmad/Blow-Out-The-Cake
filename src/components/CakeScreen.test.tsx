import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CakeScreen } from './CakeScreen';

// The mic detector relies on browser audio APIs that jsdom doesn't implement,
// so in this environment `supported` resolves to false and the fallback
// "Blow!" button is shown immediately, which is exactly the path we want to test.

describe('CakeScreen fallback button', () => {
  it('renders one Blow button that calls onExtinguishOne when clicked', () => {
    const onExtinguishOne = vi.fn();
    render(
      <CakeScreen name="Ada" candleCount={3} litCount={3} onExtinguishOne={onExtinguishOne} />,
    );

    const blowButton = screen.getByRole('button', { name: /blow!/i });
    fireEvent.click(blowButton);

    expect(onExtinguishOne).toHaveBeenCalledTimes(1);
  });

  it('renders the correct number of candle elements', () => {
    const { container } = render(
      <CakeScreen name="Ada" candleCount={4} litCount={2} onExtinguishOne={() => {}} />,
    );
    expect(container.querySelectorAll('.candle').length).toBe(4);
    expect(container.querySelectorAll('.candle-lit').length).toBe(2);
  });
});
