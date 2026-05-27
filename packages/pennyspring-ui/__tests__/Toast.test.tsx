import React from 'react';
import { View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import type { WithTimingConfig } from 'react-native-reanimated';
import { Toast } from '../src/Toast';
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

    return flattenedStyle.position === 'absolute'
      && flattenedStyle.backgroundColor !== undefined
      && flattenedStyle.paddingHorizontal !== undefined;
  });
}

type WithTimingArgs = [number, WithTimingConfig?, (() => void)?];
const mockWithTiming = jest.fn((value: number, _config?: WithTimingConfig, _callback?: () => void) => value);
jest.mock('react-native-reanimated', () => {
  const ReactNative = require('react-native');
  return {
    __esModule: true,
    default: {
      View: ReactNative.View
    },
    Easing: {
      bezier: (...args: unknown[]) => args
    },
    runOnJS: (fn: () => void) => fn,
    useAnimatedStyle: (updater: () => Record<string, unknown>) => updater(),
    useSharedValue: (value: number) => ({
      value
    }),
    withTiming: (...args: WithTimingArgs) => {
      mockWithTiming(...args);
      return args[0];
    }
  };
});
function renderToast(props: Partial<React.ComponentProps<typeof Toast>> = {}) {
  let testRenderer!: renderer.ReactTestRenderer;
  act(() => {
    testRenderer = renderer.create(<><PortalProvider>
          <Toast open messageText="Toast message" {...props} />
        </PortalProvider></>);
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
      children: 'Toast message'
    });
    expect(mockWithTiming).toHaveBeenCalledWith(1, expect.objectContaining({
      duration: expect.any(Number)
    }), expect.any(Function));
    expect(toastText).toBeTruthy();
  });
  it('animates out when closed', () => {
    let testRenderer!: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(<><PortalProvider>
            <Toast open messageText="Toast message" />
          </PortalProvider></>);
    });
    act(() => {
      testRenderer.update(<><PortalProvider>
            <Toast open={false} messageText="Toast message" />
          </PortalProvider></>);
    });
    expect(mockWithTiming).toHaveBeenCalledWith(0, expect.objectContaining({
      duration: expect.any(Number)
    }), expect.any(Function));
    expect(testRenderer!.root.findByProps({
      children: 'Toast message'
    })).toBeTruthy();
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
    ['small', 11],
    ['normal', 13],
    ['large', 17],
  ] as const)('maps %s size to container padding token', (size, expectedPadding) => {
    let testRenderer!: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(
        <ThemeProvider
          config={{
            token: {
              paddingSM: 11,
              padding: 13,
              paddingMD: 17,
            },
          }}
        >
          <PortalProvider>
            <Toast
              open
              messageText="Toast message"
              size={size}
            />
          </PortalProvider>
        </ThemeProvider>,
      );
    });
    const toastContent = findToastContent(testRenderer);
    const toastContentStyle = flattenStyle(toastContent?.props.style);

    expect(toastContentStyle.paddingHorizontal).toBe(expectedPadding);
    expect(toastContentStyle.paddingVertical).toBe(expectedPadding);
  });
});
