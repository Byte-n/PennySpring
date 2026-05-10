import React, {
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Pressable,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  type GestureStateChangeEvent,
  type GestureUpdateEvent,
  type PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import Animated, {
  Easing,
  type SharedValue,
  createAnimatedComponent,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { PortalContext } from '../Portal/Portal';
import { resolvePortalMount } from '../Portal/resolvePortalMount';
import { useStyles } from './style';
import type {
  DrawerLayoutProps,
  DrawerPosition,
  DrawerProps,
  DrawerType,
  DrawerWidth,
} from './types';

const DEFAULT_DRAWER_POSITION: DrawerPosition = 'left';
const DEFAULT_DRAWER_TYPE: DrawerType = 'front';
const FULLY_CLOSED_PROGRESS = 0;
const FULLY_OPEN_PROGRESS = 1;
const DEFAULT_DRAWER_WIDTH = '70%';
const SWIPE_DISTANCE_RATIO = 0.5;
const SWIPE_VELOCITY_THRESHOLD = 400;
const HORIZONTAL_SWIPE_THRESHOLD = 8;
const VERTICAL_SWIPE_CANCEL_RATIO = 1.2;
const DRAWER_ANIMATION_DURATION = 500;
const AnimatedPressable = createAnimatedComponent(Pressable);
const PERCENT_WIDTH_PATTERN = /^-?\d+(?:\.\d+)?%$/;

interface DrawerOpenStateProps {
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}

interface DrawerComponentProps extends DrawerProps {
  drawerType?: DrawerType;
  forceBackOverlay?: boolean;
  externalProgress?: SharedValue<number>;
}

type DrawerPanGestureEvent = Pick<
  PanGestureHandlerEventPayload,
  'translationX' | 'velocityX'
>;

function getProgressFromGesture(
  isOpen: boolean,
  position: DrawerPosition,
  drawerWidth: number,
  translationX: number,
): number {
  if (drawerWidth <= 0) {
    return isOpen ? FULLY_OPEN_PROGRESS : FULLY_CLOSED_PROGRESS;
  }

  const direction = position === 'left' ? 1 : -1;
  const nextProgress =
    (isOpen ? FULLY_OPEN_PROGRESS : FULLY_CLOSED_PROGRESS) +
    (translationX * direction) / drawerWidth;

  return Math.max(
    FULLY_CLOSED_PROGRESS,
    Math.min(FULLY_OPEN_PROGRESS, nextProgress),
  );
}

function shouldOpenFromGesture(
  currentOpen: boolean,
  position: DrawerPosition,
  drawerWidth: number,
  gestureEvent: DrawerPanGestureEvent,
): boolean {
  const direction = position === 'left' ? 1 : -1;
  const distance = gestureEvent.translationX * direction;
  const velocity = gestureEvent.velocityX * direction;

  if (velocity > SWIPE_VELOCITY_THRESHOLD) {
    return true;
  }

  if (velocity < -SWIPE_VELOCITY_THRESHOLD) {
    return false;
  }

  if (currentOpen) {
    return distance > -(drawerWidth * SWIPE_DISTANCE_RATIO);
  }

  return distance > drawerWidth * SWIPE_DISTANCE_RATIO;
}

function useDrawerOpenState({
  defaultOpen,
  onOpenChange,
  open,
}: DrawerOpenStateProps) {
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen === true);
  const isOpen = isControlled ? (open as boolean) : internalOpen;

  const setOpen = useCallback(
    (nextOpen: boolean): void => {
      if (!isControlled) {
        setInternalOpen(nextOpen);
      }

      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange],
  );

  return [isOpen, setOpen] as const;
}

function resolveDrawerWidthPx(
  width: DrawerWidth,
  referenceWidth: number,
): number {
  if (typeof width === 'number') {
    return Math.max(0, width);
  }

  if (!PERCENT_WIDTH_PATTERN.test(width) || referenceWidth <= 0) {
    return 0;
  }

  const percentValue = Number.parseFloat(width.slice(0, -1));
  if (!Number.isFinite(percentValue)) {
    return 0;
  }

  return Math.max(0, (percentValue / 100) * referenceWidth);
}

function DrawerComponent({
  children,
  defaultOpen,
  drawerPosition = DEFAULT_DRAWER_POSITION,
  drawerType = DEFAULT_DRAWER_TYPE,
  forceBackOverlay = false,
  externalProgress,
  onClose,
  mountPoint = 'auto',
  onOpen,
  onOpenChange,
  open,
  styles: slotStyles,
  swipeEnabled = true,
  width = DEFAULT_DRAWER_WIDTH,
}: DrawerComponentProps) {
  const tokenStyles = useStyles({ position: drawerPosition, width });
  const { width: windowWidth } = useWindowDimensions();
  const portalContext = useContext(PortalContext);
  const [isOpen, setOpen] = useDrawerOpenState({
    defaultOpen,
    onOpenChange,
    open,
  });
  const internalProgress = useSharedValue(
    isOpen ? FULLY_OPEN_PROGRESS : FULLY_CLOSED_PROGRESS,
  );
  const progress = externalProgress ?? internalProgress;
  const drawerWidth = resolveDrawerWidthPx(width, windowWidth);

  const setProgressForOpenState = useCallback(
    (nextOpen: boolean): void => {
      progress.value = withTiming(
        nextOpen ? FULLY_OPEN_PROGRESS : FULLY_CLOSED_PROGRESS,
        {
          duration: DRAWER_ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
        },
      );
    },
    [progress],
  );

  useEffect(() => {
    setProgressForOpenState(isOpen);
  }, [isOpen, setProgressForOpenState]);

  const requestOpenChange = useCallback(
    (nextOpen: boolean): void => {
      setProgressForOpenState(nextOpen);

      if (nextOpen === isOpen) {
        return;
      }

      if (nextOpen) {
        onOpen?.();
      } else {
        onClose?.();
      }

      setOpen(nextOpen);
    },
    [isOpen, onClose, onOpen, setOpen, setProgressForOpenState],
  );

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(swipeEnabled)
        .runOnJS(true)
        .minDistance(HORIZONTAL_SWIPE_THRESHOLD)
        .activeOffsetX([
          -HORIZONTAL_SWIPE_THRESHOLD,
          HORIZONTAL_SWIPE_THRESHOLD,
        ])
        .failOffsetY([
          -HORIZONTAL_SWIPE_THRESHOLD * VERTICAL_SWIPE_CANCEL_RATIO,
          HORIZONTAL_SWIPE_THRESHOLD * VERTICAL_SWIPE_CANCEL_RATIO,
        ])
        .onUpdate(
          (event: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
            progress.value = getProgressFromGesture(
              isOpen,
              drawerPosition,
              drawerWidth,
              event.translationX,
            );
          },
        )
        .onEnd(
          (event: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
            requestOpenChange(
              shouldOpenFromGesture(isOpen, drawerPosition, drawerWidth, {
                translationX: event.translationX,
                velocityX: event.velocityX,
              }),
            );
          },
        )
        .onFinalize((_event, success) => {
          if (!success) {
            progress.value = isOpen
              ? FULLY_OPEN_PROGRESS
              : FULLY_CLOSED_PROGRESS;
          }
        }),
    [
      drawerPosition,
      drawerWidth,
      isOpen,
      progress,
      requestOpenChange,
      swipeEnabled,
    ],
  );

  const handleOverlayPress = (): void => {
    requestOpenChange(false);
  };

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [FULLY_CLOSED_PROGRESS, FULLY_OPEN_PROGRESS],
      [0, 1],
    ),
  }));
  const drawerAnimatedStyle = useAnimatedStyle(() => {
    if (drawerType === 'back' && forceBackOverlay) {
      return {};
    }

    const closedOffset = drawerPosition === 'left' ? -drawerWidth : drawerWidth;

    return {
      transform: [
        {
          translateX: interpolate(
            progress.value,
            [FULLY_CLOSED_PROGRESS, FULLY_OPEN_PROGRESS],
            [closedOffset, 0],
          ),
        },
      ],
    };
  });
  const overlayLayerStyle = forceBackOverlay ? tokenStyles.backOverlay : null;
  const drawerLayerStyle = forceBackOverlay ? tokenStyles.backDrawer : null;
  const maskLayerStyle = forceBackOverlay ? tokenStyles.backMask : null;

  const drawerContent = (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        pointerEvents={isOpen ? 'auto' : 'none'}
        style={[tokenStyles.overlay, overlayLayerStyle]}
        testID="drawer-overlay-container"
      >
        <AnimatedPressable
          onPress={handleOverlayPress}
          style={[
            tokenStyles.mask,
            maskLayerStyle,
            slotStyles?.overlay,
            overlayAnimatedStyle,
          ]}
          testID="drawer-overlay"
        />
        <Animated.View
          style={[
            tokenStyles.drawer,
            drawerLayerStyle,
            slotStyles?.drawer,
            drawerAnimatedStyle,
          ]}
          testID="drawer-panel"
        >
          {children}
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );

  return resolvePortalMount(drawerContent, mountPoint, portalContext !== null);
}

