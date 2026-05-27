import type { ComponentSize } from '../shares/types';
import React from 'react';
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
import type {
  RadioDisplayType,
  RadioGroupDirection,
  RadioGroupProps,
  RadioGroupValue,
  RadioProps,
} from './types';

interface SizeStyleConfig {
  minHeight: (token: AliasToken) => number;
  controlSize: (token: AliasToken) => number;
  indicatorSize: (token: AliasToken) => number;
  paddingHorizontal: (token: AliasToken) => number;
  paddingVertical: (token: AliasToken) => number;
  gap: (token: AliasToken) => number;
  fontSize: (token: AliasToken) => number;
  lineHeight: (token: AliasToken) => number;
}

interface RadioStyleOptions {
  block: boolean;
  direction: RadioGroupDirection;
  displayType: RadioDisplayType;
  size: ComponentSize;
}

interface RadioOptionState {
  block: boolean;
  disabled: boolean;
  displayType: RadioDisplayType;
  pressed: boolean;
  readonly: boolean;
  selected: boolean;
}

const SIZE_STYLE_MAP: Record<ComponentSize, SizeStyleConfig> = {
  small: {
    minHeight: token => token.controlHeightSM,
    controlSize: token => token.fontSize,
    indicatorSize: token => token.sizeXXS,
    paddingHorizontal: token => token.controlPaddingHorizontalSM,
    paddingVertical: token => token.controlPaddingHorizontalSM / 2,
    gap: token => token.sizeXS,
    fontSize: token => token.fontSizeSM,
    lineHeight: token => token.lineHeightSM,
  },
  normal: {
    minHeight: token => token.controlHeight,
    controlSize: token => token.fontSizeLG,
    indicatorSize: token => token.sizeXS,
    paddingHorizontal: token => token.controlPaddingHorizontal,
    paddingVertical: token => token.controlPaddingHorizontal / 2,
    gap: token => token.sizeSM,
    fontSize: token => token.fontSize,
    lineHeight: token => token.lineHeight,
  },
  large: {
    minHeight: token => token.controlHeightLG,
    controlSize: token => token.fontSizeXL,
    indicatorSize: token => token.sizeSM,
    paddingHorizontal: token => token.paddingMD,
    paddingVertical: token => token.paddingMD / 2,
    gap: token => token.sizeSM,
    fontSize: token => token.fontSizeLG,
    lineHeight: token => token.lineHeightLG,
  },
};

const useStyles = createUseSheetStyle(
  (token, { block, direction, displayType, size }: RadioStyleOptions) => {
    const sizeConfig = SIZE_STYLE_MAP[size];
    const controlSize = sizeConfig.controlSize(token);

    return {
      group: {
        flexDirection: direction === 'horizontal' ? 'row' : 'column',
        alignItems: direction === 'horizontal' ? 'center' : 'stretch',
        alignSelf: block ? 'stretch' : 'flex-start',
        width: block ? '100%' : undefined,
        gap: sizeConfig.gap(token),
      },
      option: {
        minHeight: sizeConfig.minHeight(token),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: sizeConfig.gap(token),
      },
      optionButton: {
        justifyContent: 'center',
        paddingHorizontal: sizeConfig.paddingHorizontal(token),
        paddingVertical: sizeConfig.paddingVertical(token),
        borderWidth: token.lineWidth,
        borderColor: token.colorBorder,
        borderRadius: token.borderRadius,
        backgroundColor: token.colorBgContainer,
      },
      optionButtonBlock: {
        flex: 1,
      },
      optionButtonSelected: {
        borderColor: token.colorPrimary,
        backgroundColor: token.colorPrimaryBg,
      },
      optionPressed: {
        backgroundColor:
          displayType === 'button'
            ? token.controlItemBgActive
            : token.colorBgTextActive,
      },
      optionDisabled: {
        backgroundColor:
          displayType === 'button'
            ? token.colorBgContainerDisabled
            : 'transparent',
        borderColor:
          displayType === 'button' ? token.colorBorderDisabled : undefined,
      },
      control: {
        width: controlSize,
        height: controlSize,
        borderRadius: controlSize,
        borderWidth: token.lineWidth,
        borderColor: token.colorBorder,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: token.colorBgContainer,
      },
      controlSelected: {
        borderColor: token.colorPrimary,
      },
      controlDisabled: {
        borderColor: token.colorBorderDisabled,
        backgroundColor: token.colorBgContainerDisabled,
      },
      indicator: {
        width: sizeConfig.indicatorSize(token),
        height: sizeConfig.indicatorSize(token),
        borderRadius: sizeConfig.indicatorSize(token),
        backgroundColor: token.colorPrimary,
      },
      indicatorDisabled: {
        backgroundColor: token.colorTextDisabled,
      },
      content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: displayType === 'button' ? 'center' : 'flex-start',
      },
      label: {
        fontFamily: token.fontFamily,
        fontSize: sizeConfig.fontSize(token),
        lineHeight: sizeConfig.lineHeight(token),
        color: token.colorText,
        fontWeight: String(token.fontWeightRegular) as TextStyle['fontWeight'],
      },
      labelSelected: {
        color: token.colorPrimaryText,
      },
      labelDisabled: {
        color: token.colorTextDisabled,
      },
    };
  },
);

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

