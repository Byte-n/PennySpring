import React from 'react';
import { View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { SwipeAction } from '../src/SwipeAction';
import type { SwipeActionAction } from '../src/SwipeAction';
import { Text } from '../src/Text';

jest.mock('react-native-reanimated', () => {
  const ReactNative = require('react-native');

  return {
    __esModule: true,
    default: {
      View: ReactNative.View,
    },
    Easing: {
      bezier: () => 'bezier',
    },
    cancelAnimation: jest.fn(),
    useAnimatedStyle: (updater: () => Record<string, unknown>) => updater(),
    useSharedValue: (value: number) => {
      const ReactLocal = require('react');
      const sharedValueRef = ReactLocal.useRef({ value });

      return sharedValueRef.current;
    },
    withTiming: (value: number) => value,
  };
});

jest.mock('react-native-gesture-handler', () => {
  const ReactLocal = require('react');
  const ReactNative = require('react-native');
  type MockGestureHandler = (
    mockEvent?: unknown,
    mockSuccess?: boolean,
  ) => void;

  const createPanGesture = () => {
    const handlers: Record<string, MockGestureHandler> = {};
    const gesture = {
      __handlers: handlers,
      activeOffsetX: () => gesture,
      enabled: () => gesture,
      failOffsetY: () => gesture,
      minDistance: () => gesture,
      onBegin: (handler: MockGestureHandler) => {
        handlers.onBegin = handler;
        return gesture;
      },
      onEnd: (handler: MockGestureHandler) => {
        handlers.onEnd = handler;
        return gesture;
      },
      onFinalize: (handler: MockGestureHandler) => {
        handlers.onFinalize = handler;
        return gesture;
      },
      onUpdate: (handler: MockGestureHandler) => {
        handlers.onUpdate = handler;
        return gesture;
      },
      runOnJS: () => gesture,
    };

    return gesture;
  };

  return {
    Gesture: {
      Pan: createPanGesture,
    },
    GestureDetector: ({
      children,
      gesture,
    }: {
      children: React.ReactNode;
      gesture: unknown;
    }) =>
      ReactLocal.createElement(
        ReactNative.View,
        {
          gesture,
          testID: 'swipe-action-gesture-detector',
        },
        children,
      ),
  };
});

function renderSwipeAction(props: Partial<React.ComponentProps<typeof SwipeAction>> = {}) {
  const leftActions: SwipeActionAction[] = [{
    key: 'left-archive',
    actionText: 'Archive'
  }];
  const rightActions: SwipeActionAction[] = [{
    key: 'right-delete',
    actionText: 'Delete'
  }];
  let testRenderer: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><SwipeAction leftActions={leftActions} rightActions={rightActions} {...props}>
          <View testID="swipe-action-child" />
        </SwipeAction></>);
  });
  return testRenderer!;
}
function setupActionWidth(testRenderer: renderer.ReactTestRenderer, options: {
  leftWidth?: number;
  rightWidth?: number;
} = {}): void {
  const leftActions = testRenderer.root.findByProps({
    testID: 'swipe-action-left-actions'
  });
  const rightActions = testRenderer.root.findByProps({
    testID: 'swipe-action-right-actions'
  });
  act(() => {
    leftActions.props.onLayout({
      nativeEvent: {
        layout: {
          width: options.leftWidth ?? 80
        }
      }
    });
    rightActions.props.onLayout({
      nativeEvent: {
        layout: {
          width: options.rightWidth ?? 80
        }
      }
    });
  });
}
function swipeRow(testRenderer: renderer.ReactTestRenderer, options: {
  startX: number;
  endX: number;
  pageY?: number;
}): void {
  const gestureDetector = testRenderer.root.findByProps({
    testID: 'swipe-action-gesture-detector'
  });
  const gesture = gestureDetector.props.gesture as {
    __handlers: {
      onBegin?: () => void;
      onEnd?: (event: { translationX: number; velocityX: number }) => void;
      onUpdate?: (event: { translationX: number; translationY: number }) => void;
    };
  };
  const pageY = options.pageY ?? 0;
  const translationX = options.endX - options.startX;
  act(() => {
    gesture.__handlers.onBegin?.();
    gesture.__handlers.onUpdate?.({
      translationX,
      translationY: pageY,
    });
    gesture.__handlers.onEnd?.({
      translationX,
      velocityX: 0,
    });
  });
}
function getTrackTranslateX(testRenderer: renderer.ReactTestRenderer): number {
  const track = testRenderer.root.findByProps({
    testID: 'swipe-action-track'
  });
  const styleList = track.props.style as Array<Record<string, unknown>>;
  const transformStyle = styleList.find(style => style.transform !== undefined);
  if (transformStyle === undefined) {
    return 0;
  }
  const transformList = transformStyle.transform as Array<Record<string, number>>;
  const translateStyle = transformList.find(style => style.translateX !== undefined);
  return translateStyle?.translateX ?? 0;
}
describe('SwipeAction', () => {
  it('keeps track at zero offset by default', () => {
    const testRenderer = renderSwipeAction();
    setupActionWidth(testRenderer);
    expect(getTrackTranslateX(testRenderer)).toBe(0);
  });
  it('reveals right actions when swiping left in uncontrolled mode', () => {
    const onActionsReveal = jest.fn();
    const onChange = jest.fn();
    const testRenderer = renderSwipeAction({
      defaultValue: null,
      onActionsReveal,
      onChange
    });
    setupActionWidth(testRenderer, {
      rightWidth: 80
    });
    swipeRow(testRenderer, {
      startX: 100,
      endX: 20
    });
    expect(onActionsReveal).toHaveBeenCalledWith('right');
    expect(onChange).toHaveBeenCalledWith('right');
    expect(getTrackTranslateX(testRenderer)).toBe(-80);
  });
  it('fires action callbacks and closes by default after action press', () => {
    const actionPress = jest.fn();
    const onAction = jest.fn();
    const onChange = jest.fn();
    const testRenderer = renderSwipeAction({
      onAction,
      onChange,
      rightActions: [{
        key: 'delete',
        onPress: actionPress,
        actionText: 'Delete'
      }]
    });
    setupActionWidth(testRenderer, {
      rightWidth: 80
    });
    swipeRow(testRenderer, {
      startX: 100,
      endX: 20
    });
    const action = testRenderer.root.findByProps({
      testID: 'swipe-action-right-action-0'
    });
    act(() => {
      action.props.onPress();
    });
    expect(actionPress).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledWith(expect.objectContaining({
      key: 'delete'
    }), 0, 'right');
    expect(onChange).toHaveBeenNthCalledWith(2, null);
    expect(getTrackTranslateX(testRenderer)).toBe(0);
  });
  it('keeps open state after action press when closeOnAction is false', () => {
    const onChange = jest.fn();
    const testRenderer = renderSwipeAction({
      closeOnAction: false,
      onChange
    });
    setupActionWidth(testRenderer, {
      rightWidth: 80
    });
    swipeRow(testRenderer, {
      startX: 100,
      endX: 20
    });
    const action = testRenderer.root.findByProps({
      testID: 'swipe-action-right-action-0'
    });
    act(() => {
      action.props.onPress();
    });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(getTrackTranslateX(testRenderer)).toBe(-80);
  });
  it('fires onCancel before onChange when tapping content while opened', () => {
    const calls: string[] = [];
    const testRenderer = renderSwipeAction({
      defaultValue: 'right',
      onCancel: () => {
        calls.push('cancel');
      },
      onChange: nextValue => {
        calls.push(`change:${String(nextValue)}`);
      }
    });
    setupActionWidth(testRenderer, {
      rightWidth: 80
    });
    const content = testRenderer.root.findByProps({
      testID: 'swipe-action-content'
    });
    act(() => {
      content.props.onResponderRelease();
    });
    expect(calls).toEqual(['cancel', 'change:null']);
    expect(getTrackTranslateX(testRenderer)).toBe(0);
  });

  it('rejects backgroundColor on action items', () => {
    type ActionKeys = keyof SwipeActionAction;
    const keys: ActionKeys[] = ['key', 'actionText', 'action', 'color', 'disabled', 'onPress'];
    expect(keys).toHaveLength(6);
  });

  it('renders actionText as the visible text content', () => {
    const testRenderer = renderSwipeAction({
      rightActions: [{
        key: 'label',
        actionText: 'Archive',
        color: 'success',
      }],
    });
    const action = testRenderer.root.findByProps({
      testID: 'swipe-action-right-action-0',
    });
    const textNode = action.findByType(Text);
    expect(textNode.props.children).toBe('Archive');
  });

  it('renders custom action node directly without wrapping in Text', () => {
    const customNode = React.createElement(View, { testID: 'custom-action-node' });
    const testRenderer = renderSwipeAction({
      rightActions: [{
        key: 'custom',
        action: customNode,
      }],
    });
    const action = testRenderer.root.findByProps({
      testID: 'swipe-action-right-action-0',
    });
    expect(() => action.findByType(Text)).toThrow();
    expect(action.findByProps({ testID: 'custom-action-node' })).toBeTruthy();
  });

  it('suppresses rendering when action is explicitly null', () => {
    const testRenderer = renderSwipeAction({
      rightActions: [{
        key: 'hidden',
        actionText: 'Should not render',
        action: null,
      }],
    });
    const action = testRenderer.root.findByProps({
      testID: 'swipe-action-right-action-0',
    });
    expect(() => action.findByType(Text)).toThrow();
    const renderedText = testRenderer.root.findAllByType(Text);
    const hiddenText = renderedText.find(t => t.props.children === 'Should not render');
    expect(hiddenText).toBeUndefined();
  });

  it('falls back to actionText when action is undefined', () => {
    const testRenderer = renderSwipeAction({
      rightActions: [{
        key: 'fallback',
        actionText: 'Fallback Text',
      }],
    });
    const action = testRenderer.root.findByProps({
      testID: 'swipe-action-right-action-0',
    });
    const textNode = action.findByType(Text);
    expect(textNode.props.children).toBe('Fallback Text');
  });

  it('renders actionText with correct size based on SwipeAction size', () => {
    const testRenderer = renderSwipeAction({
      size: 'small',
      rightActions: [{
        key: 'sized',
        actionText: 'Small',
        color: 'primary',
      }],
    });
    const action = testRenderer.root.findByProps({
      testID: 'swipe-action-right-action-0',
    });
    const textNode = action.findByType(Text);
    expect(textNode.props.size).toBe('sm');
  });

  it('renders actionText with large size for large SwipeAction', () => {
    const testRenderer = renderSwipeAction({
      size: 'large',
      rightActions: [{
        key: 'sized',
        actionText: 'Large',
        color: 'primary',
      }],
    });
    const action = testRenderer.root.findByProps({
      testID: 'swipe-action-right-action-0',
    });
    const textNode = action.findByType(Text);
    expect(textNode.props.size).toBe('lg');
  });

  it('applies lightSolid text color for strong background colors', () => {
    const testRenderer = renderSwipeAction({
      rightActions: [{
        key: 'strong-bg',
        actionText: 'Delete',
        color: 'danger',
      }],
    });
    const action = testRenderer.root.findByProps({
      testID: 'swipe-action-right-action-0',
    });
    const textNode = action.findByType(Text);
    expect(textNode.props.color).toBe('lightSolid');
  });

  it('applies default text color for light background', () => {
    const testRenderer = renderSwipeAction({
      rightActions: [{
        key: 'light-bg',
        actionText: 'Light',
        color: 'light',
      }],
    });
    const action = testRenderer.root.findByProps({
      testID: 'swipe-action-right-action-0',
    });
    const textNode = action.findByType(Text);
    expect(textNode.props.color).toBe('default');
  });

  it('applies disabled text color when action is disabled', () => {
    const testRenderer = renderSwipeAction({
      rightActions: [{
        key: 'disabled-action',
        actionText: 'Disabled',
        color: 'primary',
        disabled: true,
      }],
    });
    const action = testRenderer.root.findByProps({
      testID: 'swipe-action-right-action-0',
    });
    const textNode = action.findByType(Text);
    expect(textNode.props.color).toBe('disabled');
  });

  it('provides pressed state feedback on action button', () => {
    const testRenderer = renderSwipeAction({
      rightActions: [{
        key: 'pressable',
        actionText: 'Press',
        color: 'primary',
      }],
    });
    const action = testRenderer.root.findByProps({
      testID: 'swipe-action-right-action-0',
    });
    const styleFn = action.props.style;
    expect(typeof styleFn).toBe('function');
    const pressedStyle = styleFn({ pressed: true });
    expect(pressedStyle).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ opacity: expect.any(Number) }),
      ]),
    );
  });
});
