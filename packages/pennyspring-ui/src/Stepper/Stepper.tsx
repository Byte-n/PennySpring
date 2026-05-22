import type { ComponentSize } from '../shares/types';
import React from 'react';
import { Pressable, View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import { useControllableValue } from '../_hooks';
import { Text } from '../Text';
import type { AliasToken } from '@pennyspring/theme';
import type { StepperProps } from './types';

interface SizeStyleConfig {
  height: (token: AliasToken) => number;
  buttonWidth: (token: AliasToken) => number;
  fontSize: (token: AliasToken) => number;
  paddingHorizontal: (token: AliasToken) => number;
}

const SIZE_STYLE_MAP: Record<ComponentSize, SizeStyleConfig> = {
  small: {
    height: token => token.controlHeightSM,
    buttonWidth: token => token.controlHeightSM,
    fontSize: token => token.fontSizeSM,
    paddingHorizontal: token => token.controlPaddingHorizontalSM,
  },
  normal: {
    height: token => token.controlHeight,
    buttonWidth: token => token.controlHeight,
    fontSize: token => token.fontSize,
    paddingHorizontal: token => token.controlPaddingHorizontal,
  },
  large: {
    height: token => token.controlHeightLG,
    buttonWidth: token => token.controlHeightLG,
    fontSize: token => token.fontSizeLG,
    paddingHorizontal: token => token.controlPaddingHorizontal,
  },
};
const STEPPER_BUTTON_HIT_SLOP = 8;

const useStyles = createUseSheetStyle((token, size: ComponentSize) => {
  const config = SIZE_STYLE_MAP[size];

  return {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: token.lineWidth,
      borderColor: token.colorBorder,
      borderRadius: token.borderRadius,
      backgroundColor: token.colorBgContainer,
      height: config.height(token),
    },
    containerDisabled: {
      backgroundColor: token.colorBgContainerDisabled,
      borderColor: token.colorBorderDisabled,
    },
    button: {
      width: config.buttonWidth(token),
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonPressed: {
      backgroundColor: token.controlItemBgActive,
    },
    buttonText: {
      fontSize: config.fontSize(token),
      color: token.colorText,
    },
    buttonTextDisabled: {
      color: token.colorTextDisabled,
    },
    input: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderLeftWidth: token.lineWidth,
      borderRightWidth: token.lineWidth,
      borderColor: token.colorBorder,
      paddingHorizontal: config.paddingHorizontal(token),
    },
    inputDisabled: {
      borderColor: token.colorBorderDisabled,
    },
    inputText: {
      fontSize: config.fontSize(token),
      color: token.colorText,
    },
    inputTextDisabled: {
      color: token.colorTextDisabled,
    },
  };
});

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
  const [currentValue, setCurrentValue] = useControllableValue(
    defaultValue,
    value,
    onChange,
  );
  const isDisabled = disabled || readonly;
  const safeValue = currentValue ?? 0;
  const isAtMin = safeValue <= min;
  const isAtMax = safeValue >= max;

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
    <View
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
        hitSlop={STEPPER_BUTTON_HIT_SLOP}
      >
        <Text
          style={[
            tokenStyles.buttonText,
            styles?.buttonText,
            isDisabled || isAtMin ? tokenStyles.buttonTextDisabled : null,
          ]}
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
        hitSlop={STEPPER_BUTTON_HIT_SLOP}
      >
        <Text
          style={[
            tokenStyles.buttonText,
            styles?.buttonText,
            isDisabled || isAtMax ? tokenStyles.buttonTextDisabled : null,
          ]}
        >
          +
        </Text>
      </Pressable>
    </View>
  );
}
