import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { Notification } from '../src/Notification';
import { PortalProvider } from '../src/Portal';

const exitAnimationCallbacks: Array<(finished: boolean) => void> = [];
type WithTimingArgs = [number, unknown?, ((finished: boolean) => void)?];
const mockWithTiming = jest.fn((value: number, _config?: unknown, callback?: (finished: boolean) => void) => {
  if (value === 0 && callback) {
    exitAnimationCallbacks.push(callback);
  }

  return value;
});

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

function renderNotification(props: Partial<React.ComponentProps<typeof Notification>> = {}) {
  let testRenderer!: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
        <ThemeProvider>
        <PortalProvider>
          <Notification open duration={0} titleText="Title" descriptionText="Description" {...props} />
        </PortalProvider>
      </ThemeProvider>,
    );
  });

  return testRenderer!;
}

describe('Notification', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockWithTiming.mockClear();
    exitAnimationCallbacks.length = 0;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('keeps the body mounted while closing and unmounts after exit completes', () => {
    let testRenderer!: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <ThemeProvider>
          <PortalProvider>
            <Notification open duration={0} titleText="Title" descriptionText="Description" />
          </PortalProvider>
        </ThemeProvider>,
      );
    });

    const closeAnimationCallCount = mockWithTiming.mock.calls.filter(([value]) => value === 0).length;

    act(() => {
      testRenderer.update(
        <ThemeProvider>
          <PortalProvider>
            <Notification open={false} duration={0} titleText="Title" descriptionText="Description" />
          </PortalProvider>
        </ThemeProvider>,
      );
    });

    const nextCloseAnimationCallCount = mockWithTiming.mock.calls.filter(([value]) => value === 0).length;

    expect(nextCloseAnimationCallCount).toBeGreaterThan(closeAnimationCallCount);
    expect(
      testRenderer!.root.findByProps({
        children: 'Description',
      }),
    ).toBeTruthy();

    act(() => {
      exitAnimationCallbacks.at(-1)?.(true);
    });

    expect(() =>
      testRenderer!.root.findByProps({
        children: 'Description',
      }),
    ).toThrow();

    act(() => {
      testRenderer!.unmount();
    });
  });

    it('does not fire cancel or open-change callbacks for controlled external close and defers afterOpenChange(false) until exit completes', () => {
    const onCancel = jest.fn();
    const onOpenChange = jest.fn();
    const afterOpenChange = jest.fn();
    let testRenderer!: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <ThemeProvider>
          <PortalProvider>
            <Notification
              open
              duration={0}
              titleText="Title"
              descriptionText="Description"
              onCancel={onCancel}
              onOpenChange={onOpenChange}
              afterOpenChange={afterOpenChange}
            />
          </PortalProvider>
        </ThemeProvider>,
      );
    });

    onCancel.mockClear();
    onOpenChange.mockClear();
    afterOpenChange.mockClear();

    act(() => {
      testRenderer.update(
        <ThemeProvider>
          <PortalProvider>
            <Notification
              open={false}
              duration={0}
              titleText="Title"
              descriptionText="Description"
              onCancel={onCancel}
              onOpenChange={onOpenChange}
              afterOpenChange={afterOpenChange}
            />
          </PortalProvider>
        </ThemeProvider>,
      );
    });

    expect(onCancel).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(afterOpenChange).not.toHaveBeenCalled();
    expect(
      testRenderer!.root.findByProps({
        children: 'Description',
      }),
    ).toBeTruthy();

    act(() => {
      exitAnimationCallbacks.at(-1)?.(true);
    });

    expect(onCancel).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(afterOpenChange).toHaveBeenCalledTimes(1);
    expect(afterOpenChange).toHaveBeenCalledWith(false);

    expect(() =>
      testRenderer!.root.findByProps({
        children: 'Description',
      }),
    ).toThrow();

    act(() => {
      testRenderer!.unmount();
    });
  });

  it('fires cancel and open-change immediately for uncontrolled internal close and defers afterOpenChange(false) until exit completes', () => {
    const onCancel = jest.fn();
    const onOpenChange = jest.fn();
    const afterOpenChange = jest.fn();
    let testRenderer!: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <ThemeProvider>
          <PortalProvider>
            <Notification
              defaultOpen
              duration={1000}
              titleText="Title"
              descriptionText="Description"
              onCancel={onCancel}
              onOpenChange={onOpenChange}
              afterOpenChange={afterOpenChange}
            />
          </PortalProvider>
        </ThemeProvider>,
      );
    });

    onCancel.mockClear();
    onOpenChange.mockClear();
    afterOpenChange.mockClear();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(afterOpenChange).not.toHaveBeenCalled();
    expect(
      testRenderer.root.findByProps({
        children: 'Description',
      }),
    ).toBeTruthy();

    act(() => {
      exitAnimationCallbacks.at(-1)?.(true);
    });

    expect(afterOpenChange).toHaveBeenCalledTimes(1);
    expect(afterOpenChange).toHaveBeenCalledWith(false);
    expect(() =>
      testRenderer.root.findByProps({
        children: 'Description',
      }),
    ).toThrow();
  });
});
