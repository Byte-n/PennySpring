import React from 'react';
import { StyleSheet, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { Message, useMessage } from '../src/Message';
import { PortalProvider } from '../src/Portal';
import type { MessageController } from '../src/Message';
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
describe('Message', () => {
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
      testRenderer = renderer.create(<><PortalProvider>
            <Message open duration={0} messageText="Message text" />
          </PortalProvider></>);
    });
    const closeAnimationCallCount = mockWithTiming.mock.calls.filter(([value]) => value === 0).length;
    act(() => {
      testRenderer.update(<><PortalProvider>
            <Message open={false} duration={0} messageText="Message text" />
          </PortalProvider></>);
    });
    const nextCloseAnimationCallCount = mockWithTiming.mock.calls.filter(([value]) => value === 0).length;
    expect(nextCloseAnimationCallCount).toBeGreaterThan(closeAnimationCallCount);
    expect(testRenderer!.root.findByProps({
      children: 'Message text'
    })).toBeTruthy();
    act(() => {
      exitAnimationCallbacks.at(-1)?.(true);
    });
    expect(() => testRenderer!.root.findByProps({
      children: 'Message text'
    })).toThrow();
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
      testRenderer = renderer.create(<><PortalProvider>
            <Message open duration={0} messageText="Message text" onCancel={onCancel} onOpenChange={onOpenChange} afterOpenChange={afterOpenChange} />
          </PortalProvider></>);
    });
    onCancel.mockClear();
    onOpenChange.mockClear();
    afterOpenChange.mockClear();
    act(() => {
      testRenderer.update(<><PortalProvider>
            <Message open={false} duration={0} messageText="Message text" onCancel={onCancel} onOpenChange={onOpenChange} afterOpenChange={afterOpenChange} />
          </PortalProvider></>);
    });
    expect(onCancel).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(afterOpenChange).not.toHaveBeenCalled();
    expect(testRenderer!.root.findByProps({
      children: 'Message text'
    })).toBeTruthy();
    act(() => {
      exitAnimationCallbacks.at(-1)?.(true);
    });
    expect(onCancel).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(afterOpenChange).toHaveBeenCalledTimes(1);
    expect(afterOpenChange).toHaveBeenCalledWith(false);
    expect(() => testRenderer!.root.findByProps({
      children: 'Message text'
    })).toThrow();
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
      testRenderer = renderer.create(<><PortalProvider>
            <Message defaultOpen duration={1000} messageText="Message text" onCancel={onCancel} onOpenChange={onOpenChange} afterOpenChange={afterOpenChange} />
          </PortalProvider></>);
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
    expect(testRenderer.root.findByProps({
      children: 'Message text'
    })).toBeTruthy();
    act(() => {
      exitAnimationCallbacks.at(-1)?.(true);
    });
    expect(afterOpenChange).toHaveBeenCalledTimes(1);
    expect(afterOpenChange).toHaveBeenCalledWith(false);
    expect(() => testRenderer.root.findByProps({
      children: 'Message text'
    })).toThrow();
  });

  it('scales status dot with size', () => {
    let smallRenderer!: renderer.ReactTestRenderer;
    let largeRenderer!: renderer.ReactTestRenderer;

    act(() => {
      smallRenderer = renderer.create(
        <><PortalProvider>
          <Message open duration={0} messageText="Small" size="small" />
        </PortalProvider></>,
      );
      largeRenderer = renderer.create(
        <><PortalProvider>
          <Message open duration={0} messageText="Large" size="large" />
        </PortalProvider></>,
      );
    });

    const findDotStyle = (testRenderer: renderer.ReactTestRenderer) => {
      const dot = testRenderer.root.findAllByType(View).find(node => {
        const style = StyleSheet.flatten(node.props.style);

        return typeof style?.width === 'number' &&
          typeof style?.height === 'number' &&
          style.width === style.height &&
          style.backgroundColor !== undefined;
      });

      return StyleSheet.flatten(dot?.props.style);
    };

    const smallDotStyle = findDotStyle(smallRenderer);
    const largeDotStyle = findDotStyle(largeRenderer);

    expect(largeDotStyle.width).toBeGreaterThan(smallDotStyle.width);
  });
});

function MessageControllerHost({ controllerRef }: { controllerRef: React.MutableRefObject<MessageController | null> }) {
  const controller = useMessage();
  React.useEffect(() => {
    controllerRef.current = controller;
    return () => {
      controllerRef.current = null;
    };
  }, [controller, controllerRef]);

  return null;
}

