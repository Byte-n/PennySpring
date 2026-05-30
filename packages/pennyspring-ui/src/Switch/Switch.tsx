import React from 'react';
import { Pressable } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@pennyspring/theme';
import { useControllableValue } from '../_hooks';
import { Text } from '../Text';
import { getCheckedOffset, useStyles } from './style';
import type { SwitchStyleOptions } from './style';
import type { SwitchProps } from './types';
import type { TextColor } from '../Text/types';

export function Switch({
  value,
  defaultValue = false,
  onChange,
  checkedText,
  uncheckedText,
  disabled = false,
  readonly = false,
  size = 'normal',
  style,
  styles,
  ...rest
}: SwitchProps) {
  const [resolvedChecked, setChecked] = useControllableValue(
    defaultValue,
    value,
    onChange,
  );
  const checked = resolvedChecked ?? false;
  const isDisabled = disabled || readonly;
  const currentText = checked ? checkedText : uncheckedText;
  const hasText = checkedText !== undefined || uncheckedText !== undefined;
  const styleOptions = React.useMemo<SwitchStyleOptions>(
    () => ({
      checked,
      disabled: isDisabled,
      hasText,
      size,
    }),
    [checked, hasText, isDisabled, size],
  );
  const tokenStyles = useStyles(styleOptions);
  const { token } = useTheme();

  const checkedOffset = getCheckedOffset(token, { hasText, size });
  const translateX = useSharedValue(checked ? checkedOffset : 0);
  const thumbAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  React.useEffect(() => {
    translateX.value = withTiming(checked ? checkedOffset : 0, {
      duration: token.motionDurationMid,
      easing: Easing.bezier(...token.motionEaseInOut),
    });
  }, [checked, checkedOffset, token, translateX]);

  const textColor: TextColor = isDisabled
    ? 'disabled'
    : checked
      ? 'lightSolid'
      : 'secondary';

  function handlePress(): void {
    if (isDisabled) {
      return;
    }

    setChecked(!checked);
  }

  return (
    <Pressable
      {...rest}
      testID="switch"
      disabled={isDisabled}
      onPress={handlePress}
      style={({ pressed }) => [
        tokenStyles.track,
        styles?.track,
        checked ? tokenStyles.trackChecked : null,
        disabled ? tokenStyles.trackDisabled : null,
        readonly ? tokenStyles.trackReadonly : null,
        pressed && !isDisabled ? tokenStyles.trackPressed : null,
        style,
      ]}
    >
      {currentText !== undefined ? (
        <Text
          color={textColor}
          numberOfLines={1}
          size="sm"
          style={[tokenStyles.text, styles?.text]}
          testID="switch-text"
          weight="strong"
        >
          {currentText}
        </Text>
      ) : null}
      <Animated.View
        testID="switch-thumb"
        style={[
          tokenStyles.thumb,
          styles?.thumb,
          disabled ? tokenStyles.thumbDisabled : null,
          thumbAnimatedStyle,
        ]}
      />
    </Pressable>
  );
}
