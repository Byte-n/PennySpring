import React from 'react';
import { Pressable, View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import { Text } from '../Text';
import { useControllableValue } from '../_hooks';
import type { ReactNode } from 'react';
import type {
  GestureResponderEvent,
  StyleProp,
  TextStyle,
} from 'react-native';
import type { ComponentSize } from '../shares/types';
import type { ListCollapseProps } from './types';

const DEFAULT_SIZE: ComponentSize = 'normal';

interface ListCollapseStyleOptions {
  size: ComponentSize;
}

const useListCollapseStyles = createUseSheetStyle(
  (token, { size }: ListCollapseStyleOptions) => {
    const slotGap =
      size === 'small'
        ? token.marginXXS
        : size === 'large'
          ? token.marginSM
          : token.marginXS;
    const contentPaddingH =
      size === 'small'
        ? token.paddingSM
        : size === 'large'
          ? token.paddingLG
          : token.padding;
    const headerPaddingH =
      size === 'small'
        ? token.paddingSM
        : size === 'large'
          ? token.paddingMD
          : token.paddingContentHorizontal;

    return {
      root: {
        backgroundColor: token.colorBgContainer,
      },
      header: {
        minHeight:
          size === 'large'
            ? token.controlHeightLG
            : size === 'small'
              ? token.controlHeightSM
              : token.controlHeight,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: headerPaddingH,
        paddingVertical: headerPaddingH / 2,
      },
      headerPressed: {
        backgroundColor: token.colorBgTextHover,
      },
      headerDisabled: {
        opacity: token.opacityLoading,
        backgroundColor: token.colorBgContainerDisabled,
      },
      left: {
        marginRight: slotGap,
      },
      title: {
        flex: 1,
        color: token.colorTextHeading,
      },
      summaryText: {
        color: token.colorTextDescription,
      },
      summary: {
        marginLeft: slotGap,
      },
      indicator: {
        marginLeft: slotGap,
      },
      content: {
        paddingHorizontal: contentPaddingH,
        paddingVertical: contentPaddingH / 2,
        backgroundColor: token.colorFillSecondary,
      },
      contentLoading: {
        opacity: token.opacityLoading,
      },
    };
  },
);

function resolveSize(size?: ComponentSize): ComponentSize {
  return size ?? DEFAULT_SIZE;
}

function renderTextNode(node: ReactNode, style: StyleProp<TextStyle>) {
  if (node === undefined || node === null || node === false) {
    return null;
  }

  if (typeof node === 'string' || typeof node === 'number') {
    return <Text style={style}>{node}</Text>;
  }

  return node;
}

export function ListCollapse({
  children,
  collapseText,
  defaultOpen,
  disabled,
  expandText,
  open,
  indicator,
  left,
  loading,
  onOpenChange,
  onHeaderPress,
  readonly,
  size,
  style,
  styles,
  summary,
  summaryText,
  title,
  titleText,
}: ListCollapseProps) {
  const [resolvedOpen, setResolvedOpen] = useControllableValue(
    defaultOpen,
    open,
    onOpenChange,
  );
  const resolvedSize = resolveSize(size);
  const tokenStyles = useListCollapseStyles({ size: resolvedSize });
  const isOpen = Boolean(resolvedOpen);
  const isDisabled = Boolean(disabled);
  const isInteractive = !isDisabled && !readonly && !loading;

  const handleHeaderPress = (event: GestureResponderEvent): void => {
    onHeaderPress?.(event);

    if (!isInteractive) {
      return;
    }

    setResolvedOpen(!isOpen);
  };
  const indicatorText = isOpen ? collapseText : expandText;
  const indicatorNode = indicator ?? (
    indicatorText === undefined ? null : (
      <Text color="secondary">{indicatorText}</Text>
    )
  );

  return (
    <View style={[tokenStyles.root, style]}>
      <Pressable
        onPress={handleHeaderPress}
        style={({ pressed }) => [
          tokenStyles.header,
          pressed && isInteractive ? tokenStyles.headerPressed : null,
          isDisabled ? tokenStyles.headerDisabled : null,
          styles?.header,
        ]}
      >
        {left ? <View style={[tokenStyles.left, styles?.left]}>{left}</View> : null}
        {title ?? renderTextNode(titleText, [tokenStyles.title, styles?.titleText])}
        {summaryText !== undefined ? (
          <Text style={[tokenStyles.summaryText, styles?.summaryText]}>{summaryText}</Text>
        ) : summary !== undefined && summary !== null ? (
          <View style={[tokenStyles.summary, styles?.summary]}>{summary}</View>
        ) : null}
        {indicatorNode === null ? null : (
          <View style={[tokenStyles.indicator, styles?.indicator]}>{indicatorNode}</View>
        )}
      </Pressable>
      {isOpen ? (
        <View
          style={[
            tokenStyles.content,
            styles?.content,
            loading ? tokenStyles.contentLoading : null,
          ]}
        >
          {children}
        </View>
      ) : null}
    </View>
  );
}
