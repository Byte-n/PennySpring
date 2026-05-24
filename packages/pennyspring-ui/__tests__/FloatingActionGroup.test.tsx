import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { FloatingActionGroup } from '../src/FloatingActionGroup';
import { PortalProvider } from '../src/Portal';

type WithTimingArgs = [number, unknown?, ((finished: boolean) => void)?];
const timingCallbacks: Array<(finished: boolean) => void> = [];

jest.mock('react-native-reanimated', () => {
  const ReactNative = require('react-native');

  return {
    __esModule: true,
    default: {
      View: ReactNative.View,
    },
    Easing: {
      bezier: (...args: unknown[]) => args,
    },
    useAnimatedStyle: (updater: () => Record<string, unknown>) => updater(),
    useSharedValue: (value: number) => ({
      value,
    }),
    runOnJS: (fn: (...args: unknown[]) => void) => fn,
    withTiming: (...args: WithTimingArgs) => {
      const callback = args[2];
      if (callback) {
        timingCallbacks.push(callback);
      }
      return args[0];
    },
  };
});

function flushTimingCallbacks(finished = true): void {
  while (timingCallbacks.length > 0) {
    const callback = timingCallbacks.shift();
    callback?.(finished);
  }
}

describe('FloatingActionGroup', () => {
  const baseActions = [
    { key: 'create', label: 'Create', onPress: jest.fn() },
    { key: 'scan', label: 'Scan', onPress: jest.fn() },
    { key: 'share', label: 'Share', onPress: jest.fn() },
  ];

  it('does not show more button when actions length does not exceed default visible count', () => {
    let testRenderer!: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <FloatingActionGroup actions={baseActions.slice(0, 2)} defaultVisibleCount={2} />,
      );
    });

    expect(() =>
      testRenderer.root.findByProps({ testID: 'floating-action-group-more-button' }),
    ).toThrow();
  });

  it('toggles hidden actions when pressing more button', () => {
    let testRenderer!: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <FloatingActionGroup actions={baseActions} defaultVisibleCount={1} />,
      );
    });

    expect(
      testRenderer.root.findAllByProps({ testID: 'floating-action-group-hidden-item' }).length,
    ).toBe(0);

    act(() => {
      testRenderer.root
        .findByProps({ testID: 'floating-action-group-more-button' })
        .props.onPress();
    });

    const expandedCount = testRenderer.root.findAllByProps({
      testID: 'floating-action-group-hidden-item',
    }).length;
    expect(expandedCount).toBeGreaterThanOrEqual(2);

    act(() => {
      testRenderer.root
        .findByProps({ testID: 'floating-action-group-more-button' })
        .props.onPress();
    });

    expect(
      testRenderer.root.findAllByProps({ testID: 'floating-action-group-hidden-item' }).length,
    ).toBeGreaterThanOrEqual(2);

    act(() => {
      flushTimingCallbacks(true);
    });

    expect(
      testRenderer.root.findAllByProps({ testID: 'floating-action-group-hidden-item' }).length,
    ).toBe(0);
  });

  it('collapses expanded group when outside overlay is pressed', () => {
    let testRenderer!: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <FloatingActionGroup
          actions={baseActions}
          collapseOnOutsidePress
          defaultVisibleCount={1}
        />,
      );
    });

    act(() => {
      testRenderer.root
        .findByProps({ testID: 'floating-action-group-more-button' })
        .props.onPress();
    });

    const expandedCount = testRenderer.root.findAllByProps({
      testID: 'floating-action-group-hidden-item',
    }).length;
    expect(expandedCount).toBeGreaterThanOrEqual(2);

    act(() => {
      testRenderer.root
        .findByProps({ testID: 'floating-action-group-outside-overlay' })
        .props.onPress();
    });

    expect(
      testRenderer.root.findAllByProps({ testID: 'floating-action-group-hidden-item' }).length,
    ).toBeGreaterThanOrEqual(2);

    act(() => {
      flushTimingCallbacks(true);
    });

    expect(
      testRenderer.root.findAllByProps({ testID: 'floating-action-group-hidden-item' }).length,
    ).toBe(0);
  });

  it('supports portal mount by mountPoint prop', () => {
    let testRenderer!: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <PortalProvider>
          <FloatingActionGroup
            actions={baseActions.slice(0, 1)}
            mountPoint="portal"
          />
        </PortalProvider>,
      );
    });

    expect(
      testRenderer.root.findByProps({ testID: 'floating-action-group-container' }),
    ).toBeTruthy();
  });
});
