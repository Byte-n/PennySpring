import React from 'react';
import {
  Dimensions,
  type EmitterSubscription,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text as RNText,
  TextInput,
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
        bottomInset: 0,
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
        bottomInset: 256,
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

    expect(flattenedStyle.paddingBottom).toBe(256);
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
    expect(scroll.props.scrollEnabled).toBe(false);
    expect(contentStyle.flexGrow).toBe(1);
  });

  it('enables form scrolling when explicitly requested', () => {
    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <KeyboardAwareFormScroll scrollEnabled testID="form-scroll">
          <RNText>field</RNText>
        </KeyboardAwareFormScroll>,
      );
    });

    expect(testRenderer!.root.findByType(ScrollView).props.scrollEnabled).toBe(
      true,
    );
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

    expect(flattenedStyle.paddingBottom).toBe(256);
  });

  it('scrolls focused input into view without native animation', () => {
    const scrollToSpy = jest.spyOn(ScrollView.prototype, 'scrollTo');

    const handlers: KeyboardHandler[] = [];
    jest.spyOn(Keyboard, 'addListener').mockImplementation((_, handler) => {
      handlers.push(handler as KeyboardHandler);

      return createKeyboardSubscription();
    });

    const nativeScrollRef = {
      measureInWindow: jest.fn(
        (callback: (x: number, y: number, w: number, h: number) => void) => {
          callback(0, 0, 360, 640);
        },
      ),
    };
    const mockInputRef = {
      measureLayout: jest.fn(
        (
          _relativeTo: unknown,
          callback: (x: number, y: number, w: number, h: number) => void,
        ) => {
          callback(0, 800, 300, 50);
        },
      ),
    };
    jest
      .spyOn(TextInput.State, 'currentlyFocusedInput')
      .mockReturnValue(
        mockInputRef as unknown as ReturnType<
          typeof TextInput.State.currentlyFocusedInput
        >,
      );
    jest
      .spyOn(ScrollView.prototype, 'getNativeScrollRef')
      .mockReturnValue(
        nativeScrollRef as unknown as ReturnType<
          typeof ScrollView.prototype.getNativeScrollRef
        >,
      );

    let testRenderer: renderer.ReactTestRenderer;

    act(() => {
      testRenderer = renderer.create(
        <KeyboardAwareFormScroll testID="form-scroll">
          <RNText>field</RNText>
        </KeyboardAwareFormScroll>,
      );
    });

    act(() => {
      handlers[0]({ endCoordinates: { height: 280, screenY: 360 } });
    });

    // Trigger onLayout to fire the deferred layoutCallback
    act(() => {
      const scrollView = testRenderer!.root.findByType(ScrollView);
      scrollView.props.onLayout({
        nativeEvent: { layout: { x: 0, y: 0, width: 360, height: 640 } },
      });
    });

    expect(scrollToSpy).toHaveBeenCalled();
    const lastCall = scrollToSpy.mock.calls[scrollToSpy.mock.calls.length - 1];

    expect(lastCall![0]).toEqual(expect.objectContaining({ animated: false }));

    scrollToSpy.mockRestore();
  });
});
