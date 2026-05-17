import type { ComponentSize } from '../shares/types';
import React, { useRef } from 'react';
import {
  PanResponder,
  Pressable,
  View,
  useWindowDimensions,
} from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import type {
  AliasToken } from '@pennyspring/theme';
import { useControllableValue } from '../_hooks';
import { Popup as PopupRoot } from './Popup';
import type {
  PopupFloatingPanelPosition,
  PopupFloatingPanelProps,
} from './types';

interface FloatingPanelStyleOptions {
  panelHeight: number;
  position: PopupFloatingPanelPosition;
  size: ComponentSize;
}

interface FloatingPanelSizeConfig {
  contentPadding: (token: AliasToken) => number;
  handleHeight: (token: AliasToken) => number;
  handleWidth: (token: AliasToken) => number;
  indicatorHeight: (token: AliasToken) => number;
}

const DEFAULT_MIN_HEIGHT_RATIO = 0.35;
const DEFAULT_MAX_HEIGHT_RATIO = 0.8;

const SIZE_MAP: Record<ComponentSize, FloatingPanelSizeConfig> = {
  small: {
    contentPadding: token => token.paddingSM,
    handleHeight: token => token.controlHeightXS,
    handleWidth: token => token.controlHeightSM,
    indicatorHeight: token => token.lineWidthBold,
  },
  normal: {
    contentPadding: token => token.paddingMD,
    handleHeight: token => token.controlHeightSM,
    handleWidth: token => token.controlHeight,
    indicatorHeight: token => token.sizeXXS,
  },
  large: {
    contentPadding: token => token.paddingLG,
    handleHeight: token => token.controlHeight,
    handleWidth: token => token.controlHeightLG,
    indicatorHeight: token => token.sizeXS,
  },
};

function clamp(value: number, min: number, max: number): number {
  if (value < min) {
    return min;
  }

  if (value > max) {
    return max;
  }

  return value;
}

function resolvePosition(
  position?: PopupFloatingPanelPosition,
): PopupFloatingPanelPosition {
  if (position === 'top') {
    return 'top';
  }

  return 'bottom';
}

function resolveSize(size?: ComponentSize): ComponentSize {
  if (size === 'small' || size === 'large') {
    return size;
  }

  return 'normal';
}

function resolveHeightRange(
  viewportHeight: number,
  minHeight?: number,
  maxHeight?: number,
): readonly [number, number] {
  const rawMinHeight = minHeight ?? viewportHeight * DEFAULT_MIN_HEIGHT_RATIO;
  const rawMaxHeight = maxHeight ?? viewportHeight * DEFAULT_MAX_HEIGHT_RATIO;

  if (rawMinHeight <= rawMaxHeight) {
    return [rawMinHeight, rawMaxHeight];
  }

  return [rawMaxHeight, rawMinHeight];
}

const useStyles = createUseSheetStyle(
  (token, { panelHeight, position, size }: FloatingPanelStyleOptions) => {
    const sizeConfig = SIZE_MAP[size];
    const handleBorderRadius = sizeConfig.indicatorHeight(token);

    return {
      popupBody: {
        height: panelHeight,
        padding: 0,
      },
      root: {
        width: '100%',
        height: '100%',
      },
      content: {
        flex: 1,
        padding: sizeConfig.contentPadding(token),
      },
      handle: {
        minHeight: sizeConfig.handleHeight(token),
        alignItems: 'center',
        justifyContent: 'center',
        borderTopLeftRadius:
          position === 'top' ? 0 : token.borderRadiusLG,
        borderTopRightRadius:
          position === 'top' ? 0 : token.borderRadiusLG,
        borderBottomLeftRadius:
          position === 'top' ? token.borderRadiusLG : 0,
        borderBottomRightRadius:
          position === 'top' ? token.borderRadiusLG : 0,
      },
      handleIndicator: {
        width: sizeConfig.handleWidth(token),
        height: sizeConfig.indicatorHeight(token),
        borderRadius: handleBorderRadius,
        backgroundColor: token.colorFillSecondary,
      },
    };
  },
);

