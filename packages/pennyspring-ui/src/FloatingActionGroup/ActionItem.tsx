import React from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@pennyspring/theme';
import { Button } from '../Button';
import { Text } from '../Text';
import type { ComponentSize } from '../shares/types';
import type { ActionOffset, FloatingMetrics } from './layout';
import { useActionStyles } from './style';
import type {
  FloatingActionGroupStyles,
  FloatingActionItem,
  FloatingLayout,
} from './types';

const STAGGER_MS = 24;
const LABEL_DELAY_MS = 40;
const HIDDEN_SCALE = 0.92;

interface FloatingActionItemProps {
  action: FloatingActionItem;
  index: number;
  isDisabled: boolean;
  isOpen: boolean;
  layout: FloatingLayout;
  metrics: FloatingMetrics;
  offset: ActionOffset;
  onActionPress: () => void;
  originX: number;
  originY: number;
  size: ComponentSize;
  spacing?: number;
  styles?: FloatingActionGroupStyles;
}

export function FloatingActionItem({
  action,
  index,
  isDisabled,
  isOpen,
  layout,
  metrics,
  offset,
  onActionPress,
  originX,
  originY,
  size,
  spacing,
  styles,
}: FloatingActionItemProps) {
  const { token } = useTheme();
  const progress = useSharedValue(0);
  const labelProgress = useSharedValue(0);
  const { dx, dy } = offset;
  const itemLeft = originX - metrics.anchorSize / 2;
  const itemTop = originY - metrics.anchorSize / 2;
  const labelLeft =
    layout === 'fan'
      ? metrics.anchorSize / 2 + offset.labelDx - metrics.labelMaxWidth / 2
      : (metrics.anchorSize - metrics.labelMaxWidth) / 2;
  const labelTop =
    layout === 'fan'
      ? metrics.anchorSize / 2 + offset.labelDy - metrics.labelHeight / 2
      : metrics.anchorSize + metrics.labelGap;
  const tokenStyles = useActionStyles({
    isDisabled,
    itemLeft,
    itemTop,
    labelLeft,
    labelTop,
    layout,
    size,
    spacing,
  });
  const animationEasing = React.useMemo(
    () => Easing.bezier(...token.motionEaseOut),
    [token.motionEaseOut],
  );

  React.useEffect(() => {
    if (isOpen) {
      progress.value = withDelay(
        index * STAGGER_MS,
        withTiming(1, {
          duration: token.motionDurationMid,
          easing: animationEasing,
        }),
      );
      labelProgress.value = withDelay(
        index * STAGGER_MS + LABEL_DELAY_MS,
        withTiming(1, {
          duration: token.motionDurationMid,
          easing: animationEasing,
        }),
      );
      return;
    }

    progress.value = withTiming(0, {
      duration: token.motionDurationFast,
      easing: animationEasing,
    });
    labelProgress.value = withTiming(0, {
      duration: token.motionDurationFast,
      easing: animationEasing,
    });
  }, [
    animationEasing,
    index,
    isOpen,
    labelProgress,
    progress,
    token.motionDurationFast,
    token.motionDurationMid,
  ]);

  const animatedStyle = useAnimatedStyle(() => {
    const currentProgress = progress.value;

    return {
      opacity: currentProgress,
      transform: [
        { translateX: dx * currentProgress },
        { translateY: dy * currentProgress },
        {
          scale: HIDDEN_SCALE + currentProgress * (1 - HIDDEN_SCALE),
        },
      ],
    };
  }, [dx, dy]);

  const labelAnimatedStyle = useAnimatedStyle(() => ({
    opacity: labelProgress.value,
  }));

  const {
    disabled: buttonDisabled,
    iconProps: buttonIconProps,
    testID: buttonTestID,
    type: buttonType,
    variant: buttonVariant,
    ...restButtonProps
  } = action.buttonProps ?? {};
  const resolvedVariant = buttonVariant ?? 'text';

  return (
    <Animated.View
      pointerEvents={isOpen ? 'auto' : 'none'}
      style={[tokenStyles.item, animatedStyle]}
      testID="floating-action-group-action"
    >
      <View
        style={[
          tokenStyles.face,
          isDisabled ? tokenStyles.faceDisabled : null,
          styles?.actionButton,
        ]}
      >
        <Button
          {...restButtonProps}
          disabled={isDisabled || buttonDisabled}
          icon={action.icon ?? 'plus'}
          iconProps={{
            color: isDisabled ? 'quaternary' : 'default',
            size: metrics.iconSize,
            ...buttonIconProps,
          }}
          onPress={() => {
            action.onPress?.();
            onActionPress();
          }}
          size={size}
          style={
            resolvedVariant === 'text'
              ? tokenStyles.buttonText
              : tokenStyles.buttonFilled
          }
          testID={buttonTestID}
          type={buttonType ?? 'default'}
          variant={resolvedVariant}
        />
      </View>
      {action.label === undefined ? null : (
        <Animated.View
          pointerEvents="none"
          style={[tokenStyles.labelContainer, labelAnimatedStyle]}
        >
          <Text
            color={isDisabled ? 'tertiary' : 'secondary'}
            ellipsizeMode="tail"
            numberOfLines={1}
            size="xs"
            style={[tokenStyles.label, styles?.actionLabel]}
          >
            {action.label}
          </Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}