function DrawerLayout({
  children,
  defaultOpen,
  drawerPosition = DEFAULT_DRAWER_POSITION,
  drawerType = DEFAULT_DRAWER_TYPE,
  onClose,
  onOpen,
  onOpenChange,
  open,
  renderDrawerContent,
  styles,
  swipeEnabled,
  width = DEFAULT_DRAWER_WIDTH,
}: DrawerLayoutProps) {
  const tokenStyles = useStyles({ position: drawerPosition, width });
  const [isOpen, setOpen] = useDrawerOpenState({
    defaultOpen,
    onOpenChange,
    open,
  });
  const progress = useSharedValue(
    isOpen ? FULLY_OPEN_PROGRESS : FULLY_CLOSED_PROGRESS,
  );
  const [contentWidth, setContentWidth] = useState(0);
  const drawerWidth = resolveDrawerWidthPx(width, contentWidth);
  const direction = drawerPosition === 'left' ? 1 : -1;
  const shouldMoveScene = drawerType === 'slide' || drawerType === 'back';
  const shouldForceBackOverlay = drawerType === 'back';

  const sceneAnimatedStyle = useAnimatedStyle(() => {
    if (!shouldMoveScene) {
      return {};
    }

    return {
      transform: [
        {
          translateX: interpolate(
            progress.value,
            [FULLY_CLOSED_PROGRESS, FULLY_OPEN_PROGRESS],
            [0, drawerWidth * direction],
          ),
        },
      ],
    };
  });
  const sceneMaskAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [FULLY_CLOSED_PROGRESS, FULLY_OPEN_PROGRESS],
      [0, 1],
    ),
  }));

  const sceneLayerStyle =
    drawerType === 'back' ? tokenStyles.backScene : tokenStyles.frontScene;
  const handleBackMaskPress = useCallback((): void => {
    if (!isOpen) {
      return;
    }

    onClose?.();
    setOpen(false);
  }, [isOpen, onClose, setOpen]);
  const handleContainerLayout = useCallback(
    (event: LayoutChangeEvent): void => {
      const nextWidth = event.nativeEvent.layout.width;
      setContentWidth((prevWidth) => {
        if (prevWidth === nextWidth) {
          return prevWidth;
        }

        return nextWidth;
      });
    },
    [],
  );

  return (
    <View
      onLayout={handleContainerLayout}
      style={[tokenStyles.container, styles?.container]}
    >
      <Animated.View
        testID="drawer-layout-scene"
        style={[tokenStyles.scene, sceneLayerStyle, styles?.content, sceneAnimatedStyle]}
      >
        {children}
        {drawerType === 'back' ? (
          <AnimatedPressable
            onPress={handleBackMaskPress}
            style={[tokenStyles.sceneMask, styles?.overlay, sceneMaskAnimatedStyle]}
          />
        ) : null}
      </Animated.View>
      <DrawerComponent
        defaultOpen={defaultOpen}
        drawerPosition={drawerPosition}
        drawerType={drawerType}
        externalProgress={progress}
        forceBackOverlay={shouldForceBackOverlay}
        mountPoint="local"
        onClose={onClose}
        onOpen={onOpen}
        onOpenChange={setOpen}
        open={isOpen}
        styles={{
          drawer: styles?.drawer,
          overlay: styles?.overlay,
        }}
        swipeEnabled={swipeEnabled}
        width={width}
      >
        {renderDrawerContent()}
      </DrawerComponent>
    </View>
  );
}

export const Drawer = Object.assign(DrawerComponent, {
  Layout: DrawerLayout,
});
