import type { ComponentSize } from '../shares/types';
import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../Text';
import { useControllableValue } from '../_hooks';
import type { ReactNode } from 'react';
import type { StyleProp, TextStyle } from 'react-native';
import type { TextColor, TextSize, TextWeight } from '../Text';
import { useStyles } from './style';
import type {
  CheckboxGroupOption,
  CheckboxGroupProps,
  CheckboxGroupStyles,
  CheckboxProps,
  CheckboxValue,
} from './types';

function toTextSize(size: ComponentSize): TextSize {
  if (size === 'small') {
    return 'sm';
  }

  if (size === 'large') {
    return 'lg';
  }

  return 'md';
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

function includesValue(
  values: readonly CheckboxValue[],
  optionValue: CheckboxValue,
): boolean {
  return values.includes(optionValue);
}

function getOptionLabel(option: CheckboxGroupOption): ReactNode {
  if (option.label !== undefined) {
    return option.label;
  }

  if (option.labelText !== undefined) {
    return option.labelText;
  }

  return option.value;
}

interface CheckboxControlProps
  extends Omit<CheckboxProps, 'style' | 'styles'> {
  block?: boolean;
  checked: boolean;
  controlStyle?: CheckboxGroupStyles['option'];
  optionStyle?: CheckboxGroupProps['styles'];
  rootStyle?: CheckboxProps['style'];
  testID: string;
  onToggle: () => void;
}

function CheckboxControl({
  block = false,
  checked,
  children,
  controlStyle,
  disabled = false,
  displayType = 'default',
  indeterminate = false,
  optionStyle,
  readonly = false,
  rootStyle,
  size = 'normal',
  testID,
  onToggle,
  ...rest
}: CheckboxControlProps) {
  const tokenStyles = useStyles({
    block,
    direction: 'horizontal',
    displayType,
    size,
  });
  const isDisabled = disabled || readonly;
  const isVisuallyChecked = checked || indeterminate;
  const shouldRenderIndicator = displayType !== 'button';
  const labelColor: TextColor = isDisabled ? 'disabled' : 'default';
  const label = renderLabel(
    children,
    [
      tokenStyles.label,
      checked ? tokenStyles.labelChecked : null,
      isDisabled ? tokenStyles.labelDisabled : null,
      optionStyle?.label,
    ],
    size,
    'regular',
    labelColor,
  );

  function handlePress(): void {
    if (isDisabled) {
      return;
    }

    onToggle();
  }

  return (
    <Pressable
      {...rest}
      disabled={isDisabled}
      testID={testID}
      onPress={handlePress}
      style={({ pressed }) => [
        tokenStyles.control,
        checked ? tokenStyles.controlChecked : null,
        pressed && !isDisabled ? tokenStyles.controlPressed : null,
        isDisabled ? tokenStyles.controlDisabled : null,
        controlStyle,
        rootStyle,
      ]}
    >
      <View style={[tokenStyles.content, optionStyle?.content]}>
        {shouldRenderIndicator ? (
          <View
            testID={
              testID === 'checkbox-control'
                ? 'checkbox-indicator'
                : `${testID}-indicator`
            }
            style={[
              tokenStyles.indicator,
              isVisuallyChecked ? tokenStyles.indicatorChecked : null,
              readonly ? tokenStyles.indicatorReadonly : null,
              disabled ? tokenStyles.indicatorDisabled : null,
              optionStyle?.indicator,
            ]}
          >
            {isVisuallyChecked ? (
              <View
                testID={
                  testID === 'checkbox-control'
                    ? 'checkbox-mark'
                    : `${testID}-mark`
                }
                style={[
                  tokenStyles.mark,
                  indeterminate ? tokenStyles.markIndeterminate : null,
                  optionStyle?.mark,
                ]}
              />
            ) : null}
          </View>
        ) : null}
        {label}
      </View>
    </Pressable>
  );
}

function BaseCheckbox({
  value,
  defaultValue = false,
  onChange,
  disabled = false,
  readonly = false,
  indeterminate = false,
  children,
  size = 'normal',
  displayType = 'default',
  style,
  styles,
  ...rest
}: CheckboxProps) {
  const [checked, setChecked] = useControllableValue(
    defaultValue,
    value,
    onChange,
  );

  function handleToggle(): void {
    setChecked(!checked);
  }

  return (
    <CheckboxControl
      {...rest}
      checked={Boolean(checked)}
      disabled={disabled}
      displayType={displayType}
      indeterminate={indeterminate}
      optionStyle={styles}
      readonly={readonly}
      rootStyle={style}
      size={size}
      testID="checkbox-control"
      onToggle={handleToggle}
    >
      {children ?? null}
    </CheckboxControl>
  );
}

function CheckboxGroup({
  value,
  defaultValue = [],
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
}: CheckboxGroupProps) {
  const tokenStyles = useStyles({
    block,
    direction,
    displayType,
    size,
  });
  const [selectedValues, setSelectedValues] = useControllableValue(
    defaultValue,
    value,
    onChange,
  );
  const safeSelectedValues = useMemo(
    () => selectedValues ?? [],
    [selectedValues],
  );

  function toggleOption(option: CheckboxGroupOption): void {
    if (disabled || readonly || option.disabled === true) {
      return;
    }

    const isSelected = includesValue(safeSelectedValues, option.value);
    const nextValue = isSelected
      ? safeSelectedValues.filter(item => item !== option.value)
      : [...safeSelectedValues, option.value];

    setSelectedValues(nextValue);
  }

  return (
    <View testID="checkbox-group-root" style={[tokenStyles.groupRoot, style]}>
      {options.map(option => {
        const isSelected = includesValue(safeSelectedValues, option.value);

        return (
          <CheckboxControl
            {...rest}
            key={String(option.value)}
            block={block}
            checked={isSelected}
            controlStyle={styles?.option}
            disabled={disabled || option.disabled === true}
            displayType={displayType}
            optionStyle={styles}
            readonly={readonly}
            size={size}
            testID={`checkbox-group-option-${String(option.value)}`}
            onToggle={() => {
              toggleOption(option);
            }}
          >
            {getOptionLabel(option)}
          </CheckboxControl>
        );
      })}
    </View>
  );
}

type CheckboxComponent = typeof BaseCheckbox & {
  Group: typeof CheckboxGroup;
};

export const Checkbox = BaseCheckbox as CheckboxComponent;
Checkbox.Group = CheckboxGroup;
