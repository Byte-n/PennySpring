import type { ComponentSize } from '../shares/types';
import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import { Text } from '../Text';
import { useControllableValue } from '../_hooks';
import type {
  AliasToken } from '@pennyspring/theme';
import type { ReactNode } from 'react';
import type { GestureResponderEvent,
  StyleProp,
  TextStyle } from 'react-native';
import type {
  SegmentedOption,
  SegmentedProps,
  SegmentedValue,
} from './types';

interface NormalizedSegmentedOption {
  value: SegmentedValue;
  label?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

interface SegmentedStyleOptions {
  block: boolean;
  disabled: boolean;
  size: ComponentSize;
}

interface SizeStyleConfig {
  minHeight: (token: AliasToken) => number;
  itemPaddingHorizontal: (token: AliasToken) => number;
  itemPaddingVertical: (token: AliasToken) => number;
  gap: (token: AliasToken) => number;
  fontSize: (token: AliasToken) => number;
  lineHeight: (token: AliasToken) => number;
}

const SIZE_STYLE_MAP: Record<ComponentSize, SizeStyleConfig> = {
  small: {
    minHeight: token => token.controlHeightSM,
    itemPaddingHorizontal: token => token.controlPaddingHorizontalSM,
    itemPaddingVertical: token => token.controlPaddingHorizontalSM / 2,
    gap: token => token.sizeXXS,
    fontSize: token => token.fontSizeSM,
    lineHeight: token => token.lineHeightSM,
  },
  normal: {
    minHeight: token => token.controlHeight,
    itemPaddingHorizontal: token => token.controlPaddingHorizontal,
    itemPaddingVertical: token => token.controlPaddingHorizontal / 2,
    gap: token => token.sizeXXS,
    fontSize: token => token.fontSize,
    lineHeight: token => token.lineHeight,
  },
  large: {
    minHeight: token => token.controlHeightLG,
    itemPaddingHorizontal: token => token.paddingMD,
    itemPaddingVertical: token => token.paddingMD / 2,
    gap: token => token.sizeXS,
    fontSize: token => token.fontSizeLG,
    lineHeight: token => token.lineHeightLG,
  },
};

function isLabeledOption(
  option: SegmentedOption,
): option is Exclude<SegmentedOption, SegmentedValue> {
  return typeof option === 'object' && option !== null;
}

function normalizeOption(option: SegmentedOption): NormalizedSegmentedOption {
  if (isLabeledOption(option)) {
    return option;
  }

  return {
    value: option,
    label: option,
  };
}

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
  (token, { block, disabled, size }: SegmentedStyleOptions) => {
    const sizeConfig = SIZE_STYLE_MAP[size];

    return {
      root: {
        alignSelf: block ? 'stretch' : 'flex-start',
        width: block ? '100%' : undefined,
      },
      track: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: sizeConfig.minHeight(token),
        padding: token.paddingXXS,
        borderRadius: token.borderRadius,
        backgroundColor: disabled
          ? token.colorBgContainerDisabled
          : token.colorFillTertiary,
      },
      trackDisabled: {
        borderColor: token.colorBorderDisabled,
      },
      item: {
        flex: block ? 1 : undefined,
        minHeight: sizeConfig.minHeight(token) - token.paddingXXS * 2,
        paddingHorizontal: sizeConfig.itemPaddingHorizontal(token),
        paddingVertical: sizeConfig.itemPaddingVertical(token),
        borderRadius: token.borderRadiusSM,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
      },
      itemSelected: {
        backgroundColor: token.colorBgContainer,
      },
      itemPressed: {
        backgroundColor: token.controlItemBgActive,
      },
      itemDisabled: {
        backgroundColor: 'transparent',
      },
      content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: sizeConfig.gap(token),
      },
      icon: {
        alignItems: 'center',
        justifyContent: 'center',
      },
      iconSelected: {
        opacity: 1,
      },
      iconDisabled: {
        opacity: token.opacityLoading,
      },
      label: {
        fontFamily: token.fontFamily,
        fontSize: sizeConfig.fontSize(token),
        lineHeight: sizeConfig.lineHeight(token),
        color: token.colorTextSecondary,
        fontWeight: String(token.fontWeightRegular) as TextStyle['fontWeight'],
      },
      labelSelected: {
        color: token.colorPrimaryText,
        fontWeight: String(token.fontWeightStrong) as TextStyle['fontWeight'],
      },
      labelDisabled: {
        color: token.colorTextDisabled,
      },
    };
  },
);

export function Segmented({
  options = [],
  value,
  defaultValue,
  onChange,
  disabled = false,
  block = false,
  size = 'normal',
  style,
  styles,
  onPress,
  ...rest
}: SegmentedProps) {
  const tokenStyles = useStyles({ block, disabled, size });
  const [selectedValue, setSelectedValue] = useControllableValue(
    defaultValue,
    value,
    onChange,
  );
  const normalizedOptions = useMemo(
    () => options.map(normalizeOption),
    [options],
  );

  function handlePress(
    event: GestureResponderEvent,
    optionValue: SegmentedValue,
    isDisabled: boolean,
  ) {
    if (isDisabled || optionValue === selectedValue) {
      return;
    }

    onPress?.(event, optionValue);
    setSelectedValue(optionValue);
  }

  return (
    <View testID="segmented-root" style={[tokenStyles.root, style]}>
      <View
        style={[
          tokenStyles.track,
          styles?.track,
          disabled ? tokenStyles.trackDisabled : null,
        ]}
      >
        {normalizedOptions.map(option => {
          const isSelected = option.value === selectedValue;
          const isDisabled = disabled || option.disabled === true;

          return (
            <Pressable
              {...rest}
              key={String(option.value)}
              testID={`segmented-item-${String(option.value)}`}
              disabled={isDisabled}
              onPress={event => {
                handlePress(event, option.value, isDisabled);
              }}
              style={({ pressed }) => [
                tokenStyles.item,
                styles?.item,
                isSelected ? tokenStyles.itemSelected : null,
                pressed && !isDisabled ? tokenStyles.itemPressed : null,
                isDisabled ? tokenStyles.itemDisabled : null,
              ]}
            >
              <View style={[tokenStyles.content, styles?.content]}>
                {option.icon === undefined ? null : (
                  <View
                    style={[
                      tokenStyles.icon,
                      styles?.icon,
                      isSelected ? tokenStyles.iconSelected : null,
                      isDisabled ? tokenStyles.iconDisabled : null,
                    ]}
                  >
                    {option.icon}
                  </View>
                )}
                {renderLabel(
                  option.label,
                  [
                    tokenStyles.label,
                    styles?.label,
                    isSelected ? tokenStyles.labelSelected : null,
                    isDisabled ? tokenStyles.labelDisabled : null,
                  ],
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
