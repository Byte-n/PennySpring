import type { ComponentSize } from '../shares/types';
import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import { useControllableValue } from '../_hooks';
import { Text } from '../Text';
import type {
  AliasToken } from '@pennyspring/theme';
import type { ReactNode } from 'react';
import type { StyleProp,
  TextStyle } from 'react-native';
import type {
  StepsItem,
  StepsProps,
  StepsStatus,
} from './types';

interface StepsStyleOptions {
  size: ComponentSize;
}

interface SizeStyleConfig {
  indicatorSize: (token: AliasToken) => number;
  indicatorFontSize: (token: AliasToken) => number;
  indicatorLineHeight: (token: AliasToken) => number;
  titleFontSize: (token: AliasToken) => number;
  titleLineHeight: (token: AliasToken) => number;
  descriptionFontSize: (token: AliasToken) => number;
  descriptionLineHeight: (token: AliasToken) => number;
  itemGap: (token: AliasToken) => number;
  contentGap: (token: AliasToken) => number;
  connectorHeight: (token: AliasToken) => number;
  connectorMarginTop: (token: AliasToken) => number;
}

const SIZE_STYLE_MAP: Record<ComponentSize, SizeStyleConfig> = {
  small: {
    indicatorSize: token => token.controlHeightSM,
    indicatorFontSize: token => token.fontSizeSM,
    indicatorLineHeight: token => token.lineHeightSM,
    titleFontSize: token => token.fontSizeSM,
    titleLineHeight: token => token.lineHeightSM,
    descriptionFontSize: token => token.fontSizeSM,
    descriptionLineHeight: token => token.lineHeightSM,
    itemGap: token => token.marginXXS,
    contentGap: token => token.marginXXS,
    connectorHeight: token => token.controlHeightSM,
    connectorMarginTop: token => token.marginXS,
  },
  normal: {
    indicatorSize: token => token.controlHeight,
    indicatorFontSize: token => token.fontSize,
    indicatorLineHeight: token => token.lineHeight,
    titleFontSize: token => token.fontSize,
    titleLineHeight: token => token.lineHeight,
    descriptionFontSize: token => token.fontSizeSM,
    descriptionLineHeight: token => token.lineHeightSM,
    itemGap: token => token.marginXS,
    contentGap: token => token.marginXS,
    connectorHeight: token => token.controlHeight,
    connectorMarginTop: token => token.marginSM,
  },
  large: {
    indicatorSize: token => token.controlHeightLG,
    indicatorFontSize: token => token.fontSizeLG,
    indicatorLineHeight: token => token.lineHeightLG,
    titleFontSize: token => token.fontSizeLG,
    titleLineHeight: token => token.lineHeightLG,
    descriptionFontSize: token => token.fontSize,
    descriptionLineHeight: token => token.lineHeight,
    itemGap: token => token.marginSM,
    contentGap: token => token.marginSM,
    connectorHeight: token => token.controlHeightLG,
    connectorMarginTop: token => token.marginSM,
  },
};

function renderContent(
  node: ReactNode,
  text: string | undefined,
  style: StyleProp<TextStyle>,
) {
  if (node !== undefined && node !== null && node !== false) {
    return node;
  }

  if (text === undefined || text === null || text === '') {
    return null;
  }

  return <Text style={style}>{text}</Text>;
}

function resolveItemStatus(
  item: StepsItem,
  index: number,
  activeIndex: number,
  baseStatus: StepsStatus,
): StepsStatus {
  if (item.status !== undefined) {
    return item.status;
  }

  if (index < activeIndex) {
    return 'finish';
  }

  if (index === activeIndex) {
    return baseStatus;
  }

  return 'wait';
}

