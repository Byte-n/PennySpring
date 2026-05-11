import React from 'react';
import { Text as RNText } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { Message } from '../src/Message/Message';
import { message, MessagePortal } from '../src/Message';
import { PortalProvider } from '../src/Portal';

jest.useFakeTimers();

jest.mock('react-native-reanimated', () => {
  const ReactNative = require('react-native');

  return {
    __esModule: true,
    default: {
      View: ReactNative.View,
    },
    runOnJS: (fn: (...args: unknown[]) => void) => fn,
    useAnimatedStyle: (updater: () => Record<string, unknown>) => updater(),
    useSharedValue: (value: number) => ({ value }),
    withTiming: (
      value: number,
      _config?: unknown,
      callback?: (finished: boolean) => void,
    ) => {
      if (callback) {
        callback(true);
      }

      return value;
    },
  };
});

function renderMessage(
  props: Partial<React.ComponentProps<typeof Message>> = {},
) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <ThemeProvider>
        <PortalProvider>
          <Message contentText="Test message" duration={0} {...props} />
        </PortalProvider>
      </ThemeProvider>,
    );
  });

  return testRenderer!;
}

function findAllByTestID(
  root: renderer.ReactTestInstance,
  testID: string,
): renderer.ReactTestInstance[] {
  const results: renderer.ReactTestInstance[] = [];

  try {
    const found = root.findAll(
      (node) => node.props.testID === testID,
    );
    results.push(...found);
  } catch {
    // not found
  }

  return results;
}

