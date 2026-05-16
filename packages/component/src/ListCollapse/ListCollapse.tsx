import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import { Text } from '../Text';
import type { ReactNode } from 'react';
import type {
  GestureResponderEvent,
  StyleProp,
  TextStyle,
} from 'react-native';
import type { AliasToken } from '@pennyspring/theme';
import type { ComponentSize } from '../shares/types';
import type { ListCollapseProps } from './types';

const DEFAULT_SIZE: ComponentSize = 'normal';

interface ListCollapseStyleOptions {
  size: ComponentSize;
}

function getHeaderPadding(size: ComponentSize, token: AliasToken) {
  if (size === 'small') {
    return token.paddingXS;
  }

  if (size === 'large') {
    return token.paddingMD;
  }

  return token.paddingSM;
}

const useListCollapseStyles = createUseSheetStyle(
  (token, { size }: ListCollapseStyleOptions) => {
    const headerPadding = getHeaderPadding(size, token);
    const slotGap = size === 'small' ? token.marginXS : token.marginSM;

    return {
      root: {
        backgroundColor: token.colorBgContainer,
      },
      header: {
        minHeight:
          size === 'large' ? token.controlHeightLG : token.controlHeight,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: token.paddingContentHorizontal,
        paddingVertical: headerPadding,
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
      summary: {
        marginLeft: slotGap,
      },
      indicator: {
        marginLeft: slotGap,
      },
      content: {
        paddingHorizontal: token.paddingMD,
        paddingVertical: token.paddingSM,
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
  defaultExpanded,
  disabled,
  expandText,
  expanded,
  indicator,
  left,
  loading,
  onExpandedChange,
  onHeaderPress,
  readonly,
  size,
  style,
  styles,
  summary,
  title,
  titleText,
}: ListCollapseProps) {
  const [internalExpanded, setInternalExpanded] = useState(Boolean(defaultExpanded));
  const resolvedSize = resolveSize(size);
  const tokenStyles = useListCollapseStyles({ size: resolvedSize });
  const mergedExpanded = expanded ?? internalExpanded;
  const isDisabled = Boolean(disabled);
  const isInteractive = !isDisabled && !readonly && !loading;
  const accessibilityState = {
    disabled: isDisabled || undefined,
    expanded: mergedExpanded,
    busy: loading || undefined,
  };

  const setExpanded = (nextExpanded: boolean): void => {
    if (expanded === undefined) {
      setInternalExpanded(nextExpanded);
    }

    onExpandedChange?.(nextExpanded);
  };
  const handleHeaderPress = (event: GestureResponderEvent): void => {
    onHeaderPress?.(event);

    if (!isInteractive) {
      return;
    }

    setExpanded(!mergedExpanded);
  };
  const indicatorText = mergedExpanded ? collapseText : expandText;
  const indicatorNode = indicator ?? (
    indicatorText === undefined ? null : (
      <Text color="secondary">{indicatorText}</Text>
    )
  );

  return (
    <View style={[tokenStyles.root, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={accessibilityState}
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
        {summary ? (
          <View style={[tokenStyles.summary, styles?.summary]}>{summary}</View>
        ) : null}
        {indicatorNode === null ? null : (
          <View style={[tokenStyles.indicator, styles?.indicator]}>{indicatorNode}</View>
        )}
      </Pressable>
      {mergedExpanded ? (
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
