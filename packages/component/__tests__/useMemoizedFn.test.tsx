import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { useMemoizedFn } from '../src/_hooks';

interface HookProbeProps {
  handler: (value: number) => number;
  onRender: (memoizedFn: (value: number) => number) => void;
}

function HookProbe({ handler, onRender }: HookProbeProps) {
  const memoizedFn = useMemoizedFn(handler);

  onRender(memoizedFn);

  return null;
}

describe('useMemoizedFn', () => {
  it('keeps function reference stable after rerender', () => {
    const onRender = jest.fn();
    const firstHandler = (value: number) => value + 1;
    const secondHandler = (value: number) => value + 2;

    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <HookProbe handler={firstHandler} onRender={onRender} />,
      );
    });

    const firstMemoizedFn = onRender.mock.calls.at(-1)[0];

    act(() => {
      testRenderer!.update(
        <HookProbe handler={secondHandler} onRender={onRender} />,
      );
    });

    const secondMemoizedFn = onRender.mock.calls.at(-1)[0];

    expect(secondMemoizedFn).toBe(firstMemoizedFn);
  });

  it('always calls the latest function logic', () => {
    const onRender = jest.fn();
    const firstHandler = jest.fn((value: number) => value + 1);
    const secondHandler = jest.fn((value: number) => value + 10);

    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <HookProbe handler={firstHandler} onRender={onRender} />,
      );
    });

    const memoizedFn = onRender.mock.calls.at(-1)[0] as (value: number) => number;

    const firstResult = memoizedFn(1);

    act(() => {
      testRenderer!.update(
        <HookProbe handler={secondHandler} onRender={onRender} />,
      );
    });

    const secondResult = memoizedFn(1);

    expect(firstResult).toBe(2);
    expect(secondResult).toBe(11);
    expect(firstHandler).toHaveBeenCalledTimes(1);
    expect(secondHandler).toHaveBeenCalledTimes(1);
  });
});
