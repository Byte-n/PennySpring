import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { useControllableValue } from '../src/_hooks';

interface HookProbeProps<T> {
  defaultValue?: T;
  onChange?: (value: T) => void;
  onRender: (snapshot: readonly [T | undefined, (value: T) => void, boolean]) => void;
  value?: T;
}

function HookProbe<T>({
  defaultValue,
  onChange,
  onRender,
  value,
}: HookProbeProps<T>) {
  const snapshot = useControllableValue(defaultValue, value, onChange);

  onRender(snapshot);

  return null;
}

describe('useControllableValue', () => {
  it('updates internal value and notifies changes in uncontrolled mode', () => {
    const onChange = jest.fn();
    const onRender = jest.fn();

    act(() => {
      renderer.create(
        <HookProbe
          defaultValue="cash"
          onChange={onChange}
          onRender={onRender}
        />,
      );
    });

    const [, handleChange, isControlled] = onRender.mock.calls.at(-1)[0];

    act(() => {
      handleChange('wallet');
    });

    expect(onRender.mock.calls.at(-1)[0][0]).toBe('wallet');
    expect(onRender.mock.calls.at(-1)[0][2]).toBe(false);
    expect(isControlled).toBe(false);
    expect(onChange).toHaveBeenCalledWith('wallet');
  });

  it('keeps value derived from props and reports changes in controlled mode', () => {
    const onChange = jest.fn();
    const onRender = jest.fn();

    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <HookProbe
          defaultValue="cash"
          onChange={onChange}
          onRender={onRender}
          value="card"
        />,
      );
    });

    const [, handleChange, isControlled] = onRender.mock.calls.at(-1)[0];

    act(() => {
      handleChange('wallet');
    });

    expect(onRender.mock.calls.at(-1)[0][0]).toBe('card');
    expect(onRender.mock.calls.at(-1)[0][2]).toBe(true);
    expect(isControlled).toBe(true);
    expect(onChange).toHaveBeenCalledWith('wallet');

    act(() => {
      testRenderer!.update(
        <HookProbe
          defaultValue="cash"
          onChange={onChange}
          onRender={onRender}
          value="wallet"
        />,
      );
    });

    expect(onRender.mock.calls.at(-1)[0][0]).toBe('wallet');
  });
});
