import React from 'react';
import { StyleSheet } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Button } from '../src/Button';
import { FloatingActionGroup } from '../src/FloatingActionGroup';
import { Icon } from '../src/Icon';
import { PortalProvider } from '../src/Portal';
import type { FloatingActionGroupStyles } from '../src/FloatingActionGroup';

const mockPanEnabled = jest.fn();

jest.mock('react-native-safe-area-context', () => {
  const ReactLib = require('react');
  const insets = { top: 0, right: 0, bottom: 0, left: 0 };

  return {
    SafeAreaInsetsContext: ReactLib.createContext(insets),
    useSafeAreaInsets: () => insets,
  };
});

jest.mock('react-native-gesture-handler', () => {
  const chain: Record<string, jest.Mock> = {};
  chain.minDistance = jest.fn(() => chain);
  chain.enabled = jest.fn((enabled: boolean) => {
    mockPanEnabled(enabled);
    return chain;
  });
  chain.hitSlop = jest.fn(() => chain);
  chain.onStart = jest.fn(() => chain);
  chain.onUpdate = jest.fn(() => chain);
  chain.onEnd = jest.fn(() => chain);
  chain.onFinalize = jest.fn(() => chain);

  return {
    __esModule: true,
    Gesture: {
      Pan: jest.fn(() => chain),
      Exclusive: jest.fn((...gestures: unknown[]) => gestures[0]),
    },
    GestureDetector: ({ children }: { children: React.ReactNode }) => children,
  };
});

jest.mock('react-native-reanimated', () => {
  const ReactNative = require('react-native');

  const interpolate = (
    value: number,
    input: number[],
    output: number[],
  ): number => {
    if (value <= input[0]) {
      return output[0];
    }
    const lastIndex = input.length - 1;
    if (value >= input[lastIndex]) {
      return output[lastIndex];
    }
    const index = input.findIndex(
      (inputValue, currentIndex) =>
        value >= inputValue && value <= input[currentIndex + 1],
    );
    const progress = (value - input[index]) / (input[index + 1] - input[index]);

    return output[index] + (output[index + 1] - output[index]) * progress;
  };

  return {
    __esModule: true,
    default: {
      View: ReactNative.View,
      Text: ReactNative.Text,
    },
    Easing: {
      bezier: (...args: unknown[]) => args,
    },
    interpolate,
    runOnJS: (fn: (...args: unknown[]) => void) => fn,
    useAnimatedStyle: (updater: () => Record<string, unknown>) => updater(),
    useSharedValue: (value: number) => ({ value }),
    withDelay: (_delay: number, value: unknown) => value,
    withTiming: (value: number) => value,
  };
});

const baseActions = [
  { key: 'create', label: '记一笔', icon: 'plus' as const, onPress: jest.fn() },
  { key: 'list', label: '快捷模板', icon: 'list' as const, onPress: jest.fn() },
  {
    key: 'transfer',
    label: '转账',
    icon: 'share' as const,
    onPress: jest.fn(),
  },
];

beforeEach(() => {
  mockPanEnabled.mockClear();
  baseActions.forEach(action => action.onPress.mockClear());
});

