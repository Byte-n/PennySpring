import React from 'react';
import { StyleSheet } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { toShadowStyle } from '@pennyspring/theme';
import { Button } from '../src/Button';
import { FloatingActionGroup } from '../src/FloatingActionGroup';
import { PortalProvider } from '../src/Portal';
import type { FloatingActionGroupStyles } from '../src/FloatingActionGroup';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock('@pennyspring/theme', () => {
  const actual = jest.requireActual('@pennyspring/theme');

  return {
    ...actual,
    toShadowStyle: jest.fn(shadow => ({
      ...actual.toShadowStyle(shadow),
      convertedByToShadowStyle: true,
    })),
  };
});

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
    withDelay: (_delay: number, value: unknown) => value,
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
  const rootStyle = { opacity: 0.64 };

  it('does not show more button when actions length does not exceed default visible count', () => {
    let testRenderer!: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <FloatingActionGroup
          actions={baseActions.slice(0, 2)}
          defaultVisibleCount={2}
        />,
      );
    });

    expect(() =>
      testRenderer.root.findByProps({
        testID: 'floating-action-group-more-button',
      }),
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
      testRenderer.root.findAllByProps({
        testID: 'floating-action-group-hidden-item',
      }).length,
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
      testRenderer.root.findAllByProps({
        testID: 'floating-action-group-hidden-item',
      }).length,
    ).toBeGreaterThanOrEqual(2);

    act(() => {
      flushTimingCallbacks(true);
    });

    expect(
      testRenderer.root.findAllByProps({
        testID: 'floating-action-group-hidden-item',
      }).length,
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
      testRenderer.root.findAllByProps({
        testID: 'floating-action-group-hidden-item',
      }).length,
    ).toBeGreaterThanOrEqual(2);

    act(() => {
      flushTimingCallbacks(true);
    });

    expect(
      testRenderer.root.findAllByProps({
        testID: 'floating-action-group-hidden-item',
      }).length,
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
      testRenderer.root.findByProps({
        testID: 'floating-action-group-container',
      }),
    ).toBeTruthy();
  });

  it('passes buttonProps to action buttons', () => {
    let testRenderer!: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <FloatingActionGroup
          actions={[
            {
              key: 'create',
              label: 'Create',
              onPress: jest.fn(),
              buttonProps: {
                testID: 'book-manage-create-button',
                hitSlop: { top: 12, bottom: 12, left: 12, right: 12 },
              },
            },
          ]}
        />,
      );
    });

    const button = testRenderer.root.findByType(Button);
    expect(button.props.testID).toBe('book-manage-create-button');
    expect(button.props.hitSlop).toEqual({
      top: 12,
      bottom: 12,
      left: 12,
      right: 12,
    });
  });

  it('passes group size to every floating button', () => {
    // Arrange
    let testRenderer!: renderer.ReactTestRenderer;
    const props = {
      actions: baseActions,
      defaultVisibleCount: 1,
      size: 'small' as const,
    };

    act(() => {
      testRenderer = renderer.create(<FloatingActionGroup {...props} />);
    });

    // Act
    act(() => {
      testRenderer.root
        .findByProps({ testID: 'floating-action-group-more-button' })
        .props.onPress();
    });

    // Assert
    expect(
      testRenderer.root
        .findAllByType(Button)
        .every(button => button.props.size === 'small'),
    ).toBe(true);
  });

  it('applies root slot styles to the visible root node', () => {
    // Arrange
    let testRenderer!: renderer.ReactTestRenderer;
    const styles = {
      root: rootStyle,
    } as unknown as FloatingActionGroupStyles;

    act(() => {
      testRenderer = renderer.create(
        <FloatingActionGroup
          actions={baseActions.slice(0, 1)}
          styles={styles}
        />,
      );
    });

    // Act
    const container = testRenderer.root.findByProps({
      testID: 'floating-action-group-container',
    });
    const flattenedStyle = StyleSheet.flatten(container.props.style);

    // Assert
    expect(flattenedStyle.opacity).toBe(rootStyle.opacity);
  });

  it('uses the shared shadow converter for the main fab only', () => {
    // Arrange
    let testRenderer!: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <FloatingActionGroup actions={baseActions} defaultVisibleCount={1} />,
      );
    });

    // Act
    act(() => {
      testRenderer.root
        .findByProps({ testID: 'floating-action-group-more-button' })
        .props.onPress();
    });

    const hiddenItem = testRenderer.root.findAllByProps({
      testID: 'floating-action-group-hidden-item',
    })[0];
    const flattenedStyle = StyleSheet.flatten(hiddenItem.props.style);

    // Assert
    expect(toShadowStyle).toHaveBeenCalled();
    expect(flattenedStyle.convertedByToShadowStyle).toBeUndefined();
  });
});
