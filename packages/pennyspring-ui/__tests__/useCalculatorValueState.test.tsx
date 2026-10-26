import React from 'react';
import renderer, { act } from 'react-test-renderer';

import type { CalculatorValueState } from '../src/CalculatorInput';
import type { UseCalculatorValueStateOptions } from '../src/CalculatorInput';
import { CalculatorInput } from '../src';

interface HookProbeProps extends UseCalculatorValueStateOptions {
  onRender: (state: CalculatorValueState) => void;
}

function HookProbe({ onRender, ...options }: HookProbeProps) {
  onRender(CalculatorInput.useCalculatorValueState(options));

  return null;
}

function getLatestState(onRender: jest.Mock): CalculatorValueState {
  return onRender.mock.calls.at(-1)[0];
}

describe('useCalculatorValueState', () => {
  it('resets the expression to initialValue when opened', () => {
    const onOpenChange = jest.fn();
    const onRender = jest.fn();

    act(() => {
      renderer.create(
        <HookProbe
          initialValue="12.34"
          onOpenChange={onOpenChange}
          onRender={onRender}
        />,
      );
    });

    expect(getLatestState(onRender).isOpen).toBe(false);
    expect(getLatestState(onRender).value).toBe('');

    act(() => {
      getLatestState(onRender).open();
    });

    expect(getLatestState(onRender).isOpen).toBe(true);
    expect(getLatestState(onRender).value).toBe('12.34');
    expect(onOpenChange).toHaveBeenCalledWith(true);

    act(() => {
      getLatestState(onRender).close();
    });

    expect(getLatestState(onRender).isOpen).toBe(false);
  });

  it('updates the expression and notifies changes', () => {
    const onChange = jest.fn();
    const onRender = jest.fn();

    act(() => {
      renderer.create(<HookProbe onChange={onChange} onRender={onRender} />);
    });

    act(() => {
      getLatestState(onRender).setValue('1+2');
    });

    expect(getLatestState(onRender).value).toBe('1+2');
    expect(onChange).toHaveBeenCalledWith('1+2');
  });

  it('calls onOk before closing the popup', () => {
    const calls: string[] = [];
    const onOk = jest.fn(() => {
      calls.push('ok');
    });
    const onOpenChange = jest.fn((open: boolean) => {
      if (!open) {
        calls.push('close');
      }
    });
    const onRender = jest.fn();

    act(() => {
      renderer.create(
        <HookProbe
          onOk={onOk}
          onOpenChange={onOpenChange}
          onRender={onRender}
        />,
      );
    });

    act(() => {
      getLatestState(onRender).open();
    });
    act(() => {
      getLatestState(onRender).handleOk({ expression: '6/2', result: 3 });
    });

    expect(onOk).toHaveBeenCalledWith({ expression: '6/2', result: 3 });
    expect(calls).toEqual(['ok', 'close']);
    expect(getLatestState(onRender).isOpen).toBe(false);
  });

  it('keeps open state from props in controlled mode while still resetting', () => {
    const onOpenChange = jest.fn();
    const onRender = jest.fn();
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <HookProbe
          initialValue="8"
          onOpenChange={onOpenChange}
          onRender={onRender}
          open={false}
        />,
      );
    });

    act(() => {
      getLatestState(onRender).open();
    });

    expect(getLatestState(onRender).isOpen).toBe(false);
    expect(getLatestState(onRender).value).toBe('8');
    expect(onOpenChange).toHaveBeenCalledWith(true);

    act(() => {
      testRenderer!.update(
        <HookProbe
          initialValue="8"
          onOpenChange={onOpenChange}
          onRender={onRender}
          open
        />,
      );
    });

    expect(getLatestState(onRender).isOpen).toBe(true);
  });
});
