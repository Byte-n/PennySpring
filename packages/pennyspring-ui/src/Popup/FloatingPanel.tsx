import type { ComponentSize } from '../shares/types';
import React, { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  Platform,
  Pressable,
  View,
  useWindowDimensions,
} from 'react-native';
import type {
  EmitterSubscription,
  KeyboardEvent,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import type { AliasToken } from '@pennyspring/theme';
import { useTheme } from '@pennyspring/theme';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Button } from '../Button';
import { Text } from '../Text';
import type { TextSize } from '../Text';
import { useControllableValue } from '../_hooks';
import { Popup as PopupRoot } from './Popup';
import type {
  PopupFloatingPanelHeight,
  PopupFloatingPanelPosition,
  PopupFloatingPanelProps,
  PopupFloatingPanelRenderFooterParams,
  PopupFloatingPanelRenderHeaderParams,
} from './types';

interface FloatingPanelStyleOptions {
  hasFooter: boolean;
  hasHeader: boolean;
  panelHeight: number;
  position: PopupFloatingPanelPosition;
  size: ComponentSize;
}

interface FloatingPanelSizeConfig {
  actionGap: (token: AliasToken) => number;
  contentPadding: (token: AliasToken) => number;
  handleHeight: (token: AliasToken) => number;
  handleWidth: (token: AliasToken) => number;
  indicatorHeight: (token: AliasToken) => number;
  sectionMargin: (token: AliasToken) => number;
  sectionPadding: (token: AliasToken) => number;
  titleTextSize: TextSize;
}

const DEFAULT_MIN_HEIGHT_RATIO = 0.35;
const DEFAULT_MAX_HEIGHT_RATIO = 0.8;
const DEFAULT_CANCEL_TEXT = '取消';
const DEFAULT_OK_TEXT = '确定';
const PERCENT_HEIGHT_UNIT = '%';
const PERCENT_HEIGHT_RATIO = 100;

