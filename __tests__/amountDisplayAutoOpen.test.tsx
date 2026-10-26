import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { CalculatorInput } from '@pennyspring/ui';
import { AddRecordProvider } from '../src/screens/addRecord/AddRecordContext';
import { AmountDisplay } from '../src/screens/addRecord/components/AmountDisplay';

function renderAmountDisplays(autoOpenAmount: boolean, count = 1) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <AddRecordProvider autoOpenAmount={autoOpenAmount}>
        {Array.from({ length: count }, (_, index) => (
          <AmountDisplay key={index} />
        ))}
      </AddRecordProvider>,
    );
  });

  return testRenderer!;
}

describe('AmountDisplay auto open', () => {
  it('opens the amount popup automatically when entering a new record', () => {
    const testRenderer = renderAmountDisplays(true);
    const popups = testRenderer.root.findAllByType(CalculatorInput.Popup);

    expect(popups).toHaveLength(1);
    expect(popups[0].props.open).toBe(true);
  });

  it('opens only the first amount popup when multiple amount displays mount', () => {
    const testRenderer = renderAmountDisplays(true, 2);
    const popups = testRenderer.root.findAllByType(CalculatorInput.Popup);

    expect(popups).toHaveLength(2);
    expect(popups.map(popup => popup.props.open)).toEqual([true, false]);
  });

  it('keeps the amount popup closed when auto open is disabled', () => {
    const testRenderer = renderAmountDisplays(false);
    const popups = testRenderer.root.findAllByType(CalculatorInput.Popup);

    expect(popups).toHaveLength(1);
    expect(popups[0].props.open).toBe(false);
  });
});
