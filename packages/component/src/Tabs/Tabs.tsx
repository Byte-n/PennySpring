import type { ComponentSize } from '../shares/types';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import { Text } from '../Text';
import { useControllableValue } from '../_hooks';
import type {
  AliasToken } from '@pennyspring/theme';
import type { ReactNode } from 'react';
import type { StyleProp,
  TextStyle } from 'react-native';
import type { TabsItem,
  TabsLayout,
  TabsProps,
  TabsValue,
} from './types';

interface TabsStyleOptions {
  block: boolean;
  disabled: boolean;
  layout: TabsLayout;
  size: ComponentSize;
}

interface SizeStyleConfig {
  tabMinHeight: (token: AliasToken) => number;
  tabPaddingHorizontal: (token: AliasToken) => number;
  tabPaddingVertical: (token: AliasToken) => number;
  labelFontSize: (token: AliasToken) => number;
  labelLineHeight: (token: AliasToken) => number;
  tabGap: (token: AliasToken) => number;
  panelPaddingTop: (token: AliasToken) => number;
}

const SIZE_STYLE_MAP: Record<ComponentSize, SizeStyleConfig> = {
  small: {
    tabMinHeight: token => token.controlHeightSM,
    tabPaddingHorizontal: token => token.controlPaddingHorizontalSM,
    tabPaddingVertical: token => token.paddingXXS,
    labelFontSize: token => token.fontSizeSM,
    labelLineHeight: token => token.lineHeightSM,
    tabGap: token => token.marginXS,
    panelPaddingTop: token => token.paddingSM,
  },
  normal: {
    tabMinHeight: token => token.controlHeight,
    tabPaddingHorizontal: token => token.controlPaddingHorizontal,
    tabPaddingVertical: token => token.paddingXS,
    labelFontSize: token => token.fontSize,
    labelLineHeight: token => token.lineHeight,
    tabGap: token => token.marginSM,
    panelPaddingTop: token => token.paddingMD,
  },
  large: {
    tabMinHeight: token => token.controlHeightLG,
    tabPaddingHorizontal: token => token.paddingMD,
    tabPaddingVertical: token => token.paddingSM,
    labelFontSize: token => token.fontSizeLG,
    labelLineHeight: token => token.lineHeightLG,
    tabGap: token => token.marginMD,
    panelPaddingTop: token => token.paddingLG,
  },
};

function renderLabel(label: ReactNode, style: StyleProp<TextStyle>) {
  if (label === undefined || label === null || label === false) {
    return null;
  }

  if (typeof label === 'string' || typeof label === 'number') {
    return (
      <Text size="sm" style={style}>
        {label}
      </Text>
    );
  }

  return label;
}

const useStyles = createUseSheetStyle(
  (token, { block, disabled, layout, size }: TabsStyleOptions) => {
    const sizeConfig = SIZE_STYLE_MAP[size];

    return {
      root: {
        alignSelf: block ? 'stretch' : 'flex-start',
        width: block ? '100%' : undefined,
      },
      tabList: {
        flexDirection: 'row',
        flexWrap: layout === 'wrap' ? 'wrap' : 'nowrap',
        alignItems: 'center',
        borderBottomWidth: token.lineWidth,
        borderBottomColor: disabled
          ? token.colorBorderDisabled
          : token.colorBorderSecondary,
        gap: sizeConfig.tabGap(token),
        minWidth: block ? '100%' : undefined,
      },
      tab: {
        minHeight: sizeConfig.tabMinHeight(token),
        paddingHorizontal: sizeConfig.tabPaddingHorizontal(token),
        paddingVertical: sizeConfig.tabPaddingVertical(token),
        borderBottomWidth: token.lineWidthBold,
        borderBottomColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      },
      tabBlock: {
        maxWidth: '100%',
      },
      tabPressed: {
        backgroundColor: token.colorBgTextHover,
      },
      tabActive: {
        borderBottomColor: token.colorPrimary,
      },
      tabDisabled: {
        opacity: token.opacityLoading,
      },
      label: {
        fontFamily: token.fontFamily,
        fontSize: sizeConfig.labelFontSize(token),
        lineHeight: sizeConfig.labelLineHeight(token),
        color: token.colorTextSecondary,
        fontWeight: String(token.fontWeightRegular) as TextStyle['fontWeight'],
      },
      labelActive: {
        color: token.colorPrimary,
        fontWeight: String(token.fontWeightStrong) as TextStyle['fontWeight'],
      },
      labelDisabled: {
        color: token.colorTextDisabled,
      },
      panel: {
        paddingTop: sizeConfig.panelPaddingTop(token),
      },
    };
  },
);

