import type { ComponentSize } from '../shares/types';
import React from 'react';
import { Pressable, View } from 'react-native';
import { Column } from '../Column';
import { Row } from '../Row';
import { Text } from '../Text';
import { useControllableValue } from '../_hooks';
import { useStyles } from './style';
import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { TextColor, TextSize, TextWeight } from '../Text';
import type {
  RadioDisplayType,
  RadioGroupOption,
  RadioGroupProps,
  RadioGroupValue,
  RadioProps,
} from './types';

interface RadioOptionState {
  block: boolean;
  disabled: boolean;
  displayType: RadioDisplayType;
  pressed: boolean;
  readonly: boolean;
  selected: boolean;
}

function toTextSize(size: ComponentSize): TextSize {
  if (size === 'small') {
    return 'sm';
  }

  if (size === 'large') {
    return 'lg';
  }

  return 'md';
}

function getOptionLabel(option: RadioGroupOption): ReactNode {
  if (option.label !== undefined) {
    return option.label;
  }

  if (option.labelText !== undefined) {
    return option.labelText;
  }

  return option.value;
}

function renderLabel(
  label: ReactNode,
  style: StyleProp<TextStyle>,
  size: ComponentSize,
  weight: TextWeight,
  color: TextColor,
) {
  if (label === undefined || label === null || label === false) {
    return null;
  }

  if (typeof label === 'string' || typeof label === 'number') {
    return (
      <Text color={color} size={toTextSize(size)} style={style} weight={weight}>
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
        selected ? tokenStyles.controlSelected : null,
        disabled ? tokenStyles.controlDisabled : null,
        styles?.control,
      ]}
    >
      {selected ? (
        <View
          style={[
            tokenStyles.indicator,
            disabled ? tokenStyles.indicatorDisabled : null,
            styles?.indicator,
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
    displayType,
    size,
  });
  const [selectedValue, setSelectedValue] = useControllableValue(
    defaultValue,
    value,
    onChange,
  );
  const selected = selectedValue === true;
  const isDisabled = disabled || readonly;
  const labelColor: TextColor = isDisabled ? 'disabled' : selected ? 'default' : 'default';

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
      <Row style={[tokenStyles.content, styles?.content]}>
        {renderLabel(
          children,
          [
            tokenStyles.label,
            styles?.label,
          ],
          size,
          'regular',
          labelColor,
        )}
      </Row>
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
  const tokenStyles = useStyles({ block, displayType, size });
  const [selectedValue, setSelectedValue] = useControllableValue(
    defaultValue,
    value,
    onChange,
  );
  const Layout = direction === 'horizontal' ? Row : Column;

  function handlePress(optionValue: RadioGroupValue, isDisabled: boolean) {
    if (isDisabled || readonly || optionValue === selectedValue) {
      return;
    }

    setSelectedValue(optionValue);
  }

  return (
    <Layout
      testID="radio-group"
      align={direction === 'horizontal' ? 'center' : undefined}
      gap="small"
      style={[tokenStyles.groupRoot, style]}
    >
      {options.map(option => {
        const selected = option.value === selectedValue;
        const optionDisabled = disabled || option.disabled === true;
        const isOptionDisabled = optionDisabled || readonly;
        const labelColor: TextColor = isOptionDisabled
          ? 'disabled'
          : 'default';

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
            <Row style={[tokenStyles.content, styles?.content]}>
              {renderLabel(
                getOptionLabel(option),
                [
                  tokenStyles.label,
                  styles?.label,
                ],
                size,
                'regular',
                labelColor,
              )}
            </Row>
          </Pressable>
        );
      })}
    </Layout>
  );
}

export const Radio = Object.assign(RadioComponent, {
  Group: RadioGroup,
});