function getOptionStyle(
  tokenStyles: ReturnType<typeof useStyles>,
  state: RadioOptionState,
  style?: StyleProp<ViewStyle>,
) {
  return [
    tokenStyles.option,
    state.displayType === 'button' ? tokenStyles.optionButton : null,
    state.block && state.displayType === 'button'
      ? tokenStyles.optionButtonBlock
      : null,
    state.selected && state.displayType === 'button'
      ? tokenStyles.optionButtonSelected
      : null,
    state.pressed && !state.disabled && !state.readonly
      ? tokenStyles.optionPressed
      : null,
    state.disabled ? tokenStyles.optionDisabled : null,
    style,
  ];
}

function renderControl(
  tokenStyles: ReturnType<typeof useStyles>,
  selected: boolean,
  disabled: boolean,
  styles?: Pick<NonNullable<RadioProps['styles']>, 'control' | 'indicator'>,
) {
  return (
    <View
      style={[
        tokenStyles.control,
        styles?.control,
        selected ? tokenStyles.controlSelected : null,
        disabled ? tokenStyles.controlDisabled : null,
      ]}
    >
      {selected ? (
        <View
          style={[
            tokenStyles.indicator,
            styles?.indicator,
            disabled ? tokenStyles.indicatorDisabled : null,
          ]}
        />
      ) : null}
    </View>
  );
}

function RadioComponent({
  value,
  defaultValue,
  onChange,
  disabled = false,
  readonly = false,
  children,
  size = 'normal',
  displayType = 'default',
  style,
  styles,
  ...rest
}: RadioProps) {
  const tokenStyles = useStyles({
    block: false,
    direction: 'horizontal',
    displayType,
    size,
  });
  const [selectedValue, setSelectedValue] = useControllableValue(
    defaultValue,
    value,
    onChange,
  );
  const selected = selectedValue === true;

  function handlePress() {
    if (disabled || readonly || selected) {
      return;
    }

    setSelectedValue(true);
  }

  return (
    <Pressable
      {...rest}
      testID="radio"
      disabled={disabled}
      onPress={handlePress}
      style={({ pressed }) =>
        getOptionStyle(
          tokenStyles,
          {
            block: false,
            disabled,
            displayType,
            pressed,
            readonly,
            selected,
          },
          style,
        )
      }
    >
      {displayType === 'default'
        ? renderControl(tokenStyles, selected, disabled, styles)
        : null}
      <View style={[tokenStyles.content, styles?.content]}>
        {renderLabel(children, [
          tokenStyles.label,
          styles?.label,
          selected ? tokenStyles.labelSelected : null,
          disabled ? tokenStyles.labelDisabled : null,
        ])}
      </View>
    </Pressable>
  );
}

export function RadioGroup({
  value,
  defaultValue,
  onChange,
  options = [],
  disabled = false,
  readonly = false,
  displayType = 'default',
  size = 'normal',
  block = false,
  direction = 'horizontal',
  style,
  styles,
  ...rest
}: RadioGroupProps) {
  const tokenStyles = useStyles({ block, direction, displayType, size });
  const [selectedValue, setSelectedValue] = useControllableValue(
    defaultValue,
    value,
    onChange,
  );

  function handlePress(optionValue: RadioGroupValue, isDisabled: boolean) {
    if (isDisabled || readonly || optionValue === selectedValue) {
      return;
    }

    setSelectedValue(optionValue);
  }

  return (
    <View testID="radio-group" style={[tokenStyles.group, style]}>
      {options.map(option => {
        const selected = option.value === selectedValue;
        const optionDisabled = disabled || option.disabled === true;

        return (
          <Pressable
            {...rest}
            key={String(option.value)}
            testID={`radio-group-option-${String(option.value)}`}
            disabled={optionDisabled}
            onPress={() => {
              handlePress(option.value, optionDisabled);
            }}
            style={({ pressed }) =>
              getOptionStyle(
                tokenStyles,
                {
                  block,
                  disabled: optionDisabled,
                  displayType,
                  pressed,
                  readonly,
                  selected,
                },
                styles?.option,
              )
            }
          >
            {displayType === 'default'
              ? renderControl(tokenStyles, selected, optionDisabled, styles)
              : null}
            <View style={[tokenStyles.content, styles?.content]}>
              {renderLabel(option.label, [
                tokenStyles.label,
                styles?.label,
                selected ? tokenStyles.labelSelected : null,
                optionDisabled ? tokenStyles.labelDisabled : null,
              ])}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export const Radio = Object.assign(RadioComponent, {
  Group: RadioGroup,
});
