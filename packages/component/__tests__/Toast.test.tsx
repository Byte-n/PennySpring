import React from 'react';
import renderer, { act } from 'react-test-renderer';
import type { WithTimingConfig } from 'react-native-reanimated';
import { ThemeProvider } from '@pennyspring/theme';
import { Toast, useToast } from '../src/Toast';
import { PortalProvider } from '../src/Portal';

type WithTimingArgs = [number, WithTimingConfig?, (() => void)?];
const mockWithTiming = jest.fn((value: number, _config?: WithTimingConfig, _callback?: () => void) => value);

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
    useSharedValue: (value: number) => ({ value }),
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
      <ThemeProvider>
        <PortalProvider>
          <Toast open messageText="Toast message" {...props} />
        </PortalProvider>
      </ThemeProvider>,
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
      expect.objectContaining({ duration: expect.any(Number) }),
      expect.any(Function),
    );
    expect(toastText).toBeTruthy();
  });

  it('animates out when closed', () => {
    let testRenderer!: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <ThemeProvider>
          <PortalProvider>
            <Toast open messageText="Toast message" />
          </PortalProvider>
        </ThemeProvider>,
      );
    });

    act(() => {
      testRenderer.update(
        <ThemeProvider>
          <PortalProvider>
            <Toast open={false} messageText="Toast message" />
          </PortalProvider>
        </ThemeProvider>,
      );
    });

    expect(mockWithTiming).toHaveBeenCalledWith(
      0,
      expect.objectContaining({ duration: expect.any(Number) }),
      expect.any(Function),
    );
    expect(
      testRenderer!.root.findByProps({
        children: 'Toast message',
      }),
    ).toBeTruthy();
  });

    });
