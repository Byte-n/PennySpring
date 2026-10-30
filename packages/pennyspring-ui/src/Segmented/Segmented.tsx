import React, { useMemo } from 'react';
import { Pressable } from 'react-native';
import { Column } from '../Column';
import { Row } from '../Row';
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
import { useFieldProps } from '../Form/hooks/useFieldProps.ts';

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
    return 'xs';
  }

  if (size === 'large') {
    return 'md';
  }

  return 'sm';
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
  weight: 'regular' | 'semibold',
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

export function Segmented(rawProps: SegmentedProps) {
  const {
    options = [],
    value,
    defaultValue,
    onChange,
    disabled,
    block = false,
    size = 'normal',
    style,
    styles,
    onPress,
    ...rest
  } = rawProps;
  const field = useFieldProps<SegmentedValue>({
    value,
    onChange,
    disabled,
  });
  const resolvedDisabled = field.disabled === true;
  const tokenStyles = useStyles({ block, disabled: resolvedDisabled, size });
  const [selectedValue, setSelectedValue] = useControllableValue(
    defaultValue,
    field.value,
    field.onChange,
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
    <Column style={[tokenStyles.root, style]}>
      <Row style={[tokenStyles.track, styles?.track]}>
        {normalizedOptions.map(option => {
          const isSelected = option.value === selectedValue;
          const isDisabled = resolvedDisabled || option.disabled === true;
          const labelColor: TextColor = isDisabled
            ? isSelected
              ? 'tertiary'
              : 'quaternary'
            : isSelected
              ? 'default'
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
                isSelected && isDisabled
                  ? tokenStyles.itemSelectedDisabled
                  : null,
                isSelected && !isDisabled
                  ? tokenStyles.itemSelectedRaised
                  : null,
                pressed && !isSelected && !isDisabled
                  ? tokenStyles.itemPressed
                  : null,
                styles?.item,
              ]}
            >
              <Row style={[tokenStyles.content, styles?.content]}>
                {option.icon === undefined ? null : (
                  <Column
                    style={[
                      tokenStyles.icon,
                      isDisabled ? tokenStyles.iconDisabled : null,
                      styles?.icon,
                    ]}
                  >
                    {option.icon}
                  </Column>
                )}
                {renderLabel(
                  getOptionLabel(option),
                  toTextSize(size),
                  isSelected ? 'semibold' : 'regular',
                  labelColor,
                  styles,
                )}
              </Row>
            </Pressable>
          );
        })}
      </Row>
    </Column>
  );
}
