import type { ComponentSize } from '../shares/types';
import React, { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
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
import { useTheme } from '@pennyspring/theme';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Button } from '../Button';
import { Column } from '../Column';
import { Icon } from '../Icon';
import { Row } from '../Row';
import { Text } from '../Text';
import type { TextSize } from '../Text';
import { renderTextNode } from '../shares/node';
import { useControllableValue } from '../_hooks';
import { getFloatingPanelSizeConfig } from './floatingPanelSize';
import { Popup as PopupRoot } from './Popup';
import type {
  PopupFloatingPanelHeight,
  PopupFloatingPanelPosition,
  PopupFloatingPanelProps,
  PopupFloatingPanelRenderFooterParams,
  PopupFloatingPanelRenderHeaderParams,
} from './types';

const CLOSE_BUTTON_HIT_SLOP = 4;

interface FloatingPanelStyleOptions {
  hasFooter: boolean;
  hasHeader: boolean;
  panelHeight: number;
  position: PopupFloatingPanelPosition;
  size: ComponentSize;
}

const DEFAULT_HEIGHT = '60%';
const DEFAULT_MIN_HEIGHT_RATIO = 0.35;
const DEFAULT_MAX_HEIGHT_RATIO = 0.8;
const DEFAULT_CANCEL_TEXT = '取消';
const DEFAULT_OK_TEXT = '确定';
const PERCENT_HEIGHT_UNIT = '%';
const PERCENT_HEIGHT_RATIO = 100;

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
    resolvedMinHeight ??
    (resolvedHeight === undefined
      ? defaultMinHeight
      : Math.min(resolvedHeight, defaultMinHeight));
  const rawMaxHeight =
    resolvedMaxHeight ??
    (resolvedHeight === undefined
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

  return (viewportHeight * percentage) / PERCENT_HEIGHT_RATIO;
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
    const sizeConfig = getFloatingPanelSizeConfig(size);
    const actionGap = sizeConfig.actionGap(token);
    const contentPadding = sizeConfig.contentPadding(token);
    const handleBorderRadius = sizeConfig.indicatorHeight(token);
    const sectionPadding = sizeConfig.sectionPadding(token);
    return {
      popupBody: {
        height: panelHeight,
        padding: 0,
      },
      root: {
        width: '100%',
        height: '100%',
        borderTopLeftRadius: position === 'top' ? 0 : token.borderRadiusLG * 2,
        borderTopRightRadius: position === 'top' ? 0 : token.borderRadiusLG * 2,
        borderBottomLeftRadius:
          position === 'top' ? token.borderRadiusLG * 2 : 0,
        borderBottomRightRadius:
          position === 'top' ? token.borderRadiusLG * 2 : 0,
        overflow: 'hidden',
      },
      content: {
        flex: 1,
      },
      header: {
        paddingHorizontal: contentPadding,
        paddingTop: 0,
        paddingBottom: sectionPadding,
      },
      headerRow: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: token.marginXS,
      },
      headerTitle: {
        flex: 1,
        minWidth: 0,
      },
      closeButton: {
        alignItems: 'center',
        borderRadius: token.borderRadiusSM,
        height: token.controlHeightSM,
        justifyContent: 'center',
        width: token.controlHeightSM,
      },
      closeButtonPressed: {
        backgroundColor: token.colorFill,
      },
      titleText: {
        fontWeight: String(token.fontWeightStrong) as TextStyle['fontWeight'],
      },
      panelBody: {
        flex: 1,
      },
      panelBodyScrollView: {
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
      },
      footerButton: {
        flex: 1,
      },
      handle: {
        minHeight: sizeConfig.handleHeight(token),
        alignItems: 'center',
        justifyContent: 'center',
        borderTopLeftRadius: position === 'top' ? 0 : token.borderRadiusLG,
        borderTopRightRadius: position === 'top' ? 0 : token.borderRadiusLG,
        borderBottomLeftRadius: position === 'top' ? token.borderRadiusLG : 0,
        borderBottomRightRadius: position === 'top' ? token.borderRadiusLG : 0,
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
): ReturnType<typeof Gesture.Pan> | undefined {
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

function getResponderTranslationY(gestureState?: {
  dy?: number;
  translationY?: number;
}): number {
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
  if (title === null) {
    return null;
  }

  if (title !== undefined) {
    return title;
  }

  if (titleText === undefined) {
    return null;
  }

  return (
    <Text
      color="heading"
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
    | 'header'
    | 'renderHeader'
    | 'renderHeaderLeft'
    | 'renderHeaderRight'
    | 'showCloseButton'
    | 'title'
    | 'titleText'
  >,
  params: PopupFloatingPanelRenderHeaderParams,
  titleTextSize: TextSize,
  titleTextStyle: StyleProp<TextStyle>,
  headerRowStyle: StyleProp<ViewStyle>,
  headerTitleStyle: StyleProp<ViewStyle>,
  closeButtonStyle: StyleProp<ViewStyle>,
  closeButtonPressedStyle: StyleProp<ViewStyle>,
): React.ReactNode {
  if (props.renderHeader === null || props.header === null) {
    return null;
  }

  if (props.renderHeader !== undefined) {
    return props.renderHeader(params);
  }

  if (props.header !== undefined) {
    return props.header;
  }

  const leftNode = props.renderHeaderLeft?.(params);
  const rightNode = props.renderHeaderRight?.(params);
  const titleNode = renderTitle(
    props.title,
    props.titleText,
    titleTextSize,
    titleTextStyle,
  );
  const shouldShowCloseButton = props.showCloseButton !== false;

  if (
    leftNode === undefined &&
    rightNode === undefined &&
    titleNode === null &&
    !shouldShowCloseButton
  ) {
    return null;
  }

  return (
    <Row style={headerRowStyle}>
      {leftNode === undefined
        ? null
        : renderTextNode(leftNode, text => (
            <Text color="secondary">{text}</Text>
          ))}
      <Column style={headerTitleStyle}>{titleNode}</Column>
      {rightNode === undefined
        ? null
        : renderTextNode(rightNode, text => (
            <Text color="secondary">{text}</Text>
          ))}
      {shouldShowCloseButton ? (
        <Pressable
          hitSlop={CLOSE_BUTTON_HIT_SLOP}
          onPress={params.cancel}
          style={({ pressed }) => [
            closeButtonStyle,
            pressed && closeButtonPressedStyle,
          ]}
          testID="floating-panel-close-button"
        >
          <Icon icon="close" size="normal" />
        </Pressable>
      ) : null}
    </Row>
  );
}

function shouldRenderDefaultFooter({
  cancel,
  ok,
}: Pick<PopupFloatingPanelProps, 'cancel' | 'ok'>): boolean {
  return cancel !== null || ok !== null;
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
  const cancelNode =
    props.cancel === undefined
      ? props.cancelText === undefined
        ? DEFAULT_CANCEL_TEXT
        : props.cancelText
      : props.cancel;
  const okNode =
    props.ok === undefined
      ? props.okText === undefined
        ? DEFAULT_OK_TEXT
        : props.okText
      : props.ok;

  return (
    <>
      {cancelNode === null ? null : (
        <Button
          onPress={params.cancel}
          size={defaultButtonSize}
          style={[footerButtonStyle, styles?.cancelButton]}
          testID="floating-panel-cancel-button"
        >
          {cancelNode}
        </Button>
      )}
      {okNode === null ? null : (
        <Button
          disabled={props.okDisabled}
          loading={props.okLoading}
          onPress={params.confirm}
          size={defaultButtonSize}
          style={[footerButtonStyle, styles?.okButton]}
          testID="floating-panel-ok-button"
          type="primary"
        >
          {okNode}
        </Button>
      )}
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
  if (props.renderFooter === null || props.footer === null) {
    return null;
  }

  if (props.renderFooter !== undefined) {
    return props.renderFooter(params);
  }

  if (props.footer !== undefined) {
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
  bodyScrollable = true,
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
  height = DEFAULT_HEIGHT,
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
  renderHeaderLeft,
  renderHeaderRight,
  scrollEnabled = false,
  showCloseButton = true,
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
    renderHeader !== null &&
    header !== null &&
    (renderHeader !== undefined ||
      header !== undefined ||
      renderHeaderLeft !== undefined ||
      renderHeaderRight !== undefined ||
      (title !== undefined && title !== null) ||
      (title === undefined && titleText !== undefined));
  const willRenderFooter =
    renderFooter !== null &&
    footer !== null &&
    (renderFooter !== undefined ||
      footer !== undefined ||
      shouldRenderDefaultFooter({
        cancel,
        ok,
      }));
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
    <GestureDetector gesture={dragGesture}>{handleContent}</GestureDetector>
  ) : (
    handleContent
  );

  const handleAtTop = resolvedPosition === 'bottom';
  const floatingPanelSizeConfig = getFloatingPanelSizeConfig(resolvedSize);
  const headerNode = renderPanelHeader(
    {
      header,
      renderHeader,
      renderHeaderLeft,
      renderHeaderRight,
      showCloseButton,
      title,
      titleText,
    },
    {
      cancel: handleCancel,
      confirm: handleConfirm,
    },
    floatingPanelSizeConfig.titleTextSize,
    [tokenStyles.titleText, styles?.titleText],
    tokenStyles.headerRow,
    tokenStyles.headerTitle,
    tokenStyles.closeButton,
    tokenStyles.closeButtonPressed,
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
      <Column style={[tokenStyles.root, style]} testID="floating-panel-root">
        {handleAtTop ? handleNode : null}
        <Column style={[tokenStyles.content, styles?.content]}>
          {willRenderHeader ? (
            <Column
              style={[tokenStyles.header, styles?.header]}
              testID="floating-panel-header"
            >
              {renderTextNode(headerNode, text => (
                <Text color="heading">{text}</Text>
              ))}
            </Column>
          ) : null}
          {bodyScrollable ? (
            <ScrollView
              contentContainerStyle={[
                tokenStyles.panelBodyScrollView,
                styles?.panelBody,
              ]}
              scrollEnabled={scrollEnabled}
              style={tokenStyles.panelBody}
              testID="floating-panel-body"
            >
              {children}
            </ScrollView>
          ) : (
            <View
              style={[
                tokenStyles.panelBody,
                tokenStyles.panelBodyScrollView,
                styles?.panelBody,
              ]}
              testID="floating-panel-body"
            >
              {children}
            </View>
          )}
          {footerNode ? (
            <Row
              style={[tokenStyles.footer, styles?.footer]}
              testID="floating-panel-footer"
            >
              {renderTextNode(footerNode, text => (
                <Text>{text}</Text>
              ))}
            </Row>
          ) : null}
        </Column>
        {handleAtTop ? null : handleNode}
      </Column>
    </PopupRoot>
  );
}