export function FloatingPanel({
  afterOpenChange,
  animation,
  animationDuration,
  children,
  closeOnMaskClick = true,
  defaultOpen,
  defaultValue,
  mask = true,
  maxHeight,
  minHeight,
  mountPoint = 'auto',
  onCancel,
  onChange,
  onOpenChange,
  open,
  position,
  size,
  style,
  styles,
  value,
}: PopupFloatingPanelProps) {
  const { height: viewportHeight } = useWindowDimensions();
  const resolvedPosition = resolvePosition(position);
  const resolvedSize = resolveSize(size);
  const [resolvedMinHeight, resolvedMaxHeight] = resolveHeightRange(
    viewportHeight,
    minHeight,
    maxHeight,
  );

  const defaultPanelHeight = clamp(
    defaultValue ?? resolvedMinHeight,
    resolvedMinHeight,
    resolvedMaxHeight,
  );
  const controlledPanelHeight =
    value === undefined
      ? undefined
      : clamp(value, resolvedMinHeight, resolvedMaxHeight);
  const [panelHeight, setPanelHeight] = useControllableValue(
    defaultPanelHeight,
    controlledPanelHeight,
    onChange,
  );
  const normalizedPanelHeight = clamp(
    panelHeight ?? defaultPanelHeight,
    resolvedMinHeight,
    resolvedMaxHeight,
  );

  const tokenStyles = useStyles({
    panelHeight: normalizedPanelHeight,
    position: resolvedPosition,
    size: resolvedSize,
  });

  const dragStartHeightRef = useRef(normalizedPanelHeight);
  const dragStartPageYRef = useRef(0);

  const direction = resolvedPosition === 'bottom' ? 1 : -1;

  function resolveDeltaY(
    event: { nativeEvent?: { pageY?: number } },
    gestureState?: { dy?: number },
  ): number {
    if (gestureState?.dy !== undefined) {
      return gestureState.dy;
    }

    if (event.nativeEvent?.pageY !== undefined) {
      return event.nativeEvent.pageY - dragStartPageYRef.current;
    }

    return 0;
  }

  function handleResponderGrant(
    event: { nativeEvent?: { pageY?: number } },
    _gestureState?: { dy?: number },
  ): void {
    dragStartHeightRef.current = normalizedPanelHeight;
    dragStartPageYRef.current = event.nativeEvent?.pageY ?? 0;
  }

  function handleResponderMove(
    event: { nativeEvent?: { pageY?: number } },
    gestureState?: { dy?: number },
  ): void {
    const deltaY = resolveDeltaY(event, gestureState);
    const nextHeight = clamp(
      dragStartHeightRef.current - deltaY * direction,
      resolvedMinHeight,
      resolvedMaxHeight,
    );

    setPanelHeight(nextHeight);
  }

  const dragPanResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponderCapture: () => true,
    onPanResponderGrant: handleResponderGrant,
    onPanResponderMove: handleResponderMove,
    onPanResponderRelease: handleResponderMove,
    onStartShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => true,
  });

  const handleNode = (
    <Pressable
      {...dragPanResponder.panHandlers}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={handleResponderGrant}
      onResponderMove={handleResponderMove}
      onResponderRelease={handleResponderMove}
      onStartShouldSetResponder={() => true}
      style={[tokenStyles.handle, styles?.handle]}
      testID="floating-panel-handle"
    >
      <View
        pointerEvents="none"
        style={[tokenStyles.handleIndicator, styles?.handleIndicator]}
        testID="floating-panel-handle-indicator"
      />
    </Pressable>
  );

  const handleAtTop = resolvedPosition === 'bottom';

  return (
    <PopupRoot
      afterOpenChange={afterOpenChange}
      animation={animation}
      animationDuration={animationDuration}
      closeOnMaskClick={closeOnMaskClick}
      defaultOpen={defaultOpen}
      mask={mask}
      mountPoint={mountPoint}
      onCancel={onCancel}
      onOpenChange={onOpenChange}
      open={open}
      position={resolvedPosition}
      styles={{
        body: [tokenStyles.popupBody, styles?.body],
        mask: styles?.mask,
      }}
    >
      <View style={[tokenStyles.root, style]} testID="floating-panel-root">
        {handleAtTop ? handleNode : null}
        <View style={[tokenStyles.content, styles?.content]}>{children}</View>
        {handleAtTop ? null : handleNode}
      </View>
    </PopupRoot>
  );
}
