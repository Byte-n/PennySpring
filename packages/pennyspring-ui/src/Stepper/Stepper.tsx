import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@pennyspring/theme';
import { useControllableValue } from '../_hooks';
import { Icon } from '../Icon';
import { Row } from '../Row';
import { Text } from '../Text';
import { getSizeConfig, useStyles, SIZE_TO_TEXT_SIZE } from './style';
import type { TextColor } from '../Text/types';
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
  unitText,
  disabled = false,
  readonly = false,
  size = 'normal',
  style,
  styles,
}: StepperProps) {
  const tokenStyles = useStyles(size);
  const { token } = useTheme();
  const hitSlop = token.sizeXS;
  const sizeConfig = getSizeConfig(size);
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
  const valueColor: TextColor = disabled
    ? 'quaternary'
    : readonly
      ? 'secondary'
      : 'base';

  function getButtonColor(atBoundary: boolean): TextColor {
    return isDisabled || atBoundary ? 'quaternary' : 'base';
  }

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
        <Icon
          color={getButtonColor(isAtMin)}
          icon="minus"
          size={sizeConfig.iconSize}
          style={styles?.buttonText}
        />
      </Pressable>
      <View style={[tokenStyles.input, styles?.input]}>
        <Text
          testID="stepper-input"
          color={valueColor}
          size={textSize}
          style={[tokenStyles.inputText, styles?.inputText]}
          weight="strong"
        >
          {String(safeValue)}
        </Text>
        {unitText === undefined ? null : (
          <Text color="tertiary" size="xs" style={tokenStyles.unit} weight="medium">
            {unitText}
          </Text>
        )}
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
        <Icon
          color={getButtonColor(isAtMax)}
          icon="plus"
          size={sizeConfig.iconSize}
          style={styles?.buttonText}
        />
      </Pressable>
    </Row>
  );
}