const SIZE_MAP: Record<ComponentSize, FloatingPanelSizeConfig> = {
  small: {
    actionGap: token => token.sizeXS,
    contentPadding: token => token.paddingSM,
    handleHeight: token => token.controlHeightXS,
    handleWidth: token => token.controlHeightSM,
    indicatorHeight: token => token.lineWidthBold,
    sectionMargin: token => token.marginSM,
    sectionPadding: token => token.paddingXS,
    titleTextSize: 'md',
  },
  normal: {
    actionGap: token => token.sizeSM,
    contentPadding: token => token.paddingMD,
    handleHeight: token => token.controlHeightSM,
    handleWidth: token => token.controlHeight,
    indicatorHeight: token => token.sizeXXS,
    sectionMargin: token => token.marginMD,
    sectionPadding: token => token.paddingSM,
    titleTextSize: 'lg',
  },
  large: {
    actionGap: token => token.sizeMD,
    contentPadding: token => token.paddingLG,
    handleHeight: token => token.controlHeight,
    handleWidth: token => token.controlHeightLG,
    indicatorHeight: token => token.sizeXS,
    sectionMargin: token => token.marginLG,
    sectionPadding: token => token.paddingMD,
    titleTextSize: 'xl',
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
  height?: PopupFloatingPanelHeight,
  minHeight?: PopupFloatingPanelHeight,
  maxHeight?: PopupFloatingPanelHeight,
): readonly [number, number] {
  const resolvedHeight = resolveHeightValue(height, viewportHeight);
  const resolvedMinHeight = resolveHeightValue(minHeight, viewportHeight);
  const resolvedMaxHeight = resolveHeightValue(maxHeight, viewportHeight);
  const defaultMinHeight = viewportHeight * DEFAULT_MIN_HEIGHT_RATIO;
  const defaultMaxHeight = viewportHeight * DEFAULT_MAX_HEIGHT_RATIO;
  const rawMinHeight =
    resolvedMinHeight
      ?? (resolvedHeight === undefined
        ? defaultMinHeight
        : Math.min(resolvedHeight, defaultMinHeight));
  const rawMaxHeight =
    resolvedMaxHeight
      ?? (resolvedHeight === undefined
        ? defaultMaxHeight
        : Math.max(resolvedHeight, defaultMaxHeight));

  if (rawMinHeight <= rawMaxHeight) {
    return [rawMinHeight, rawMaxHeight];
  }

  return [rawMaxHeight, rawMinHeight];
}

function resolveHeightValue(
  value: PopupFloatingPanelHeight | undefined,
  viewportHeight: number,
): number | undefined {
  if (typeof value === 'number') {
    return value;
  }

  if (value?.endsWith(PERCENT_HEIGHT_UNIT) !== true) {
    return undefined;
  }

  const percentage = Number(value.slice(0, -PERCENT_HEIGHT_UNIT.length));

  if (!Number.isFinite(percentage)) {
    return undefined;
  }

  return viewportHeight * percentage / PERCENT_HEIGHT_RATIO;
}

const useStyles = createUseSheetStyle(
  (
    token,
    {
      hasFooter,
      hasHeader,
      panelHeight,
      position,
      size,
    }: FloatingPanelStyleOptions,
  ) => {
    const sizeConfig = SIZE_MAP[size];
    const actionGap = sizeConfig.actionGap(token);
    const contentPadding = sizeConfig.contentPadding(token);
    const handleBorderRadius = sizeConfig.indicatorHeight(token);
    const sectionMargin = sizeConfig.sectionMargin(token);
    const sectionPadding = sizeConfig.sectionPadding(token);
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
      },
      header: {
        borderBottomWidth: token.lineWidth,
        borderBottomColor: token.colorBorderSecondary,
        paddingHorizontal: contentPadding,
        paddingTop: contentPadding,
        paddingBottom: sectionPadding,
        marginBottom: sectionMargin,
      },
      titleText: {
        color: token.colorTextHeading,
        fontWeight: String(token.fontWeightStrong) as TextStyle['fontWeight'],
      },
      panelBody: {
        flex: 1,
        paddingHorizontal: contentPadding,
        paddingTop: hasHeader ? 0 : contentPadding,
        paddingBottom: hasFooter ? 0 : contentPadding,
      },
      footer: {
        borderTopWidth: token.lineWidth,
        borderTopColor: token.colorBorderSecondary,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: actionGap,
        paddingHorizontal: contentPadding,
        paddingTop: sectionPadding,
        paddingBottom: contentPadding,
        marginTop: sectionMargin,
      },
      footerButton: {
        flex: 1,
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

function createDragGesture(
  onBegin: () => void,
  onUpdate: (translationY: number) => void,
):
  | ReturnType<typeof Gesture.Pan>
  | undefined {
  const panGestureFactory = Gesture?.Pan;

  if (typeof panGestureFactory !== 'function') {
    return undefined;
  }

  return panGestureFactory()
    .runOnJS(true)
    .onBegin(onBegin)
    .onUpdate(event => {
      onUpdate(event.translationY);
    });
}

function getResponderTranslationY(
  gestureState?: {
    dy?: number;
    translationY?: number;
  },
): number {
  if (gestureState?.translationY !== undefined) {
    return gestureState.translationY;
  }

  return gestureState?.dy ?? 0;
}

function resolveKeyboardHeight(event: KeyboardEvent): number {
  const height = event.endCoordinates?.height ?? 0;

  return Math.max(height, 0);
}

function useKeyboardOffset(
  enabled: boolean,
  position: PopupFloatingPanelPosition,
): number {
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    if (!enabled || position !== 'bottom') {
      setKeyboardOffset(0);
      return;
    }

    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const subscriptions: EmitterSubscription[] = [
      Keyboard.addListener(showEvent, event => {
        setKeyboardOffset(resolveKeyboardHeight(event));
      }),
      Keyboard.addListener(hideEvent, () => {
        setKeyboardOffset(0);
      }),
    ];

    return () => {
      subscriptions.forEach(subscription => {
        subscription.remove();
      });
    };
  }, [enabled, position]);

  return keyboardOffset;
}

function renderTitle(
  title: PopupFloatingPanelProps['title'],
  titleText: PopupFloatingPanelProps['titleText'],
  titleTextSize: TextSize,
  titleTextStyle: StyleProp<TextStyle>,
): React.ReactNode {
  if (title !== undefined && title !== null) {
    return title;
  }

  if (titleText === undefined) {
    return null;
  }

  return (
    <Text
      size={titleTextSize}
      style={titleTextStyle}
      testID="floating-panel-title-text"
    >
      {titleText}
    </Text>
  );
}

function renderPanelHeader(
  props: Pick<
    PopupFloatingPanelProps,
    'header' | 'renderHeader' | 'title' | 'titleText'
  >,
  params: PopupFloatingPanelRenderHeaderParams,
  titleTextSize: TextSize,
  titleTextStyle: StyleProp<TextStyle>,
): React.ReactNode {
  if (props.renderHeader !== undefined) {
    return props.renderHeader(params);
  }

  if (props.header !== undefined && props.header !== null) {
    return props.header;
  }

  return renderTitle(
    props.title,
    props.titleText,
    titleTextSize,
    titleTextStyle,
  );
}

function shouldRenderDefaultFooter({
  cancel,
  cancelText,
  ok,
  okText,
  onCancel,
  onOk,
}: Pick<
  PopupFloatingPanelProps,
  'cancel' | 'cancelText' | 'ok' | 'okText' | 'onCancel' | 'onOk'
>): boolean {
  return (
    cancel !== undefined ||
    cancelText !== undefined ||
    ok !== undefined ||
    okText !== undefined ||
    onCancel !== undefined ||
    onOk !== undefined
  );
}

function renderDefaultFooter(
  props: Pick<
    PopupFloatingPanelProps,
    'cancel' | 'cancelText' | 'ok' | 'okDisabled' | 'okLoading' | 'okText'
  >,
  params: PopupFloatingPanelRenderFooterParams,
  styles: Pick<PopupFloatingPanelProps, 'styles'>['styles'],
  footerButtonStyle: StyleProp<ViewStyle>,
  defaultButtonSize: ComponentSize,
): React.ReactNode {
  return (
    <>
      <Button
        onPress={params.cancel}
        size={defaultButtonSize}
        style={[footerButtonStyle, styles?.cancelButton]}
        testID="floating-panel-cancel-button"
      >
        {props.cancel ?? props.cancelText ?? DEFAULT_CANCEL_TEXT}
      </Button>
      <Button
        disabled={props.okDisabled}
        loading={props.okLoading}
        onPress={params.confirm}
        size={defaultButtonSize}
        style={[footerButtonStyle, styles?.okButton]}
        testID="floating-panel-ok-button"
        type="primary"
      >
        {props.ok ?? props.okText ?? DEFAULT_OK_TEXT}
      </Button>
    </>
  );
}

function renderPanelFooter(
  props: Pick<
    PopupFloatingPanelProps,
    | 'cancel'
    | 'cancelText'
    | 'footer'
    | 'ok'
    | 'okDisabled'
    | 'okLoading'
    | 'okText'
    | 'onCancel'
    | 'onOk'
    | 'renderFooter'
    | 'styles'
  >,
  params: PopupFloatingPanelRenderFooterParams,
  footerButtonStyle: StyleProp<ViewStyle>,
  defaultButtonSize: ComponentSize,
): React.ReactNode {
  if (props.renderFooter !== undefined) {
    return props.renderFooter(params);
  }

  if (props.footer !== undefined && props.footer !== null) {
    return props.footer;
  }

  if (!shouldRenderDefaultFooter(props)) {
    return null;
  }

  return renderDefaultFooter(
    props,
    params,
    props.styles,
    footerButtonStyle,
    defaultButtonSize,
  );
}

export function FloatingPanel({
  afterOpenChange,
  animation,
  animationDuration,
  cancel,
  cancelText,
  children,
  closeOnMaskClick = true,
  closeOnCancel = true,
  closeOnOk = true,
  defaultOpen,
  defaultValue,
  footer,
  header,
  height,
  keyboardAvoiding = false,
  mask = true,
  maxHeight,
  minHeight,
  mountPoint = 'auto',
  onCancel,
  onChange,
  onOk,
  onOpenChange,
  ok,
  okDisabled = false,
  okLoading = false,
  okText,
  open,
  position,
  renderFooter,
  renderHeader,
  size,
  style,
  styles,
  title,
  titleText,
  value,
}: PopupFloatingPanelProps) {
  const { token } = useTheme();
  const { height: viewportHeight } = useWindowDimensions();
  const resolvedPosition = resolvePosition(position);
  const resolvedSize = resolveSize(size);
  const keyboardOffset = useKeyboardOffset(keyboardAvoiding, resolvedPosition);
  const keyboardOffsetProgress = useSharedValue(keyboardOffset);
  const resolvedHeight = resolveHeightValue(height, viewportHeight);
  const [resolvedMinHeight, resolvedMaxHeight] = resolveHeightRange(
    viewportHeight,
    height,
    minHeight,
    maxHeight,
  );

  const defaultPanelHeight = clamp(
    defaultValue ?? resolvedHeight ?? resolvedMinHeight,
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
  const [resolvedOpen, setResolvedOpen] = useControllableValue(
    defaultOpen === true,
    open,
    onOpenChange,
  );
  const isOpen = resolvedOpen === true;
  const normalizedPanelHeight = clamp(
    panelHeight ?? defaultPanelHeight,
    resolvedMinHeight,
    resolvedMaxHeight,
  );
  const willRenderHeader =
    renderHeader !== undefined ||
    (header !== undefined && header !== null) ||
    title !== undefined ||
    titleText !== undefined;
  const willRenderFooter =
    renderFooter !== undefined ||
    (footer !== undefined && footer !== null) ||
    shouldRenderDefaultFooter({
      cancel,
      cancelText,
      ok,
      okText,
      onCancel,
      onOk,
    });
  const tokenStyles = useStyles({
    hasFooter: willRenderFooter,
    hasHeader: willRenderHeader,
    panelHeight: normalizedPanelHeight,
    position: resolvedPosition,
    size: resolvedSize,
  });
  const keyboardAnimatedStyle = useAnimatedStyle(() => ({
    bottom: keyboardOffsetProgress.value,
  }));
  const popupLayoutStyle =
    keyboardAnimatedStyle as unknown as StyleProp<ViewStyle>;

  useEffect(() => {
    const easing = Easing?.bezier?.(...token.motionEaseOut);

    keyboardOffsetProgress.value = withTiming(keyboardOffset, {
      duration: token.motionDurationMid,
      ...(easing ? { easing } : null),
    });
  }, [
    keyboardOffset,
    keyboardOffsetProgress,
    token.motionDurationMid,
    token.motionEaseOut,
  ]);

  const dragStartHeightRef = useRef(normalizedPanelHeight);

  const direction = resolvedPosition === 'bottom' ? 1 : -1;

  function handleGestureBegin(): void {
    dragStartHeightRef.current = normalizedPanelHeight;
  }

  function handleGestureUpdate(translationY: number): void {
    const nextHeight = clamp(
      dragStartHeightRef.current - translationY * direction,
      resolvedMinHeight,
      resolvedMaxHeight,
    );

    setPanelHeight(nextHeight);
  }

  function handleResponderGrant(): void {
    handleGestureBegin();
  }

  function handleResponderMove(
    _event: unknown,
    gestureState?: {
      dy?: number;
      translationY?: number;
    },
  ): void {
    handleGestureUpdate(getResponderTranslationY(gestureState));
  }

  function handleResponderRelease(
    _event: unknown,
    gestureState?: {
      dy?: number;
      translationY?: number;
    },
  ): void {
    handleGestureUpdate(getResponderTranslationY(gestureState));
  }

  function closePanel(): void {
    setResolvedOpen(false);
  }

  function handleCancel(): void {
    onCancel?.();

    if (closeOnCancel) {
      closePanel();
    }
  }

  function handlePopupCancel(): void {
    onCancel?.();
  }

  async function handleConfirm(): Promise<void> {
    if (okDisabled || okLoading) {
      return;
    }

    const result = await onOk?.();

    if (result !== false && closeOnOk) {
      closePanel();
    }
  }

  const dragGesture = createDragGesture(
    handleGestureBegin,
    handleGestureUpdate,
  );

  const handleContent = (
    <Pressable
      onResponderGrant={handleResponderGrant}
      onResponderMove={handleResponderMove}
      onResponderRelease={handleResponderRelease}
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

  const handleNode = dragGesture ? (
    <GestureDetector gesture={dragGesture}>
      {handleContent}
    </GestureDetector>
  ) : (
    handleContent
  );

  const handleAtTop = resolvedPosition === 'bottom';
  const floatingPanelSizeConfig = SIZE_MAP[resolvedSize];
  const headerNode = renderPanelHeader(
    {
      header,
      renderHeader,
      title,
      titleText,
    },
    {
      cancel: handleCancel,
      confirm: handleConfirm,
    },
    floatingPanelSizeConfig.titleTextSize,
    [tokenStyles.titleText, styles?.titleText],
  );
  const footerNode = renderPanelFooter(
    {
      cancel,
      cancelText,
      footer,
      ok,
      okDisabled,
      okLoading,
      okText,
      onCancel,
      onOk,
      renderFooter,
      styles,
    },
    {
      cancel: handleCancel,
      confirm: handleConfirm,
      okDisabled,
      okLoading,
    },
    tokenStyles.footerButton,
    resolvedSize,
  );

  return (
    <PopupRoot
      afterOpenChange={afterOpenChange}
      animation={animation}
      animationDuration={animationDuration}
      closeOnMaskClick={closeOnMaskClick}
      mask={mask}
      mountPoint={mountPoint}
      onCancel={handlePopupCancel}
      onOpenChange={nextOpen => {
        setResolvedOpen(nextOpen);
      }}
      open={isOpen}
      position={resolvedPosition}
      style={popupLayoutStyle}
      styles={{
        body: [tokenStyles.popupBody, styles?.body],
        mask: styles?.mask,
      }}
    >
      <View style={[tokenStyles.root, style]} testID="floating-panel-root">
        {handleAtTop ? handleNode : null}
        <View style={[tokenStyles.content, styles?.content]}>
          {headerNode ? (
            <View style={[tokenStyles.header, styles?.header]} testID="floating-panel-header">
              {headerNode}
            </View>
          ) : null}
          <View style={[tokenStyles.panelBody, styles?.panelBody]} testID="floating-panel-body">
            {children}
          </View>
          {footerNode ? (
            <View style={[tokenStyles.footer, styles?.footer]} testID="floating-panel-footer">
              {footerNode}
            </View>
          ) : null}
        </View>
        {handleAtTop ? null : handleNode}
      </View>
    </PopupRoot>
  );
}
