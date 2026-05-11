import React from 'react';
import { Text as RNText, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@pennyspring/theme';
import { defaultSeedToken } from '@pennyspring/theme';
import { derivative } from '@pennyspring/theme/src/algorithms/derivative';
import { formatToken } from '@pennyspring/theme/src/algorithms/formatToken';
import { Toast, toast, ToastPortal } from '../src/Toast';
import { PortalProvider } from '../src/Portal';

jest.mock('react-native-reanimated', () => {
  const ReactNative = require('react-native');

  return {
    __esModule: true,
    default: {
      View: ReactNative.View,
    },
    runOnJS: (fn: () => void) => fn,
    useAnimatedStyle: (updater: () => Record<string, unknown>) => updater(),
    useSharedValue: (value: number) => ({ value }),
    withTiming: (
      value: number,
      _config?: unknown,
      callback?: () => void,
    ) => {
      if (callback) {
        setTimeout(callback, 0);
      }

      return value;
    },
  };
});

const token = formatToken(derivative(defaultSeedToken, false));

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

function renderToast(props: Record<string, unknown> = {}) {
  let testRenderer: renderer.ReactTestRenderer;

  act(() => {
    testRenderer = renderer.create(
      <ThemeProvider>
        <Toast contentText="Test message" {...props} />
      </ThemeProvider>,
    );
  });

  return testRenderer!;
}

describe('Toast', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  describe('declarative rendering', () => {
    it('renders with contentText when open', () => {
      const testRenderer = renderToast({ defaultOpen: true });
      const tree = JSON.stringify(testRenderer.toJSON());

      expect(tree).toContain('Test message');
    });

    it('renders nothing when closed', () => {
      const testRenderer = renderToast();

      expect(testRenderer.toJSON()).toBeNull();
    });

    it('renders custom ReactNode content', () => {
      const testRenderer = renderToast({
        defaultOpen: true,
        content: <RNText>Custom content</RNText>,
      });
      const tree = JSON.stringify(testRenderer.toJSON());

      expect(tree).toContain('Custom content');
    });
  });

  describe('auto-dismiss', () => {
    it('auto-dismisses after default duration of 2000ms', () => {
      const onCancel = jest.fn();
      const testRenderer = renderToast({
        defaultOpen: true,
        onCancel,
      });

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(onCancel).toHaveBeenCalled();
    });

    it('auto-dismisses after custom duration', () => {
      const onCancel = jest.fn();
      const testRenderer = renderToast({
        defaultOpen: true,
        duration: 3000,
        onCancel,
      });

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(onCancel).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(onCancel).toHaveBeenCalled();
    });

    it('does not auto-dismiss when duration is 0', () => {
      const onCancel = jest.fn();
      const testRenderer = renderToast({
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
    it('renders with info type styling', () => {
      const testRenderer = renderToast({
        defaultOpen: true,
        type: 'info',
      });

      expect(testRenderer.root.findByProps({ testID: 'toast-body' })).toBeTruthy();
    });

    it('renders with success type styling', () => {
      const testRenderer = renderToast({
        defaultOpen: true,
        type: 'success',
      });

      expect(testRenderer.root.findByProps({ testID: 'toast-body' })).toBeTruthy();
    });

    it('renders with fail type styling', () => {
      const testRenderer = renderToast({
        defaultOpen: true,
        type: 'fail',
      });

      expect(testRenderer.root.findByProps({ testID: 'toast-body' })).toBeTruthy();
    });
  });

  describe('position variants', () => {
    it('positions at the bottom by default', () => {
      const testRenderer = renderToast({ defaultOpen: true });
      const layout = flattenStyle(
        testRenderer.root.findByProps({ testID: 'toast-layout' }).props.style,
      );

      expect(layout.justifyContent).toBe('flex-end');
      expect(layout.alignItems).toBe('center');
    });

    it('positions at the top when specified', () => {
      const testRenderer = renderToast({
        defaultOpen: true,
        position: 'top',
      });
      const layout = flattenStyle(
        testRenderer.root.findByProps({ testID: 'toast-layout' }).props.style,
      );

      expect(layout.justifyContent).toBe('flex-start');
    });

    it('positions at center when specified', () => {
      const testRenderer = renderToast({
        defaultOpen: true,
        position: 'center',
      });
      const layout = flattenStyle(
        testRenderer.root.findByProps({ testID: 'toast-layout' }).props.style,
      );

      expect(layout.justifyContent).toBe('center');
    });
  });

  describe('size variants', () => {
    it('uses normal size by default', () => {
      const testRenderer = renderToast({ defaultOpen: true });
      const body = flattenStyle(
        testRenderer.root.findByProps({ testID: 'toast-body' }).props.style,
      );

      expect(body.padding).toBe(token.paddingMD);
    });

    it('applies small size styling', () => {
      const testRenderer = renderToast({
        defaultOpen: true,
        size: 'small',
      });
      const body = flattenStyle(
        testRenderer.root.findByProps({ testID: 'toast-body' }).props.style,
      );

      expect(body.padding).toBe(token.paddingSM);
    });

    it('applies large size styling', () => {
      const testRenderer = renderToast({
        defaultOpen: true,
        size: 'large',
      });
      const body = flattenStyle(
        testRenderer.root.findByProps({ testID: 'toast-body' }).props.style,
      );

      expect(body.padding).toBe(token.paddingLG);
    });
  });

  describe('controlled mode', () => {
    it('renders when controlled open is true', () => {
      const testRenderer = renderToast({ open: true });

      expect(JSON.stringify(testRenderer.toJSON())).toContain('Test message');
    });

    it('does not render when controlled open is false', () => {
      const testRenderer = renderToast({ open: false });

      expect(testRenderer.toJSON()).toBeNull();
    });

    it('does not emit onCancel when parent closes controlled toast externally', () => {
      const onCancel = jest.fn();
      let testRenderer: renderer.ReactTestRenderer;

      act(() => {
        testRenderer = renderer.create(
          <ThemeProvider>
            <Toast open contentText="Test" onCancel={onCancel} />
          </ThemeProvider>,
        );
      });

      act(() => {
        testRenderer!.update(
          <ThemeProvider>
            <Toast open={false} contentText="Test" onCancel={onCancel} />
          </ThemeProvider>,
        );
      });

      expect(onCancel).not.toHaveBeenCalled();
    });
  });

  describe('mask', () => {
    it('renders mask when mask prop is true', () => {
      const testRenderer = renderToast({
        defaultOpen: true,
        mask: true,
      });

      expect(
        testRenderer.root.findByProps({ testID: 'toast-mask' }),
      ).toBeTruthy();
    });

    it('does not render mask when mask prop is false', () => {
      const testRenderer = renderToast({
        defaultOpen: true,
        mask: false,
      });

      expect(() =>
        testRenderer.root.findByProps({ testID: 'toast-mask' }),
      ).toThrow();
    });
  });

  describe('icon', () => {
    it('renders custom icon when provided', () => {
      const testRenderer = renderToast({
        defaultOpen: true,
        icon: <RNText testID="custom-icon">★</RNText>,
      });

      expect(
        testRenderer.root.findByProps({ testID: 'custom-icon' }),
      ).toBeTruthy();
    });
  });

  describe('z-index', () => {
    it('uses toast z-index below popup and dialog', () => {
      const testRenderer = renderToast({ defaultOpen: true });
      const layout = flattenStyle(
        testRenderer.root.findByProps({ testID: 'toast-layout' }).props.style,
      );

      expect(layout.zIndex).toBe(
        token.zIndexPopupBase + token.zIndexBase + 100,
      );
    });
  });
});

describe('toast imperative API', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  function renderWithPortal() {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <ThemeProvider>
          <PortalProvider>
            <ToastPortal />
          </PortalProvider>
        </ThemeProvider>,
      );
    });

    return testRenderer!;
  }

  it('renders a toast with show method', () => {
    const testRenderer = renderWithPortal();

    act(() => {
      toast.show({ contentText: 'Imperative toast' });
    });

    const tree = JSON.stringify(testRenderer.toJSON());

    expect(tree).toContain('Imperative toast');
  });

  it('renders a success toast', () => {
    const testRenderer = renderWithPortal();

    act(() => {
      toast.success({ contentText: 'Success!' });
    });

    const tree = JSON.stringify(testRenderer.toJSON());

    expect(tree).toContain('Success!');
  });

  it('renders a fail toast', () => {
    const testRenderer = renderWithPortal();

    act(() => {
      toast.fail({ contentText: 'Failed!' });
    });

    const tree = JSON.stringify(testRenderer.toJSON());

    expect(tree).toContain('Failed!');
  });

  it('renders an info toast', () => {
    const testRenderer = renderWithPortal();

    act(() => {
      toast.info({ contentText: 'Info!' });
    });

    const tree = JSON.stringify(testRenderer.toJSON());

    expect(tree).toContain('Info!');
  });

  it('removes all toasts on clear', () => {
    const testRenderer = renderWithPortal();

    act(() => {
      toast.show({ contentText: 'Toast 1' });
      toast.show({ contentText: 'Toast 2' });
    });

    act(() => {
      toast.clear();
    });

    const tree = JSON.stringify(testRenderer.toJSON());

    expect(tree).not.toContain('Toast 1');
    expect(tree).not.toContain('Toast 2');
  });

  it('provides toast methods on the toast object', () => {
    expect(toast).toBeDefined();
    expect(typeof toast.show).toBe('function');
    expect(typeof toast.success).toBe('function');
    expect(typeof toast.fail).toBe('function');
    expect(typeof toast.info).toBe('function');
    expect(typeof toast.clear).toBe('function');
  });
});