describe('FloatingActionGroup', () => {
  it('uses the only action directly on the trigger and renders no menu', () => {
    // Arrange
    const onPress = jest.fn();
    let testRenderer!: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <FloatingActionGroup
          actions={[{ key: 'create', label: '记一笔', icon: 'plus', onPress }]}
        />,
      );
    });

    const trigger = testRenderer.root.findByProps({
      testID: 'floating-action-group-trigger',
    });
    expect(trigger.props.accessibilityLabel).toBe('记一笔');

    // Act
    act(() => {
      trigger.props.onPress();
    });

    // Assert
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(testRenderer.root.findAllByType(Button)).toHaveLength(0);
  });

  it('opens and closes the action menu from the trigger', () => {
    // Arrange
    let testRenderer!: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <FloatingActionGroup actions={baseActions} />,
      );
    });

    // Act
    act(() => {
      testRenderer.root
        .findByProps({ testID: 'floating-action-group-trigger' })
        .props.onPress();
    });

    // Assert
    expect(
      testRenderer.root.findByProps({
        testID: 'floating-action-group-trigger',
      }).props.accessibilityLabel,
    ).toBe('收起操作');
    expect(testRenderer.root.findAllByType(Button)).toHaveLength(
      baseActions.length,
    );

    act(() => {
      testRenderer.root
        .findByProps({ testID: 'floating-action-group-trigger' })
        .props.onPress();
    });

    expect(
      testRenderer.root.findByProps({
        testID: 'floating-action-group-trigger',
      }).props.accessibilityLabel,
    ).toBe('展开操作');
  });

  it('runs an action and closes the menu when an action is pressed', () => {
    // Arrange
    let testRenderer!: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <FloatingActionGroup actions={baseActions} layout="fan" />,
      );
    });

    act(() => {
      testRenderer.root
        .findByProps({ testID: 'floating-action-group-trigger' })
        .props.onPress();
    });

    // Act
    const firstAction = testRenderer.root.findAllByType(Button)[0];
    act(() => {
      firstAction.props.onPress();
    });

    // Assert
    expect(baseActions[0].onPress).toHaveBeenCalledTimes(1);
    expect(
      testRenderer.root.findByProps({
        testID: 'floating-action-group-trigger',
      }).props.accessibilityLabel,
    ).toBe('展开操作');
  });

  it('collapses the menu when the outside overlay is pressed', () => {
    // Arrange
    let testRenderer!: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <FloatingActionGroup actions={baseActions} />,
      );
    });

    act(() => {
      testRenderer.root
        .findByProps({ testID: 'floating-action-group-trigger' })
        .props.onPress();
    });

    // Act
    act(() => {
      testRenderer.root
        .findByProps({ testID: 'floating-action-group-outside-overlay' })
        .props.onPress();
    });

    // Assert
    expect(
      testRenderer.root.findByProps({
        testID: 'floating-action-group-trigger',
      }).props.accessibilityLabel,
    ).toBe('展开操作');
  });

  it('passes buttonProps and group size to every action button', () => {
    // Arrange
    let testRenderer!: renderer.ReactTestRenderer;
    const actions = [
      {
        ...baseActions[0],
        buttonProps: {
          testID: 'record-action',
          hitSlop: { top: 12, bottom: 12, left: 12, right: 12 },
        },
      },
      baseActions[1],
    ];

    act(() => {
      testRenderer = renderer.create(
        <FloatingActionGroup actions={actions} size="small" />,
      );
    });

    // Act
    const buttons = testRenderer.root.findAllByType(Button);

    // Assert
    expect(buttons).toHaveLength(2);
    expect(buttons[0].props.testID).toBe('record-action');
    expect(buttons[0].props.hitSlop).toEqual({
      top: 12,
      bottom: 12,
      left: 12,
      right: 12,
    });
    expect(buttons.every(button => button.props.size === 'small')).toBe(true);
  });

  it('extends the trigger hit slop inward only when snapToEdge is enabled', () => {
    // Arrange
    let testRenderer!: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <FloatingActionGroup actions={baseActions} snapToEdge />,
      );
    });

    // Act
    const dockedHitSlop = testRenderer.root.findByProps({
      testID: 'floating-action-group-trigger',
    }).props.hitSlop;

    // Assert
    expect(dockedHitSlop).toEqual({ top: 0, right: 0, bottom: 0, left: 12 });

    act(() => {
      testRenderer = renderer.create(
        <FloatingActionGroup actions={baseActions} snapToEdge={false} />,
      );
    });

    expect(
      testRenderer.root.findByProps({
        testID: 'floating-action-group-trigger',
      }).props.hitSlop,
    ).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
  });

  it('disables the pan gesture when draggable is false and enables it by default', () => {
    // Arrange
    let testRenderer!: renderer.ReactTestRenderer;

    // Act
    act(() => {
      testRenderer = renderer.create(
        <FloatingActionGroup actions={baseActions} draggable={false} />,
      );
    });

    // Assert
    expect(testRenderer).toBeTruthy();
    expect(mockPanEnabled).toHaveBeenLastCalledWith(false);

    // Act
    act(() => {
      testRenderer = renderer.create(
        <FloatingActionGroup actions={baseActions} draggable />,
      );
    });

    // Assert
    expect(mockPanEnabled).toHaveBeenLastCalledWith(true);
  });

  it('applies root slot styles to the container', () => {
    // Arrange
    let testRenderer!: renderer.ReactTestRenderer;
    const styles = { root: { opacity: 0.64 } } as FloatingActionGroupStyles;

    act(() => {
      testRenderer = renderer.create(
        <FloatingActionGroup actions={baseActions} styles={styles} />,
      );
    });

    // Act
    const container = testRenderer.root.findByProps({
      testID: 'floating-action-group-container',
    });
    const flattenedStyle = StyleSheet.flatten(container.props.style);

    // Assert
    expect(flattenedStyle.opacity).toBe(0.64);
  });

  it('renders the trigger through a portal when requested', () => {
    // Arrange / Act
    let testRenderer!: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <PortalProvider>
          <FloatingActionGroup actions={baseActions} mountPoint="portal" />
        </PortalProvider>,
      );
    });

    // Assert
    expect(
      testRenderer.root.findByProps({
        testID: 'floating-action-group-container',
      }),
    ).toBeTruthy();
  });

  it('renders nothing when there are no actions', () => {
    // Act
    let testRenderer!: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(<FloatingActionGroup actions={[]} />);
    });

    // Assert
    expect(testRenderer.toJSON()).toBeNull();
  });

  it('renders the single action icon on the trigger for direct mode', () => {
    // Arrange
    let testRenderer!: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <FloatingActionGroup
          actions={[
            {
              key: 'create',
              label: '记一笔',
              icon: 'plus',
              onPress: jest.fn(),
            },
          ]}
        />,
      );
    });

    // Act
    const icons = testRenderer.root.findAllByType(Icon);

    // Assert
    expect(icons).toHaveLength(1);
    expect(icons[0].props.icon).toBe('plus');
  });
});