describe('useMessage', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockWithTiming.mockClear();
    exitAnimationCallbacks.length = 0;
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('show renders a message with the given messageText', () => {
    const controllerRef = React.createRef<MessageController | null>() as React.MutableRefObject<MessageController | null>;
    let testRenderer!: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <PortalProvider>
          <MessageControllerHost controllerRef={controllerRef} />
        </PortalProvider>,
      );
    });

    act(() => {
      controllerRef.current!.show({ messageText: 'Hello from controller' });
    });

    expect(testRenderer.root.findByProps({ children: 'Hello from controller' })).toBeTruthy();
  });

  it('hide triggers exit animation and unmounts the message', () => {
    const controllerRef = React.createRef<MessageController | null>() as React.MutableRefObject<MessageController | null>;
    let testRenderer!: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <PortalProvider>
          <MessageControllerHost controllerRef={controllerRef} />
        </PortalProvider>,
      );
    });

    let key!: number;
    act(() => {
      key = controllerRef.current!.show({ messageText: 'To be hidden', duration: 0 });
    });

    expect(testRenderer.root.findByProps({ children: 'To be hidden' })).toBeTruthy();

    act(() => {
      controllerRef.current!.hide(key);
    });

    // Body still mounted during exit animation
    expect(testRenderer.root.findByProps({ children: 'To be hidden' })).toBeTruthy();

    act(() => {
      exitAnimationCallbacks.at(-1)?.(true);
    });

    expect(() => testRenderer.root.findByProps({ children: 'To be hidden' })).toThrow();
  });

  it('clear removes all shown messages', () => {
    const controllerRef = React.createRef<MessageController | null>() as React.MutableRefObject<MessageController | null>;
    let testRenderer!: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <PortalProvider>
          <MessageControllerHost controllerRef={controllerRef} />
        </PortalProvider>,
      );
    });

    act(() => {
      controllerRef.current!.show({ messageText: 'Message A', duration: 0 });
      controllerRef.current!.show({ messageText: 'Message B', duration: 0 });
    });

    expect(testRenderer.root.findAllByProps({ children: 'Message A' }).length).toBeGreaterThan(0);
    expect(testRenderer.root.findAllByProps({ children: 'Message B' }).length).toBeGreaterThan(0);

    act(() => {
      controllerRef.current!.clear();
    });

    // Both messages still mounted during exit animation
    expect(testRenderer.root.findAllByProps({ children: 'Message A' }).length).toBeGreaterThan(0);
    expect(testRenderer.root.findAllByProps({ children: 'Message B' }).length).toBeGreaterThan(0);

    // Fire all pending exit callbacks
    act(() => {
      exitAnimationCallbacks.forEach(cb => cb(true));
    });

    expect(() => testRenderer.root.findByProps({ children: 'Message A' })).toThrow();
    expect(() => testRenderer.root.findByProps({ children: 'Message B' })).toThrow();
  });

  it('auto-exits after duration expires', () => {
    const controllerRef = React.createRef<MessageController | null>() as React.MutableRefObject<MessageController | null>;
    let testRenderer!: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <PortalProvider>
          <MessageControllerHost controllerRef={controllerRef} />
        </PortalProvider>,
      );
    });

    act(() => {
      controllerRef.current!.show({ messageText: 'Auto close', duration: 1000 });
    });

    expect(testRenderer.root.findByProps({ children: 'Auto close' })).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Body still mounted during exit animation
    expect(testRenderer.root.findByProps({ children: 'Auto close' })).toBeTruthy();

    act(() => {
      exitAnimationCallbacks.at(-1)?.(true);
    });

    expect(() => testRenderer.root.findByProps({ children: 'Auto close' })).toThrow();
  });

  it('throws an error when show is called without PortalProvider', () => {
    const controllerRef = React.createRef<MessageController | null>() as React.MutableRefObject<MessageController | null>;
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    let testRenderer!: renderer.ReactTestRenderer;
    act(() => {
      testRenderer = renderer.create(
        <MessageControllerHost controllerRef={controllerRef} />,
      );
    });

    expect(() => {
      act(() => {
        controllerRef.current!.show({ messageText: 'No portal' });
      });
    }).toThrow('Overlay emitter requires a PortalProvider.');

    consoleSpy.mockRestore();
    act(() => {
      testRenderer.unmount();
    });
  });
});
