import React from 'react';
import { StyleSheet, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { Notification, useNotification } from '../src/Notification';
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
describe('Notification', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockWithTiming.mockClear();
    exitAnimationCallbacks.length = 0;
  });
  afterEach(() => {
    jest.useRealTimers();
  });
  it('scales description text with size', () => {
    let testRenderer!: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(<><PortalProvider>
        <Notification
          open
          duration={0}
          size="large"
          titleText="Title"
          descriptionText="Description"
        />
      </PortalProvider></>);
    });

    const description = testRenderer.root.findByProps({
      children: 'Description',
    });

    expect(description.props.size).toBe('lg');
  });

  it.each([
    ['small', 11, 3],
    ['normal', 13, 5],
    ['large', 17, 7],
  ] as const)('maps %s size to container padding and layout gap tokens', (size, expectedPadding, expectedGap) => {
    let testRenderer!: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <ThemeProvider
          config={{
            token: {
              marginXXS: 3,
              marginXS: 5,
              marginSM: 7,
              paddingSM: 11,
              padding: 13,
              paddingMD: 17,
            },
          }}
        >
          <PortalProvider>
            <Notification
              open
              duration={0}
              size={size}
              titleText="Title"
              descriptionText="Description"
            />
          </PortalProvider>
        </ThemeProvider>,
      );
    });

    const content = testRenderer.root.findAllByType(View).find(node => {
      const style = StyleSheet.flatten(node.props.style);

      return style?.position === 'absolute' && style?.paddingHorizontal !== undefined;
    });
    const contentStyle = StyleSheet.flatten(content?.props.style);

    expect(contentStyle.paddingHorizontal).toBe(expectedPadding);
    expect(contentStyle.paddingVertical).toBe(expectedPadding / 2);
    expect(contentStyle.gap).toBe(expectedGap);
  });

  it('fires onCancel and onOpenChange(false) when duration expires in controlled mode', () => {
    const onCancel = jest.fn();
    const onOpenChange = jest.fn();
    const afterOpenChange = jest.fn();
    let testRenderer!: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <PortalProvider>
          <Notification
            open
            duration={1000}
            titleText="Title"
            descriptionText="Description"
            onCancel={onCancel}
            onOpenChange={onOpenChange}
            afterOpenChange={afterOpenChange}
          />
        </PortalProvider>,
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

    act(() => {
      testRenderer.update(
        <PortalProvider>
          <Notification
            open={false}
            duration={1000}
            titleText="Title"
            descriptionText="Description"
            onCancel={onCancel}
            onOpenChange={onOpenChange}
            afterOpenChange={afterOpenChange}
          />
        </PortalProvider>,
      );
    });

    act(() => {
      exitAnimationCallbacks.at(-1)?.(true);
    });

    expect(afterOpenChange).toHaveBeenCalledTimes(1);
    expect(afterOpenChange).toHaveBeenCalledWith(false);

    act(() => {
      testRenderer.unmount();
    });
  });

  it('derives backgroundColor from type token rather than inline literal', () => {
    let testRenderer!: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <ThemeProvider
          config={{
            token: {
              colorSuccessBg: '#00ff00',
            },
          }}
        >
          <PortalProvider>
            <Notification
              open
              duration={0}
              type="success"
              titleText="Title"
              descriptionText="Description"
            />
          </PortalProvider>
        </ThemeProvider>,
      );
    });

    const content = testRenderer.root.findAllByType(View).find(node => {
      const style = StyleSheet.flatten(node.props.style);

      return style?.position === 'absolute' && style?.paddingHorizontal !== undefined;
    });
    const contentStyle = StyleSheet.flatten(content?.props.style);

    expect(contentStyle.backgroundColor).toBe('#00ff00');

    act(() => {
      testRenderer.unmount();
    });
  });

});

describe('useNotification', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockWithTiming.mockClear();
    exitAnimationCallbacks.length = 0;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('show mounts a notification and hide(key) triggers exit and unmount', () => {
    let controller!: ReturnType<typeof useNotification>;

    function Host() {
      controller = useNotification();

      return null;
    }

    let testRenderer!: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <PortalProvider>
          <Host />
        </PortalProvider>,
      );
    });

    let key!: number;

    act(() => {
      key = controller.show({
        titleText: 'Host title',
        descriptionText: 'Host description',
        duration: 0,
      });
    });

    expect(testRenderer.root.findByProps({ children: 'Host description' })).toBeTruthy();

    act(() => {
      controller.hide(key);
    });

    expect(testRenderer.root.findByProps({ children: 'Host description' })).toBeTruthy();

    act(() => {
      exitAnimationCallbacks.at(-1)?.(true);
    });

    expect(() => testRenderer.root.findByProps({ children: 'Host description' })).toThrow();

    act(() => {
      testRenderer.unmount();
    });
  });

  it('clear removes all mounted notifications', () => {
    let controller!: ReturnType<typeof useNotification>;

    function Host() {
      controller = useNotification();

      return null;
    }

    let testRenderer!: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <PortalProvider>
          <Host />
        </PortalProvider>,
      );
    });

    act(() => {
      controller.show({
        titleText: 'First',
        descriptionText: 'First desc',
        duration: 0,
      });
      controller.show({
        titleText: 'Second',
        descriptionText: 'Second desc',
        duration: 0,
      });
    });

    expect(testRenderer.root.findByProps({ children: 'First desc' })).toBeTruthy();
    expect(testRenderer.root.findByProps({ children: 'Second desc' })).toBeTruthy();

    act(() => {
      controller.clear();
    });

    act(() => {
      exitAnimationCallbacks.forEach(cb => cb(true));
    });

    expect(() => testRenderer.root.findByProps({ children: 'First desc' })).toThrow();
    expect(() => testRenderer.root.findByProps({ children: 'Second desc' })).toThrow();

    act(() => {
      testRenderer.unmount();
    });
  });
});
