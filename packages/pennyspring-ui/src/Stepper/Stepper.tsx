import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@pennyspring/theme';
import { useControllableValue } from '../_hooks';
import { Row } from '../Row';
import { Text } from '../Text';
import { useStyles, SIZE_TO_TEXT_SIZE } from './style';
import type { StepperProps } from './types';

function clampValue(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function Stepper({
  value,
  defaultValue = 0,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  disabled = false,
  readonly = false,
  size = 'normal',
  style,
  styles,
}: StepperProps) {
  const tokenStyles = useStyles(size);
  const { token } = useTheme();
  const hitSlop = token.paddingSM;
  const [currentValue, setCurrentValue] = useControllableValue(
    defaultValue,
    value,
    onChange,
  );
  const isDisabled = disabled || readonly;
  const safeValue = currentValue ?? 0;
  const isAtMin = safeValue <= min;
  const isAtMax = safeValue >= max;
  const textSize = SIZE_TO_TEXT_SIZE[size];

  function handleIncrement(): void {
    if (isDisabled || isAtMax) {
      return;
    }
    setCurrentValue(clampValue(safeValue + step, min, max));
  }

  function handleDecrement(): void {
    if (isDisabled || isAtMin) {
      return;
    }
    setCurrentValue(clampValue(safeValue - step, min, max));
  }

  return (
    <Row
      align="center"
      style={[
        tokenStyles.container,
        disabled ? tokenStyles.containerDisabled : null,
        style,
      ]}
    >
      <Pressable
        testID="stepper-decrement"
        disabled={isDisabled || isAtMin}
        onPress={handleDecrement}
        style={({ pressed }) => [
          tokenStyles.button,
          styles?.button,
          pressed && !isDisabled && !isAtMin
            ? tokenStyles.buttonPressed
            : null,
        ]}
        hitSlop={hitSlop}
      >
        <Text
          size={textSize}
          color={isDisabled || isAtMin ? 'disabled' : 'base'}
          style={styles?.buttonText}
        >
          {'−'}
        </Text>
      </Pressable>
      <View
        style={[
          tokenStyles.input,
          styles?.input,
          disabled ? tokenStyles.inputDisabled : null,
        ]}
      >
        <Text
          testID="stepper-input"
          size={textSize}
          color={disabled ? 'disabled' : 'base'}
          style={[
            tokenStyles.inputText,
            styles?.inputText,
            disabled ? tokenStyles.inputTextDisabled : null,
          ]}
        >
          {String(safeValue)}
        </Text>
      </View>
      <Pressable
        testID="stepper-increment"
        disabled={isDisabled || isAtMax}
        onPress={handleIncrement}
        style={({ pressed }) => [
          tokenStyles.button,
          styles?.button,
          pressed && !isDisabled && !isAtMax
            ? tokenStyles.buttonPressed
            : null,
        ]}
        hitSlop={hitSlop}
      >
        <Text
          size={textSize}
          color={isDisabled || isAtMax ? 'disabled' : 'base'}
          style={styles?.buttonText}
        >
          +
        </Text>
      </Pressable>
    </Row>
  );
}
