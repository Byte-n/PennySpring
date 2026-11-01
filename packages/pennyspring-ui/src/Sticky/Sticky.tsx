import React, {
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useStickyLayoutStyles, useStickyPlaceholderStyles } from './style';
import type { StickyLayoutProps, StickyPlacement, StickyProps } from './types';

interface StickyLayoutRect {
  height: number;
  left: number;
  top: number;
  width: number;
}

interface StickyRegistration {
  children?: React.ReactNode;
  disabled: boolean;
  id: string;
  layout?: StickyLayoutRect;
  onMeasure?: (height: number) => void;
  offset: number;
  onChange?: (affixed: boolean) => void;
  placement: StickyPlacement;
}

interface StickyContextValue {
  layoutRef: React.RefObject<View | null>;
  register: (registration: StickyRegistration) => void;
  scrollOffset: ReturnType<typeof useSharedValue<number>>;
  updateRegistration: (
    id: string,
    registration: Partial<Omit<StickyRegistration, 'id' | 'layout'>>,
  ) => void;
  updateLayout: (id: string, layout: Partial<StickyLayoutRect>) => void;
  unregister: (id: string) => void;
  viewportHeight: number;
}

const StickyContext = createContext<StickyContextValue | null>(null);
const DEFAULT_OFFSET = 0;
const MIN_SIZE = 0;

function StickyOverlay({
  registration,
  updateLayout,
}: {
  registration: StickyRegistration;
  updateLayout: (id: string, layout: Partial<StickyLayoutRect>) => void;
}): React.JSX.Element {
  const context = useContext(StickyContext);
  const layout = registration.layout;
  const layoutHeight = layout?.height ?? MIN_SIZE;
  const layoutLeft = layout?.left ?? MIN_SIZE;
  const layoutTop = layout?.top ?? MIN_SIZE;
  const layoutWidth = layout?.width ?? MIN_SIZE;
  const scrollOffset = context?.scrollOffset;
  const viewportHeight = context?.viewportHeight ?? MIN_SIZE;
  const offset = registration.offset;
  const isBottom = registration.placement === 'bottom';
  const hasLayout = layout !== undefined && viewportHeight > MIN_SIZE;
  const resolvedScrollOffset = scrollOffset;
  const resolvedViewportHeight = viewportHeight;
  const animatedStyle = useAnimatedStyle(() => {
    if (!hasLayout || resolvedScrollOffset === undefined) {
      return { opacity: 0 };
    }

    const naturalTop = layoutTop - resolvedScrollOffset.value;
    const top = registration.disabled
      ? naturalTop
      : isBottom
        ? Math.min(naturalTop, resolvedViewportHeight - offset - layoutHeight)
        : Math.max(naturalTop, offset);

    return {
      left: layoutLeft,
      opacity: 1,
      position: 'absolute',
      top,
      width: layoutWidth,
    };
  });

  const handleLayout = (event: LayoutChangeEvent): void => {
    const { height } = event.nativeEvent.layout;
    if (height > MIN_SIZE) {
      registration.onMeasure?.(height);
      updateLayout(registration.id, { height });
    }
  };

  return (
    <Animated.View
      onLayout={handleLayout}
      pointerEvents="box-none"
      style={animatedStyle}
      testID="sticky-overlay"
    >
      {registration.children}
    </Animated.View>
  );
}

