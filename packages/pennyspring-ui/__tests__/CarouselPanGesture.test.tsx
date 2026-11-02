import React from 'react';
import renderer, { act } from 'react-test-renderer';

import { Carousel } from '../src/Carousel';

const mockGestureCalls: { method: string; args: unknown[] }[] = [];
const mockTouchActions: (string | undefined)[] = [];

jest.mock('react-native-gesture-handler', () => {
  const ReactLocal = require('react');

  const createPanGesture = () => {
    const gesture: Record<string, (...args: unknown[]) => unknown> = {};
    [
      'enabled',
      'activeOffsetX',
      'activeOffsetY',
      'failOffsetX',
      'failOffsetY',
      'onBegin',
      'onUpdate',
      'onEnd',
      'onFinalize',
    ].forEach(method => {
      gesture[method] = (...args: unknown[]) => {
        mockGestureCalls.push({ method, args });
        return gesture;
      };
    });
    return gesture;
  };

  return {
    Gesture: { Pan: createPanGesture },
    GestureDetector: ({
      children,
      touchAction,
    }: {
      children: React.ReactNode;
      touchAction?: string;
    }) => {
      mockTouchActions.push(touchAction);
      return ReactLocal.createElement(ReactLocal.Fragment, undefined, children);
    },
  };
});

const ITEMS = [
  { id: '1', title: 'Alpha' },
  { id: '2', title: 'Beta' },
];

function renderGestureCalls(
  direction: 'horizontal' | 'vertical',
): { method: string; args: unknown[] }[] {
  mockGestureCalls.length = 0;
  mockTouchActions.length = 0;

  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(
      <Carousel
        data={ITEMS}
        direction={direction}
        renderItem={item => <>{item.title}</>}
      />,
    );
  });

  const layoutNode = testRenderer!.root.findAll(
    node => typeof node.props.onLayout === 'function',
  )[0];

  act(() => {
    layoutNode.props.onLayout({
      nativeEvent: { layout: { width: 300, height: 300 } },
    });
  });

  return mockGestureCalls.slice();
}

describe('Carousel pan gesture axis locking', () => {
  it('activates horizontally and fails vertically so the outer scroll view keeps the gesture', () => {
    const calls = renderGestureCalls('horizontal');

    expect(calls).toEqual(
      expect.arrayContaining([
        { method: 'activeOffsetX', args: [[-5, 5]] },
        { method: 'failOffsetY', args: [[-10, 10]] },
      ]),
    );
    expect(calls.map(call => call.method)).not.toContain('activeOffsetY');
    expect(calls.map(call => call.method)).not.toContain('failOffsetX');
    expect(mockTouchActions).toContain('pan-y');
  });

  it('activates vertically and fails horizontally', () => {
    const calls = renderGestureCalls('vertical');

    expect(calls).toEqual(
      expect.arrayContaining([
        { method: 'activeOffsetY', args: [[-5, 5]] },
        { method: 'failOffsetX', args: [[-10, 10]] },
      ]),
    );
    expect(calls.map(call => call.method)).not.toContain('activeOffsetX');
    expect(calls.map(call => call.method)).not.toContain('failOffsetY');
    expect(mockTouchActions).toContain('pan-x');
  });
});