const useStyles = createUseSheetStyle((token, { size }: StepsStyleOptions) => {
  const sizeConfig = SIZE_STYLE_MAP[size];
  const indicatorSize = sizeConfig.indicatorSize(token);

  return {
    root: {
      alignSelf: 'stretch',
      width: '100%',
    },
    item: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: sizeConfig.itemGap(token),
      width: '100%',
    },
    itemPressed: {
      backgroundColor: token.colorBgTextHover,
    },
    itemDisabled: {
      opacity: token.opacityLoading,
    },
    stepHeader: {
      alignItems: 'center',
      width: indicatorSize,
    },
    indicator: {
      alignItems: 'center',
      borderRadius: indicatorSize,
      borderWidth: token.lineWidth,
      height: indicatorSize,
      justifyContent: 'center',
      width: indicatorSize,
    },
    indicatorWait: {
      backgroundColor: token.colorBgContainer,
      borderColor: token.colorBorder,
    },
    indicatorProcess: {
      backgroundColor: token.colorPrimary,
      borderColor: token.colorPrimary,
    },
    indicatorFinish: {
      backgroundColor: token.colorSuccess,
      borderColor: token.colorSuccess,
    },
    indicatorError: {
      backgroundColor: token.colorError,
      borderColor: token.colorError,
    },
    indicatorText: {
      fontFamily: token.fontFamily,
      fontSize: sizeConfig.indicatorFontSize(token),
      lineHeight: sizeConfig.indicatorLineHeight(token),
      fontWeight: String(token.fontWeightStrong) as TextStyle['fontWeight'],
    },
    indicatorTextWait: {
      color: token.colorTextSecondary,
    },
    indicatorTextActive: {
      color: token.colorTextLightSolid,
    },
    connector: {
      marginTop: sizeConfig.connectorMarginTop(token),
      width: token.lineWidth,
      minHeight: sizeConfig.connectorHeight(token),
      backgroundColor: token.colorBorderSecondary,
    },
    connectorFinish: {
      backgroundColor: token.colorSuccess,
    },
    content: {
      flex: 1,
      gap: sizeConfig.contentGap(token),
      paddingBottom: sizeConfig.itemGap(token),
    },
    contentLast: {
      paddingBottom: 0,
    },
    titleText: {
      color: token.colorText,
      fontFamily: token.fontFamily,
      fontSize: sizeConfig.titleFontSize(token),
      lineHeight: sizeConfig.titleLineHeight(token),
      fontWeight: String(token.fontWeightStrong) as TextStyle['fontWeight'],
    },
    titleTextActive: {
      color: token.colorText,
    },
    titleTextDisabled: {
      color: token.colorTextDisabled,
    },
    descriptionText: {
      color: token.colorTextSecondary,
      fontFamily: token.fontFamily,
      fontSize: sizeConfig.descriptionFontSize(token),
      lineHeight: sizeConfig.descriptionLineHeight(token),
      fontWeight: String(token.fontWeightRegular) as TextStyle['fontWeight'],
    },
    descriptionTextDisabled: {
      color: token.colorTextDisabled,
    },
  };
});

export function Steps({
  items,
  value,
  defaultValue = 0,
  onChange,
  disabled = false,
  readonly = false,
  size = 'normal',
  status = 'process',
  style,
  styles,
  onPress,
  ...rest
}: StepsProps) {
  const tokenStyles = useStyles({ size });
  const normalizedItems = useMemo(() => [...items], [items]);
  const [selectedIndex, setSelectedIndex] = useControllableValue(
    defaultValue,
    value,
    onChange,
  );

  const safeSelectedIndex = Math.min(
    Math.max(selectedIndex ?? 0, 0),
    Math.max(normalizedItems.length - 1, 0),
  );
  const isRootDisabled = disabled || readonly;

  return (
    <View style={[tokenStyles.root, style]} testID="steps-root">
      {normalizedItems.map((item, index) => {
        const itemDisabled = isRootDisabled || item.disabled === true;
        const isSelected = index === safeSelectedIndex;
        const itemStatus = resolveItemStatus(item, index, safeSelectedIndex, status);
        const isLast = index === normalizedItems.length - 1;
        const indicatorText = String(index + 1);
        const indicatorStatusStyle =
          itemStatus === 'finish'
            ? tokenStyles.indicatorFinish
            : itemStatus === 'error'
              ? tokenStyles.indicatorError
              : itemStatus === 'wait'
                ? tokenStyles.indicatorWait
                : tokenStyles.indicatorProcess;

        return (
          <Pressable
            {...rest}
            key={item.key ?? `${String(index)}-${item.titleText ?? ''}`}
            testID={`steps-item-${String(index)}`}
            disabled={itemDisabled}
            onPress={event => {
              if (itemDisabled || isSelected) {
                return;
              }

              onPress?.(event, index, item);
              setSelectedIndex(index);
            }}
            style={({ pressed }) => [
              tokenStyles.item,
              styles?.item,
              itemDisabled ? tokenStyles.itemDisabled : null,
              pressed && !itemDisabled ? tokenStyles.itemPressed : null,
            ]}
          >
            <View style={[tokenStyles.stepHeader, styles?.stepHeader]}>
              <View style={[tokenStyles.indicator, indicatorStatusStyle, styles?.indicator]}>
                <Text
                  style={[
                    tokenStyles.indicatorText,
                    itemStatus === 'wait'
                      ? tokenStyles.indicatorTextWait
                      : tokenStyles.indicatorTextActive,
                    styles?.indicatorText,
                  ]}
                >
                  {indicatorText}
                </Text>
              </View>
              {isLast ? null : (
                <View
                  style={[
                    tokenStyles.connector,
                    itemStatus === 'finish' ? tokenStyles.connectorFinish : null,
                    styles?.connector,
                  ]}
                />
              )}
            </View>
            <View style={[tokenStyles.content, isLast ? tokenStyles.contentLast : null, styles?.content]}>
              {renderContent(item.title, item.titleText, [
                tokenStyles.titleText,
                isSelected ? tokenStyles.titleTextActive : null,
                itemDisabled ? tokenStyles.titleTextDisabled : null,
                styles?.titleText,
              ])}
              {renderContent(item.description, item.descriptionText, [
                tokenStyles.descriptionText,
                itemDisabled ? tokenStyles.descriptionTextDisabled : null,
                styles?.descriptionText,
              ])}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