function StickyLayout({
  children,
  onLayout,
  style,
  styles,
  testID,
}: StickyLayoutProps): React.JSX.Element {
  const tokenStyles = useStickyLayoutStyles();
  const layoutRef = useRef<View>(null);
  const scrollOffset = useSharedValue(MIN_SIZE);
  const [viewportHeight, setViewportHeight] = useState(MIN_SIZE);
  const [registrations, setRegistrations] = useState<
    readonly StickyRegistration[]
  >([]);
  const affixedRef = useRef<ReadonlyMap<string, boolean>>(new Map());

  const register = useCallback((registration: StickyRegistration): void => {
    setRegistrations(current => [
      ...current.filter(item => item.id !== registration.id),
      registration,
    ]);
  }, []);

  const unregister = useCallback((id: string): void => {
    setRegistrations(current => current.filter(item => item.id !== id));
    const nextAffixed = new Map(affixedRef.current);
    nextAffixed.delete(id);
    affixedRef.current = nextAffixed;
  }, []);

  const updateRegistration = useCallback(
    (
      id: string,
      registration: Partial<Omit<StickyRegistration, 'id' | 'layout'>>,
    ): void => {
      setRegistrations(current =>
        current.map(item =>
          item.id === id ? { ...item, ...registration } : item,
        ),
      );
    },
    [],
  );

  const updateLayout = useCallback(
    (id: string, layout: Partial<StickyLayoutRect>): void => {
      setRegistrations(current =>
        current.map(item =>
          item.id !== id
            ? item
            : (() => {
                const nextLayout = {
                  ...item.layout,
                  ...layout,
                } as StickyLayoutRect;
                const currentLayout = item.layout;
                const isUnchanged =
                  currentLayout !== undefined &&
                  currentLayout.height === nextLayout.height &&
                  currentLayout.left === nextLayout.left &&
                  currentLayout.top === nextLayout.top &&
                  currentLayout.width === nextLayout.width;

                return isUnchanged ? item : { ...item, layout: nextLayout };
              })(),
        ),
      );
    },
    [],
  );

  const evaluateAffixed = useCallback(
    (nextScrollOffset: number): void => {
      const nextAffixed = new Map(affixedRef.current);
      registrations.forEach(registration => {
        const layout = registration.layout;
        if (layout === undefined || registration.disabled) {
          return;
        }

        const naturalTop = layout.top - nextScrollOffset;
        const isAffixed =
          registration.placement === 'top'
            ? naturalTop < registration.offset
            : naturalTop + layout.height > viewportHeight - registration.offset;
        const previous = nextAffixed.get(registration.id);
        if (previous === isAffixed || (previous === undefined && !isAffixed)) {
          return;
        }

        nextAffixed.set(registration.id, isAffixed);
        registration.onChange?.(isAffixed);
      });
      affixedRef.current = nextAffixed;
    },
    [registrations, viewportHeight],
  );

  const handleScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ): void => {
    const nextScrollOffset = event.nativeEvent.contentOffset.y;
    scrollOffset.value = nextScrollOffset;
    evaluateAffixed(nextScrollOffset);
  };

  const handleLayout = (event: LayoutChangeEvent): void => {
    setViewportHeight(event.nativeEvent.layout.height);
    onLayout?.(event);
  };

  const scrollChild = React.Children.only(children);
  if (!isValidElement(scrollChild)) {
    throw new Error('StickyLayout requires one scrollable React element.');
  }

  const childProps = scrollChild.props as {
    onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    scrollEventThrottle?: number;
  };
  const handleChildScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ): void => {
    handleScroll(event);
    childProps.onScroll?.(event);
  };

  const contextValue = useMemo(
    () => ({
      layoutRef,
      register,
      scrollOffset,
      updateRegistration,
      updateLayout,
      unregister,
      viewportHeight,
    }),
    [register, unregister, updateLayout, updateRegistration, viewportHeight],
  );

  return (
    <StickyContext.Provider value={contextValue}>
      <View
        onLayout={handleLayout}
        ref={layoutRef}
        style={[tokenStyles.root, style, styles?.root]}
        testID={testID ?? 'sticky-layout'}
      >
        {React.cloneElement(
          scrollChild as React.ReactElement<{
            onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
            scrollEventThrottle?: number;
          }>,
          {
            onScroll: handleChildScroll,
            scrollEventThrottle: childProps.scrollEventThrottle ?? 16,
          },
        )}
        <View
          pointerEvents="box-none"
          style={[tokenStyles.overlay, styles?.overlay]}
        >
          {registrations.map(registration => (
            <StickyOverlay
              key={registration.id}
              registration={registration}
              updateLayout={updateLayout}
            />
          ))}
        </View>
      </View>
    </StickyContext.Provider>
  );
}

export function Sticky({
  children,
  disabled = false,
  offset = DEFAULT_OFFSET,
  onChange,
  placement = 'top',
  style,
  styles,
  testID,
}: StickyProps): React.JSX.Element {
  const context = useContext(StickyContext);
  const placeholderRef = useRef<View>(null);
  const [height, setHeight] = useState(MIN_SIZE);
  const id = useId();
  const placeholderStyles = useStickyPlaceholderStyles({ height });
  const handleMeasuredHeight = useCallback((nextHeight: number): void => {
    setHeight(nextHeight);
  }, []);
  const register = context?.register;
  const unregister = context?.unregister;
  const updateRegistration = context?.updateRegistration;

  useLayoutEffect(() => {
    if (register === undefined || unregister === undefined) {
      return;
    }

    register({
      children,
      disabled,
      id,
      offset,
      onChange,
      onMeasure: handleMeasuredHeight,
      placement,
    });

    return () => unregister(id);
  }, [handleMeasuredHeight, id, register, unregister]);

  useLayoutEffect(() => {
    updateRegistration?.(id, {
      children,
      disabled,
      offset,
      onChange,
      onMeasure: handleMeasuredHeight,
      placement,
    });
  }, [
    children,
    disabled,
    handleMeasuredHeight,
    id,
    offset,
    onChange,
    placement,
    updateRegistration,
  ]);

  const handleLayout = (event: LayoutChangeEvent): void => {
    if (context === null) {
      return;
    }

    const fallbackLayout = event.nativeEvent.layout;
    const layoutRef = context.layoutRef.current;
    const placeholder = placeholderRef.current;
    const updateLayout = (layout: StickyLayoutRect): void => {
      setHeight(layout.height);
      context.updateLayout(id, layout);
    };

    if (
      layoutRef !== null &&
      placeholder !== null &&
      placeholder.measureInWindow
    ) {
      let didMeasure = false;
      placeholder.measureInWindow((x, y, width, measuredHeight) => {
        layoutRef.measureInWindow((_layoutX, layoutY) => {
          didMeasure = true;
          updateLayout({
            height: Math.max(measuredHeight, height),
            left: x - _layoutX,
            top: y - layoutY + context.scrollOffset.value,
            width,
          });
        });
      });

      if (didMeasure) {
        return;
      }
    }

    updateLayout({
      height: Math.max(fallbackLayout.height, height),
      left: fallbackLayout.x,
      top: fallbackLayout.y,
      width: fallbackLayout.width,
    });
  };

  if (context === null) {
    return <>{children}</>;
  }

  return (
    <View
      onLayout={handleLayout}
      pointerEvents="none"
      ref={placeholderRef}
      style={[placeholderStyles.root, style, styles?.root]}
      testID={testID ?? 'sticky-placeholder'}
    >
      {children}
    </View>
  );
}

export { StickyLayout };
