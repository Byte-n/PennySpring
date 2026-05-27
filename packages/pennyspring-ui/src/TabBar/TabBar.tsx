import type { ComponentSize } from '../shares/types';
import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import { Text } from '../Text';
import { useControllableValue } from '../_hooks';
import type {
  AliasToken } from '@pennyspring/theme';
import type { ReactNode } from 'react';
import type { StyleProp,
  TextStyle,
  ViewStyle } from 'react-native';
import type { TabBarItem,
  TabBarProps,
  TabBarValue,
} from './types';

interface TabBarStyleOptions {
  disabled: boolean;
  safeAreaInsetBottom: boolean;
  size: ComponentSize;
}

interface SizeStyleConfig {
  minHeight: (token: AliasToken) => number;
  iconBottomGap: (token: AliasToken) => number;
  titleFontSize: (token: AliasToken) => number;
  titleLineHeight: (token: AliasToken) => number;
  badgeHeight: (token: AliasToken) => number;
  badgeMinWidth: (token: AliasToken) => number;
  badgePaddingHorizontal: (token: AliasToken) => number;
}

const TAB_ITEM_HIT_SLOP = {
  top: 6,
  right: 6,
  bottom: 6,
  left: 6,
} as const;

const SIZE_STYLE_MAP: Record<ComponentSize, SizeStyleConfig> = {
  small: {
    minHeight: token => token.controlHeightSM + token.paddingSM,
    iconBottomGap: token => token.marginXXS,
    titleFontSize: token => token.fontSizeSM,
    titleLineHeight: token => token.lineHeightSM,
    badgeHeight: token => token.controlHeightXS,
    badgeMinWidth: token => token.controlHeightXS,
    badgePaddingHorizontal: token => token.paddingXXS,
  },
  normal: {
    minHeight: token => token.controlHeight + token.paddingSM,
    iconBottomGap: token => token.marginXXS,
    titleFontSize: token => token.fontSizeSM,
    titleLineHeight: token => token.lineHeightSM,
    badgeHeight: token => token.controlHeightXS,
    badgeMinWidth: token => token.controlHeightXS,
    badgePaddingHorizontal: token => token.paddingXXS,
  },
  large: {
    minHeight: token => token.controlHeightLG + token.paddingSM,
    iconBottomGap: token => token.marginXS,
    titleFontSize: token => token.fontSize,
    titleLineHeight: token => token.lineHeight,
    badgeHeight: token => token.controlHeightSM,
    badgeMinWidth: token => token.controlHeightSM,
    badgePaddingHorizontal: token => token.paddingXS,
  },
};

const useStyles = createUseSheetStyle(
  (token, { disabled, safeAreaInsetBottom, size }: TabBarStyleOptions) => {
    const sizeConfig = SIZE_STYLE_MAP[size];

    return {
      root: {
        backgroundColor: token.colorBgContainer,
        borderTopWidth: token.lineWidth,
        borderTopColor: disabled
          ? token.colorBorderDisabled
          : token.colorBorderSecondary,
        paddingTop: token.paddingXXS / 2,
        paddingBottom: safeAreaInsetBottom ? token.paddingSM / 2 : token.paddingXXS / 2,
      },
      tabList: {
        flexDirection: 'row',
        alignItems: 'stretch',
      },
      tab: {
        flex: 1,
        minHeight: sizeConfig.minHeight(token),
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: token.paddingXXS,
        paddingVertical: token.paddingXXS / 2,
      },
      tabPressed: {
        backgroundColor: token.colorBgTextHover,
      },
      tabActive: {
        backgroundColor: token.controlItemBgActive,
      },
      tabDisabled: {
        opacity: token.opacityLoading,
      },
      iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: sizeConfig.iconBottomGap(token),
      },
      titleText: {
        fontFamily: token.fontFamily,
        fontSize: sizeConfig.titleFontSize(token),
        lineHeight: sizeConfig.titleLineHeight(token),
        color: token.colorTextSecondary,
        fontWeight: String(token.fontWeightRegular) as TextStyle['fontWeight'],
      },
      titleTextActive: {
        color: token.colorPrimary,
        fontWeight: String(token.fontWeightStrong) as TextStyle['fontWeight'],
      },
      titleTextDisabled: {
        color: token.colorTextDisabled,
      },
      badge: {
        position: 'absolute',
        top: token.paddingXXS,
        right: token.paddingSM,
        minWidth: sizeConfig.badgeMinWidth(token),
        height: sizeConfig.badgeHeight(token),
        borderRadius: token.borderRadiusLG,
        backgroundColor: token.colorError,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: sizeConfig.badgePaddingHorizontal(token),
      },
      badgeText: {
        fontFamily: token.fontFamily,
        color: token.colorTextLightSolid,
        fontSize: token.fontSizeSM,
        lineHeight: token.lineHeightSM,
        fontWeight: String(token.fontWeightStrong) as TextStyle['fontWeight'],
      },
    };
  },
);

