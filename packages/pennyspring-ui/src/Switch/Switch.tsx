import React from 'react';
import { Pressable, View } from 'react-native';
import type { GestureResponderEvent } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@pennyspring/theme';
import { useControllableValue } from '../_hooks';
import { Text } from '../Text';
import { getThumbOffset, useStyles } from './style';
import type { SwitchProps } from './types';
import type { TextColor } from '../Text/types';
import { useFieldProps } from '../Form/hooks/useFieldProps.ts';

/** 按压时滑块放大 8%，轨道保持不动。 */
const PRESS_SCALE_DELTA = 0.08;

export function Switch(rawProps: SwitchProps) {
  const {
    value,
    defaultValue = false,
    onChange,
    checkedText,
    uncheckedText,
    disabled,
    readonly,
    size = 'normal',
    style,
    styles,
    onPressIn,
    onPressOut,
    ...rest
  } = rawProps;
  const field = useFieldProps<boolean>({
    value,
    onChange,
    disabled,
    readonly,
  });
  const resolvedDisabled = field.disabled === true;
  const resolvedReadonly = field.readonly === true;
  const [resolvedChecked, setChecked] = useControllableValue(
    defaultValue,
    field.value,
    field.onChange,
  );
  const checked = resolvedChecked ?? false;
  const isDisabled = resolvedDisabled || resolvedReadonly;
  const hasText = checkedText !== undefined && uncheckedText !== undefined;
  const tokenStyles = useStyles({
    checked,
    disabled: resolvedDisabled,
    readonly: resolvedReadonly,
    size,
  });
  const { token } = useTheme();

  const offset = getThumbOffset(size);
  const translateX = useSharedValue(checked ? offset : 0);
  const pressProgress = useSharedValue(0);
  const thumbAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: 1 + pressProgress.value * PRESS_SCALE_DELTA },
    ],
  }));

  React.useEffect(() => {
    translateX.value = withTiming(checked ? offset : 0, {
      duration: token.motionDurationMid,
      easing: Easing.bezier(...token.motionEaseInOut),
    });
  }, [
    checked,
    offset,
    token.motionDurationMid,
    token.motionEaseInOut,
    translateX,
  ]);

  const textColor: TextColor =
    checked && !isDisabled ? 'secondary' : 'tertiary';

  function handlePress(): void {
    if (isDisabled) {
      return;
    }

    setChecked(!checked);
  }

  function handlePressIn(event: GestureResponderEvent): void {
    onPressIn?.(event);

    if (isDisabled) {
      return;
    }

    pressProgress.value = withTiming(1, {
      duration: token.motionDurationFast,
      easing: Easing.bezier(...token.motionEaseOut),
    });
  }

  function handlePressOut(event: GestureResponderEvent): void {
    onPressOut?.(event);

    pressProgress.value = withTiming(0, {
      duration: token.motionDurationFast,
      easing: Easing.bezier(...token.motionEaseOut),
    });
  }

  return (
    <Pressable
      {...rest}
      testID="switch"
      disabled={isDisabled}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[tokenStyles.container, styles?.root, style]}
    >
      <View style={tokenStyles.box}>
        <View
          testID="switch-track"
          style={[
            tokenStyles.track,
            styles?.track,
            checked ? tokenStyles.trackChecked : null,
            resolvedDisabled
              ? checked
                ? tokenStyles.trackDisabledChecked
                : tokenStyles.trackDisabled
              : null,
          ]}
        />
        <Animated.View
          testID="switch-thumb"
          style={[
            tokenStyles.thumb,
            !isDisabled ? tokenStyles.thumbRaised : null,
            resolvedDisabled ? tokenStyles.thumbDisabled : null,
            resolvedReadonly ? tokenStyles.thumbReadonly : null,
            styles?.thumb,
            thumbAnimatedStyle,
          ]}
        />
      </View>
      {hasText ? (
        <Text
          color={textColor}
          numberOfLines={1}
          size="xs"
          style={[tokenStyles.text, styles?.text]}
          testID="switch-text"
        >
          {checked ? checkedText : uncheckedText}
        </Text>
      ) : null}
    </Pressable>
  );
}