describe('Message', () => {
  describe('declarative rendering', () => {
    it('renders with contentText when open', () => {
      const testRenderer = renderMessage({ defaultOpen: true });
      const treeString = JSON.stringify(testRenderer.toJSON());

      expect(treeString).toContain('Test message');
    });

    it('does not render when closed by default', () => {
      const testRenderer = renderMessage();
      const treeString = JSON.stringify(testRenderer.toJSON());

      expect(treeString).not.toContain('Test message');
    });

    it('renders custom content node', () => {
      const testRenderer = renderMessage({
        defaultOpen: true,
        content: <RNText>Custom content</RNText>,
        contentText: undefined,
      });
      const treeString = JSON.stringify(testRenderer.toJSON());

      expect(treeString).toContain('Custom content');
    });
  });

  describe('auto-dismiss', () => {
    it('auto-dismisses after duration', () => {
      const onCancel = jest.fn();
      const testRenderer = renderMessage({
        defaultOpen: true,
        duration: 3000,
        onCancel,
      });

      expect(JSON.stringify(testRenderer.toJSON())).toContain('Test message');

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('does not auto-dismiss when duration is 0', () => {
      const onCancel = jest.fn();
      const testRenderer = renderMessage({
        defaultOpen: true,
        duration: 0,
        onCancel,
      });

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      expect(onCancel).not.toHaveBeenCalled();
      expect(JSON.stringify(testRenderer.toJSON())).toContain('Test message');
    });
  });

  describe('type variants', () => {
    it.each(['info', 'success', 'warning', 'error'] as const)(
      'renders %s type message',
      (type) => {
        const testRenderer = renderMessage({
          defaultOpen: true,
          type,
        });
        const treeString = JSON.stringify(testRenderer.toJSON());

        expect(treeString).toContain('Test message');
      },
    );
  });

  describe('size variants', () => {
    it.each(['small', 'normal', 'large'] as const)(
      'renders %s size message',
      (size) => {
        const testRenderer = renderMessage({
          defaultOpen: true,
          size,
        });
        const treeString = JSON.stringify(testRenderer.toJSON());

        expect(treeString).toContain('Test message');
      },
    );
  });

  describe('closeable', () => {
    it('shows close button when closeable is true', () => {
      const testRenderer = renderMessage({
        defaultOpen: true,
        closeable: true,
      });
      const closeButtons = findAllByTestID(
        testRenderer.root,
        'message-close-button',
      );

      expect(closeButtons.length).toBeGreaterThan(0);
    });

    it('does not show close button when closeable is false', () => {
      const testRenderer = renderMessage({
        defaultOpen: true,
        closeable: false,
      });
      const closeButtons = findAllByTestID(
        testRenderer.root,
        'message-close-button',
      );

      expect(closeButtons.length).toBe(0);
    });

    it('calls onCancel when close button is pressed', () => {
      const onCancel = jest.fn();
      const testRenderer = renderMessage({
        defaultOpen: true,
        closeable: true,
        onCancel,
      });

      act(() => {
        testRenderer.root
          .findByProps({ testID: 'message-close-button' })
          .props.onPress();
      });

      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('controlled mode', () => {
    it('renders when open is true', () => {
      const testRenderer = renderMessage({ open: true });
      const treeString = JSON.stringify(testRenderer.toJSON());

      expect(treeString).toContain('Test message');
    });

    it('does not render when open is false', () => {
      const testRenderer = renderMessage({ open: false });
      const treeString = JSON.stringify(testRenderer.toJSON());

      expect(treeString).not.toContain('Test message');
    });

    it('calls onOpenChange when auto-dismissed', () => {
      const onOpenChange = jest.fn();
      renderMessage({
        open: true,
        duration: 1000,
        onOpenChange,
      });

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('onCancel', () => {
    it('is called when message auto-dismisses', () => {
      const onCancel = jest.fn();
      renderMessage({
        defaultOpen: true,
        duration: 2000,
        onCancel,
      });

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('is not called when parent closes controlled message externally', () => {
      const onCancel = jest.fn();
      let testRenderer: renderer.ReactTestRenderer;

      act(() => {
        testRenderer = renderer.create(
          <ThemeProvider>
            <PortalProvider>
              <Message
                open
                contentText="Test"
                duration={0}
                onCancel={onCancel}
              />
            </PortalProvider>
          </ThemeProvider>,
        );
      });

      act(() => {
        testRenderer!.update(
          <ThemeProvider>
            <PortalProvider>
              <Message
                open={false}
                contentText="Test"
                duration={0}
                onCancel={onCancel}
              />
            </PortalProvider>
          </ThemeProvider>,
        );
      });

      expect(onCancel).not.toHaveBeenCalled();
    });
  });

  describe('custom icon', () => {
    it('renders custom icon when provided', () => {
      const testRenderer = renderMessage({
        defaultOpen: true,
        icon: <RNText testID="custom-icon">X</RNText>,
      });

      const customIcons = findAllByTestID(
        testRenderer.root,
        'custom-icon',
      );

      expect(customIcons.length).toBeGreaterThan(0);
    });
  });
});

describe('message imperative API', () => {
  afterEach(() => {
    act(() => {
      message.clear();
    });
  });

  function renderWithPortal() {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <ThemeProvider>
          <PortalProvider>
            <MessagePortal />
          </PortalProvider>
        </ThemeProvider>,
      );
    });

    return testRenderer!;
  }

  it('shows a message with show()', () => {
    const testRenderer = renderWithPortal();

    act(() => {
      message.show({ contentText: 'Show message', duration: 0 });
    });

    const treeString = JSON.stringify(testRenderer.toJSON());
    expect(treeString).toContain('Show message');
  });

  it('shows a success message with success()', () => {
    const testRenderer = renderWithPortal();

    act(() => {
      message.success({ contentText: 'Success message', duration: 0 });
    });

    const treeString = JSON.stringify(testRenderer.toJSON());
    expect(treeString).toContain('Success message');
  });

  it('shows a warning message with warning()', () => {
    const testRenderer = renderWithPortal();

    act(() => {
      message.warning({ contentText: 'Warning message', duration: 0 });
    });

    const treeString = JSON.stringify(testRenderer.toJSON());
    expect(treeString).toContain('Warning message');
  });

  it('shows an error message with error()', () => {
    const testRenderer = renderWithPortal();

    act(() => {
      message.error({ contentText: 'Error message', duration: 0 });
    });

    const treeString = JSON.stringify(testRenderer.toJSON());
    expect(treeString).toContain('Error message');
  });

  it('shows an info message with info()', () => {
    const testRenderer = renderWithPortal();

    act(() => {
      message.info({ contentText: 'Info message', duration: 0 });
    });

    const treeString = JSON.stringify(testRenderer.toJSON());
    expect(treeString).toContain('Info message');
  });

  it('clears all messages with clear()', () => {
    const testRenderer = renderWithPortal();

    act(() => {
      message.show({ contentText: 'Message 1', duration: 0 });
      message.show({ contentText: 'Message 2', duration: 0 });
    });

    let treeString = JSON.stringify(testRenderer.toJSON());
    expect(treeString).toContain('Message 1');

    act(() => {
      message.clear();
    });

    treeString = JSON.stringify(testRenderer.toJSON());
    expect(treeString).not.toContain('Message 1');
    expect(treeString).not.toContain('Message 2');
  });

  it('auto-dismisses imperative message after duration', () => {
    const testRenderer = renderWithPortal();

    act(() => {
      message.show({ contentText: 'Timed message', duration: 2000 });
    });

    expect(JSON.stringify(testRenderer.toJSON())).toContain('Timed message');

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(JSON.stringify(testRenderer.toJSON())).not.toContain('Timed message');
  });

  it('calls onCancel when imperative message is dismissed', () => {
    const onCancel = jest.fn();
    renderWithPortal();

    act(() => {
      message.show({ contentText: 'Closing', duration: 1000, onCancel });
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