function getInitialValue(items: TabsItem[], defaultValue?: TabsValue): TabsValue | undefined {
  if (defaultValue !== undefined) {
    return defaultValue;
  }

  return items.find(item => !item.disabled)?.value;
}

export function Tabs({
  items,
  value,
  defaultValue,
  onChange,
  disabled = false,
  size = 'normal',
  layout = 'wrap',
  block = false,
  style,
  styles,
  onPress,
  renderContent,
  ...rest
}: TabsProps) {
  const tokenStyles = useStyles({ block, disabled, layout, size });
  const normalizedItems = useMemo(() => [...items], [items]);
  const [selectedValue, setSelectedValue] = useControllableValue(
    getInitialValue(normalizedItems, defaultValue),
    value,
    onChange,
  );

  const selectedIndex = normalizedItems.findIndex(item => item.value === selectedValue);
  const selectedItem = selectedIndex >= 0 ? normalizedItems[selectedIndex] : undefined;

  return (
    <View testID="tabs-root" style={[tokenStyles.root, style]}>
      {layout === 'scroll' ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[tokenStyles.tabList, styles?.tabList]}
          testID="tabs-list-scroll"
        >
          {normalizedItems.map(item => {
            const itemDisabled = disabled || item.disabled === true;
            const isSelected = selectedValue === item.value;

            return (
              <Pressable
                {...rest}
                key={String(item.value)}
                testID={`tabs-item-${String(item.value)}`}
                disabled={itemDisabled}
                onPress={event => {
                  if (itemDisabled || isSelected) {
                    return;
                  }

                  onPress?.(event, item.value);
                  setSelectedValue(item.value);
                }}
                style={({ pressed }) => [
                  tokenStyles.tab,
                  block ? tokenStyles.tabBlock : null,
                  styles?.tab,
                  isSelected ? tokenStyles.tabActive : null,
                  isSelected ? styles?.tabActive : null,
                  pressed && !itemDisabled ? tokenStyles.tabPressed : null,
                  pressed && !itemDisabled ? styles?.tabPressed : null,
                  itemDisabled ? tokenStyles.tabDisabled : null,
                ]}
              >
                {renderLabel(item.label, [
                  tokenStyles.label,
                  styles?.label,
                  isSelected ? tokenStyles.labelActive : null,
                  isSelected ? styles?.labelActive : null,
                  itemDisabled ? tokenStyles.labelDisabled : null,
                  itemDisabled ? styles?.labelDisabled : null,
                ])}
              </Pressable>
            );
          })}
        </ScrollView>
      ) : (
        <View testID="tabs-list" style={[tokenStyles.tabList, styles?.tabList]}>
          {normalizedItems.map(item => {
            const itemDisabled = disabled || item.disabled === true;
            const isSelected = selectedValue === item.value;

            return (
              <Pressable
                {...rest}
                key={String(item.value)}
                testID={`tabs-item-${String(item.value)}`}
                disabled={itemDisabled}
                onPress={event => {
                  if (itemDisabled || isSelected) {
                    return;
                  }

                  onPress?.(event, item.value);
                  setSelectedValue(item.value);
                }}
                style={({ pressed }) => [
                  tokenStyles.tab,
                  block ? tokenStyles.tabBlock : null,
                  styles?.tab,
                  isSelected ? tokenStyles.tabActive : null,
                  isSelected ? styles?.tabActive : null,
                  pressed && !itemDisabled ? tokenStyles.tabPressed : null,
                  pressed && !itemDisabled ? styles?.tabPressed : null,
                  itemDisabled ? tokenStyles.tabDisabled : null,
                ]}
              >
                {renderLabel(item.label, [
                  tokenStyles.label,
                  styles?.label,
                  isSelected ? tokenStyles.labelActive : null,
                  isSelected ? styles?.labelActive : null,
                  itemDisabled ? tokenStyles.labelDisabled : null,
                  itemDisabled ? styles?.labelDisabled : null,
                ])}
              </Pressable>
            );
          })}
        </View>
      )}
      {selectedItem !== undefined && renderContent !== undefined ? (
        <View testID="tabs-panel" style={[tokenStyles.panel, styles?.panel]}>
          {renderContent(selectedItem, selectedIndex)}
        </View>
      ) : null}
    </View>
  );
}
