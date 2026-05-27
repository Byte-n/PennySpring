import { useCallback } from 'react';
import { useTheme } from '@pennyspring/theme';
import {
  Easing,
  runOnJS,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export const useCarouselPosition = () => {
  const { token } = useTheme();
  const position = useSharedValue(0);

  const animateTo = useCallback(
    (toValue: number, onFinished?: () => void) => {
      position.value = withTiming(
        toValue,
        {
          duration: token.motionDurationSlow,
          easing: Easing.bezier(...token.motionEaseOut),
        },
        finished => {
          if (finished && onFinished) {
            runOnJS(onFinished)();
          }
        },
      );
    },
    [position, token],
  );

  const setPositionImmediate = useCallback(
    (toValue: number) => {
      position.value = toValue;
    },
    [position],
  );

  return {
    position,
    animateTo,
    setPositionImmediate,
  };
};