function getInitialValue(
  items: TabBarItem[],
  defaultValue?: TabBarValue,
): TabBarValue | undefined {
  if (defaultValue !== undefined) {
    return defaultValue;
  }

  return items.find(item => !item.disabled)?.key;
}

function renderTitle(title: ReactNode, style: StyleProp<TextStyle>) {
  if (title === undefined || title === null || title === false) {
    return null;
  }

  if (typeof title === 'string' || typeof title === 'number') {
    return (
      <Text size="sm" style={style}>
        {title}
      </Text>
    );
  }

  return title;
}

function renderBadge(
  badge: ReactNode,
  badgeStyle: StyleProp<ViewStyle>,
  badgeTextStyle: StyleProp<TextStyle>,
) {
  if (badge === undefined || badge === null || badge === false) {
    return null;
  }

  if (typeof badge === 'string' || typeof badge === 'number') {
    return (
      <View style={badgeStyle}>
        <Text style={badgeTextStyle}>{badge}</Text>
      </View>
    );
  }

  return badge;
}

export function TabBar({
  items,
  value,
  defaultValue,
  onChange,
  disabled = false,
  size = 'normal',
  safeAreaInsetBottom = true,
  style,
  styles,
  onPress,
  ...rest
}: TabBarProps) {
  const tokenStyles = useStyles({ disabled, safeAreaInsetBottom, size });
  const normalizedItems = useMemo(() => [...items], [items]);
  const [selectedValue, setSelectedValue] = useControllableValue(
    getInitialValue(normalizedItems, defaultValue),
    value,
    onChange,
  );

  return (
    <View testID="tab-bar-root" style={[tokenStyles.root, style]}>
      <View style={[tokenStyles.tabList, styles?.tabList]}>
        {normalizedItems.map(item => {
          const itemDisabled = disabled || item.disabled === true;
          const isSelected = selectedValue === item.key;
          const titleNode = item.title ?? item.titleText;
          const iconNode =
            isSelected && item.activeIcon !== undefined ? item.activeIcon : item.icon;
          const badgeNode = item.badge ?? item.badgeText;

          return (
            <Pressable
              {...rest}
              key={String(item.key)}
              testID={`tab-bar-item-${String(item.key)}`}
              disabled={itemDisabled}
              hitSlop={TAB_ITEM_HIT_SLOP}
              onPress={event => {
                if (itemDisabled || isSelected) {
                  return;
                }

                onPress?.(event, item.key);
                setSelectedValue(item.key);
              }}
              style={({ pressed }) => [
                tokenStyles.tab,
                styles?.tab,
                isSelected ? tokenStyles.tabActive : null,
                isSelected ? styles?.tabActive : null,
                pressed && !itemDisabled ? tokenStyles.tabPressed : null,
                pressed && !itemDisabled ? styles?.tabPressed : null,
                itemDisabled ? tokenStyles.tabDisabled : null,
                itemDisabled ? styles?.tabDisabled : null,
              ]}
            >
              {iconNode === undefined ? null : (
                <View style={[tokenStyles.iconContainer, styles?.icon]}>{iconNode}</View>
              )}
              {renderTitle(titleNode, [
                tokenStyles.titleText,
                styles?.titleText,
                isSelected ? tokenStyles.titleTextActive : null,
                isSelected ? styles?.titleTextActive : null,
                itemDisabled ? tokenStyles.titleTextDisabled : null,
                itemDisabled ? styles?.titleTextDisabled : null,
              ])}
              {renderBadge(
                badgeNode,
                [tokenStyles.badge, styles?.badge],
                [tokenStyles.badgeText, styles?.badgeText],
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
