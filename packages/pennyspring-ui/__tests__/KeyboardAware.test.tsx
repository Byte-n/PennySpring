import React from 'react';
import {
  Dimensions,
  type EmitterSubscription,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text as RNText,
  View,
} from 'react-native';
import renderer, { act } from 'react-test-renderer';
import {
  KeyboardAwareFormScroll,
  KeyboardAwareScreen,
  KeyboardStickyFooter,
  useKeyboardInsets,
} from '../src/KeyboardAware';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({
    top: 0,
    right: 0,
    bottom: 24,
    left: 0,
  }),
}));

type KeyboardHandler = (event: {
  endCoordinates?: {
    height?: number;
    screenY?: number;
  };
}) => void;

const ORIGINAL_PLATFORM_OS = Platform.OS;

interface InsetsProbeProps {
  onRead: (value: ReturnType<typeof useKeyboardInsets>) => void;
}

function InsetsProbe({ onRead }: InsetsProbeProps): React.JSX.Element {
  const insets = useKeyboardInsets();

  onRead(insets);

  return <RNText>probe</RNText>;
}

function createKeyboardSubscription(): EmitterSubscription {
  return {
    remove: jest.fn(),
  } as unknown as EmitterSubscription;
}

function mockPlatformOS(os: typeof Platform.OS): void {
  Object.defineProperty(Platform, 'OS', {
    configurable: true,
    value: os,
  });
}

describe('KeyboardAware', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    mockPlatformOS(ORIGINAL_PLATFORM_OS);
  });

  it('exposes keyboard insets and updates them from keyboard events', () => {
    const handlers: KeyboardHandler[] = [];
    jest.spyOn(Keyboard, 'addListener').mockImplementation((_, handler) => {
      handlers.push(handler as KeyboardHandler);

      return createKeyboardSubscription();
    });

    const onRead = jest.fn();

    act(() => {
      renderer.create(<InsetsProbe onRead={onRead} />);
    });

    expect(onRead).toHaveBeenLastCalledWith(
      expect.objectContaining({
        bottomInset: 24,
        isKeyboardVisible: false,
        keyboardHeight: 0,
        safeAreaBottom: 24,
      }),
    );

    act(() => {
      handlers[0]({ endCoordinates: { height: 280, screenY: 560 } });
    });

    expect(onRead).toHaveBeenLastCalledWith(
      expect.objectContaining({
        bottomInset: 280,
        isKeyboardVisible: true,
        keyboardHeight: 280,
        keyboardScreenY: 560,
        safeAreaBottom: 24,
      }),
    );
  });

  it('renders a page-level keyboard aware container', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <KeyboardAwareScreen testID="screen">
          <RNText>content</RNText>
        </KeyboardAwareScreen>,
      );
    });

    const screen = testRenderer!.root.findByType(View);
    const flattenedStyle = StyleSheet.flatten(screen.props.style);

    expect(flattenedStyle.flex).toBe(1);
    expect(flattenedStyle.paddingBottom).toBe(0);
  });

  it('reserves bottom space when the Android keyboard covers the viewport', () => {
    mockPlatformOS('android');
    jest.spyOn(Dimensions, 'get').mockImplementation(dimension => {
      if (dimension === 'window') {
        return {
          width: 360,
          height: 640,
          scale: 1,
          fontScale: 1,
        };
      }

      return {
        width: 360,
        height: 640,
        scale: 1,
        fontScale: 1,
      };
    });

    const handlers: KeyboardHandler[] = [];
    jest.spyOn(Keyboard, 'addListener').mockImplementation((_, handler) => {
      handlers.push(handler as KeyboardHandler);

      return createKeyboardSubscription();
    });

    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <KeyboardAwareScreen testID="screen">
          <RNText>content</RNText>
        </KeyboardAwareScreen>,
      );
    });

    act(() => {
      handlers[0]({ endCoordinates: { height: 280, screenY: 360 } });
    });

    const screen = testRenderer!.root.findByType(View);
    const flattenedStyle = StyleSheet.flatten(screen.props.style);

    expect(flattenedStyle.paddingBottom).toBe(280);
  });

  it('keeps form scroll taps available for input workflows', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <KeyboardAwareFormScroll testID="form-scroll">
          <RNText>field</RNText>
        </KeyboardAwareFormScroll>,
      );
    });

    const scroll = testRenderer!.root.findByType(ScrollView);
    const contentStyle = StyleSheet.flatten(scroll.props.contentContainerStyle);

    expect(scroll.props.keyboardShouldPersistTaps).toBe('handled');
    expect(scroll.props.keyboardDismissMode).toBe('interactive');
    expect(contentStyle.flexGrow).toBe(1);
  });

  it('does not duplicate keyboard inset when form scroll is inside a keyboard aware screen', () => {
    mockPlatformOS('android');
    jest.spyOn(Dimensions, 'get').mockImplementation(dimension => {
      if (dimension === 'window') {
        return {
          width: 360,
          height: 640,
          scale: 1,
          fontScale: 1,
        };
      }

      return {
        width: 360,
        height: 640,
        scale: 1,
        fontScale: 1,
      };
    });

    const handlers: KeyboardHandler[] = [];
    jest.spyOn(Keyboard, 'addListener').mockImplementation((_, handler) => {
      handlers.push(handler as KeyboardHandler);

      return createKeyboardSubscription();
    });

    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <KeyboardAwareScreen>
          <KeyboardAwareFormScroll testID="form-scroll">
            <RNText>field</RNText>
          </KeyboardAwareFormScroll>
        </KeyboardAwareScreen>,
      );
    });

    act(() => {
      handlers[0]({ endCoordinates: { height: 280, screenY: 360 } });
      handlers[2]({ endCoordinates: { height: 280, screenY: 360 } });
    });

    const scroll = testRenderer!.root.findByType(ScrollView);
    const contentStyle = StyleSheet.flatten(scroll.props.contentContainerStyle);

    expect(contentStyle.paddingBottom).toBeLessThan(280);
  });

  it('uses keyboard inset to reserve space for sticky footer content', () => {
    const handlers: KeyboardHandler[] = [];
    jest.spyOn(Keyboard, 'addListener').mockImplementation((_, handler) => {
      handlers.push(handler as KeyboardHandler);

      return createKeyboardSubscription();
    });

    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <KeyboardStickyFooter testID="footer">
          <RNText>submit</RNText>
        </KeyboardStickyFooter>,
      );
    });

    act(() => {
      handlers[0]({ endCoordinates: { height: 280 } });
    });

    const footer = testRenderer!.root.findByType(View);
    const flattenedStyle = StyleSheet.flatten(footer.props.style);

    expect(flattenedStyle.paddingBottom).toBe(280);
  });
});
