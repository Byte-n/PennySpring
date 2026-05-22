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
import type {
  SideBarItem,
  SideBarLayout,
  SideBarProps,
  SideBarValue,
} from './types';

interface SideBarStyleOptions {
  block: boolean;
  disabled: boolean;
  layout: SideBarLayout;
  size: ComponentSize;
}

interface SizeStyleConfig {
  sideBarMinHeight: (token: AliasToken) => number;
  sideBarPaddingHorizontal: (token: AliasToken) => number;
  sideBarPaddingVertical: (token: AliasToken) => number;
  labelFontSize: (token: AliasToken) => number;
  labelLineHeight: (token: AliasToken) => number;
  sideBarGap: (token: AliasToken) => number;
  panelPaddingTop: (token: AliasToken) => number;
}

const SIZE_STYLE_MAP: Record<ComponentSize, SizeStyleConfig> = {
  small: {
    sideBarMinHeight: token => token.controlHeightSM,
    sideBarPaddingHorizontal: token => token.controlPaddingHorizontalSM,
    sideBarPaddingVertical: token => token.paddingXXS,
    labelFontSize: token => token.fontSizeSM,
    labelLineHeight: token => token.lineHeightSM,
    sideBarGap: token => token.marginXS,
    panelPaddingTop: token => token.paddingSM,
  },
  normal: {
    sideBarMinHeight: token => token.controlHeight,
    sideBarPaddingHorizontal: token => token.controlPaddingHorizontal,
    sideBarPaddingVertical: token => token.paddingXS,
    labelFontSize: token => token.fontSize,
    labelLineHeight: token => token.lineHeight,
    sideBarGap: token => token.marginSM,
    panelPaddingTop: token => token.paddingMD,
  },
  large: {
    sideBarMinHeight: token => token.controlHeightLG,
    sideBarPaddingHorizontal: token => token.paddingMD,
    sideBarPaddingVertical: token => token.paddingSM,
    labelFontSize: token => token.fontSizeLG,
    labelLineHeight: token => token.lineHeightLG,
    sideBarGap: token => token.marginMD,
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
  (token, { block, disabled, layout, size }: SideBarStyleOptions) => {
    const sizeConfig = SIZE_STYLE_MAP[size];

    return {
      root: {
        alignSelf: block ? 'stretch' : 'flex-start',
        width: block ? '100%' : undefined,
      },
      sideBarList: {
        flexDirection: 'row',
        flexWrap: layout === 'wrap' ? 'wrap' : 'nowrap',
        alignItems: 'center',
        borderBottomWidth: token.lineWidth,
        borderBottomColor: disabled
          ? token.colorBorderDisabled
          : token.colorBorderSecondary,
        gap: sizeConfig.sideBarGap(token),
        minWidth: block ? '100%' : undefined,
      },
      sideBar: {
        minHeight: sizeConfig.sideBarMinHeight(token),
        paddingHorizontal: sizeConfig.sideBarPaddingHorizontal(token),
        paddingVertical: sizeConfig.sideBarPaddingVertical(token),
        borderBottomWidth: token.lineWidthBold,
        borderBottomColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      },
      sideBarBlock: {
        maxWidth: '100%',
      },
      sideBarPressed: {
        backgroundColor: token.colorBgTextHover,
      },
      sideBarActive: {
        borderBottomColor: token.colorPrimary,
      },
      sideBarDisabled: {
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

function getInitialValue(
  items: SideBarItem[],
  defaultValue?: SideBarValue,
): SideBarValue | undefined {
  if (defaultValue !== undefined) {
    return defaultValue;
  }

  return items.find(item => !item.disabled)?.value;
}

export function SideBar({
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
}: SideBarProps) {
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
    <View testID="sidebar-root" style={[tokenStyles.root, style]}>
      {layout === 'scroll' ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[tokenStyles.sideBarList, styles?.sideBarList]}
          testID="sidebar-list-scroll"
        >
          {normalizedItems.map(item => {
            const itemDisabled = disabled || item.disabled === true;
            const isSelected = selectedValue === item.value;

            return (
              <Pressable
                {...rest}
                key={String(item.value)}
                testID={`sidebar-item-${String(item.value)}`}
                disabled={itemDisabled}
                onPress={event => {
                  if (itemDisabled || isSelected) {
                    return;
                  }

                  onPress?.(event, item.value);
                  setSelectedValue(item.value);
                }}
                style={({ pressed }) => [
                  tokenStyles.sideBar,
                  block ? tokenStyles.sideBarBlock : null,
                  styles?.sideBar,
                  isSelected ? tokenStyles.sideBarActive : null,
                  isSelected ? styles?.sideBarActive : null,
                  pressed && !itemDisabled ? tokenStyles.sideBarPressed : null,
                  pressed && !itemDisabled ? styles?.sideBarPressed : null,
                  itemDisabled ? tokenStyles.sideBarDisabled : null,
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
        <View testID="sidebar-list" style={[tokenStyles.sideBarList, styles?.sideBarList]}>
          {normalizedItems.map(item => {
            const itemDisabled = disabled || item.disabled === true;
            const isSelected = selectedValue === item.value;

            return (
              <Pressable
                {...rest}
                key={String(item.value)}
                testID={`sidebar-item-${String(item.value)}`}
                disabled={itemDisabled}
                onPress={event => {
                  if (itemDisabled || isSelected) {
                    return;
                  }

                  onPress?.(event, item.value);
                  setSelectedValue(item.value);
                }}
                style={({ pressed }) => [
                  tokenStyles.sideBar,
                  block ? tokenStyles.sideBarBlock : null,
                  styles?.sideBar,
                  isSelected ? tokenStyles.sideBarActive : null,
                  isSelected ? styles?.sideBarActive : null,
                  pressed && !itemDisabled ? tokenStyles.sideBarPressed : null,
                  pressed && !itemDisabled ? styles?.sideBarPressed : null,
                  itemDisabled ? tokenStyles.sideBarDisabled : null,
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
        <View testID="sidebar-panel" style={[tokenStyles.panel, styles?.panel]}>
          {renderContent(selectedItem, selectedIndex)}
        </View>
      ) : null}
    </View>
  );
}
