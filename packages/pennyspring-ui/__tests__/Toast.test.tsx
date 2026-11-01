import React from 'react';
import { View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import type { WithTimingConfig } from 'react-native-reanimated';
import { Toast } from '../src/Toast';
import { Icon } from '../src/Icon';
import { PortalProvider } from '../src/Portal';

function flattenStyle(style: unknown) {
  const flatten = (input: unknown): Record<string, unknown>[] => {
    if (input === null || input === undefined || input === false) {
      return [];
    }

    if (Array.isArray(input)) {
      return input.flatMap(flatten);
    }

    return [input as Record<string, unknown>];
  };

  return Object.assign({}, ...flatten(style));
}

function findToastContent(testRenderer: renderer.ReactTestRenderer) {
  return testRenderer.root.findAllByType(View).find(node => {
    const flattenedStyle = flattenStyle(node.props.style);

    return (
      flattenedStyle.position === 'absolute' &&
      flattenedStyle.backgroundColor !== undefined &&
      flattenedStyle.paddingHorizontal !== undefined
    );
  });
}

type WithTimingArgs = [number, WithTimingConfig?, (() => void)?];
const mockWithTiming = jest.fn(
  (value: number, _config?: WithTimingConfig, _callback?: () => void) => value,
);
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
    runOnJS: (fn: () => void) => fn,
    useAnimatedStyle: (updater: () => Record<string, unknown>) => updater(),
    useSharedValue: (value: number) => ({
      value,
    }),
    withTiming: (...args: WithTimingArgs) => {
      mockWithTiming(...args);
      return args[0];
    },
  };
});
function renderToast(props: Partial<React.ComponentProps<typeof Toast>> = {}) {
  let testRenderer!: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(
      <>
        <PortalProvider>
          <Toast open messageText="Toast message" {...props} />
        </PortalProvider>
      </>,
    );
  });
  return testRenderer!;
}
describe('Toast', () => {
  beforeEach(() => {
    mockWithTiming.mockClear();
  });
  it('animates in from hidden state when opened', () => {
    const testRenderer = renderToast();
    const toastText = testRenderer.root.findByProps({
      children: 'Toast message',
    });
    expect(mockWithTiming).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        duration: expect.any(Number),
      }),
      expect.any(Function),
    );
    expect(toastText).toBeTruthy();
  });
  it('animates out when closed', () => {
    let testRenderer!: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(
        <>
          <PortalProvider>
            <Toast open messageText="Toast message" />
          </PortalProvider>
        </>,
      );
    });
    act(() => {
      testRenderer.update(
        <>
          <PortalProvider>
            <Toast open={false} messageText="Toast message" />
          </PortalProvider>
        </>,
      );
    });
    expect(mockWithTiming).toHaveBeenCalledWith(
      0,
      expect.objectContaining({
        duration: expect.any(Number),
      }),
      expect.any(Function),
    );
    expect(
      testRenderer!.root.findByProps({
        children: 'Toast message',
      }),
    ).toBeTruthy();
  });
  it('lets the content define toast width instead of stretching to both sides', () => {
    const testRenderer = renderToast();
    const toastContent = findToastContent(testRenderer);
    const toastContentStyle = flattenStyle(toastContent?.props.style);

    expect(toastContentStyle.left).toBeUndefined();
    expect(toastContentStyle.right).toBeUndefined();
    expect(toastContentStyle.alignSelf).toBe('center');
  });
  it.each([
    ['small', 11, 34],
    ['normal', 13, 40],
    ['large', 17, 46],
  ] as const)(
    'maps %s size to capsule padding and min height',
    (size, expectedPadding, expectedMinHeight) => {
      let testRenderer!: renderer.ReactTestRenderer;
      act(() => {
        testRenderer = renderer.create(
          <ThemeProvider
            config={{
              token: {
                marginSM: 12,
                marginXS: 8,
                marginXXS: 4,
                paddingSM: 11,
                padding: 13,
                paddingMD: 17,
              },
            }}
          >
            <PortalProvider>
              <Toast open messageText="Toast message" size={size} />
            </PortalProvider>
          </ThemeProvider>,
        );
      });
      const toastContent = findToastContent(testRenderer);
      const toastContentStyle = flattenStyle(toastContent?.props.style);

      expect(toastContentStyle.paddingHorizontal).toBe(expectedPadding);
      expect(toastContentStyle.minHeight).toBe(expectedMinHeight);
      expect(toastContentStyle.borderRadius).toBe(999);
    },
  );

  it('caps the capsule width and keeps the message on one line', () => {
    const testRenderer = renderToast();
    const toastContentStyle = flattenStyle(
      findToastContent(testRenderer)?.props.style,
    );
    const textNode = testRenderer.root.findAllByProps({
      children: 'Toast message',
    })[0];

    expect(toastContentStyle.maxWidth).toBe(750 - 48);
    expect(textNode.props.numberOfLines).toBe(1);
  });

  it('renders a dot for default status and check / warning icons for success / error', () => {
    const successRenderer = renderToast({ status: 'success' });
    const errorRenderer = renderToast({ status: 'error' });
    const defaultRenderer = renderToast({ status: 'default' });
    const omittedRenderer = renderToast();

    expect(defaultRenderer.root.findAllByType(Icon)).toHaveLength(0);
    expect(omittedRenderer.root.findAllByType(Icon)).toHaveLength(0);
    expect(successRenderer.root.findByType(Icon).props.icon).toBe('check');
    expect(errorRenderer.root.findByType(Icon).props.icon).toBe('warning');
  });

  it('renders nothing when both message and messageText are empty', () => {
    const testRenderer = renderToast({ messageText: undefined });

    expect(findToastContent(testRenderer)).toBeUndefined();
  });
});
