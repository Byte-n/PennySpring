import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../Text';
import { useControllableValue } from '../_hooks';
import { useStyles } from './style';
import type { ReactNode } from 'react';
import type { GestureResponderEvent } from 'react-native';
import type { TextColor, TextSize } from '../Text';
import type { ComponentSize } from '../shares/types';
import type {
  SegmentedOption,
  SegmentedProps,
  SegmentedValue,
} from './types';

interface NormalizedSegmentedOption {
  value: SegmentedValue;
  labelText?: string;
  label?: ReactNode | null;
  icon?: ReactNode;
  disabled?: boolean;
}

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
    labelText: String(option),
  };
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

function getOptionLabel(option: NormalizedSegmentedOption): ReactNode {
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
  size: TextSize,
  weight: 'regular' | 'strong',
  color: TextColor,
  style: SegmentedProps['styles'],
) {
  if (label === undefined || label === null || label === false) {
    return null;
  }

  if (typeof label === 'string' || typeof label === 'number') {
    return (
      <Text color={color} size={size} style={style?.label} weight={weight}>
        {label}
      </Text>
    );
  }

  return label;
}

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
          disabled ? tokenStyles.trackDisabled : null,
          styles?.track,
        ]}
      >
        {normalizedOptions.map(option => {
          const isSelected = option.value === selectedValue;
          const isDisabled = disabled || option.disabled === true;
          const labelColor: TextColor = isDisabled
            ? 'disabled'
            : isSelected
              ? 'heading'
              : 'secondary';

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
                isSelected ? tokenStyles.itemSelected : null,
                pressed && !isDisabled ? tokenStyles.itemPressed : null,
                isDisabled ? tokenStyles.itemDisabled : null,
                styles?.item,
              ]}
            >
              <View style={[tokenStyles.content, styles?.content]}>
                {option.icon === undefined ? null : (
                  <View
                    style={[
                      tokenStyles.icon,
                      isSelected ? tokenStyles.iconSelected : null,
                      isDisabled ? tokenStyles.iconDisabled : null,
                      styles?.icon,
                    ]}
                  >
                    {option.icon}
                  </View>
                )}
                {renderLabel(
                  getOptionLabel(option),
                  toTextSize(size),
                  'regular',
                  labelColor,
                  styles,
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
