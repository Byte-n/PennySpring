import type { ComponentSize } from '../shares/types';
import type { TextSize } from '../Text/types';
import React from 'react';
import { View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import { Text } from '../Text';
import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { AliasToken } from '@pennyspring/theme';
import type { TextColor } from '../Text';
import type {
  ProgressBarProps,
  ProgressCircleProps,
  ProgressComponent,
  ProgressStatus,
} from './types';

interface BarStyleOptions {
  size: ComponentSize;
  status: ProgressStatus;
  indicatorWidth: number;
}

interface CircleStyleOptions {
  size: ComponentSize;
  status: ProgressStatus;
  leftRotation: string;
  rightRotation: string;
}

interface ProgressSizeConfig {
  barHeight: number;
  circleSize: number;
  strokeWidth: number;
  infoSize: TextSize;
  circleInfoSize: TextSize;
}

/** AliasToken 没有进度档位；线宽 4 / 6 / 8、圆环 40 / 48 / 56 为语义常量。 */
const BAR_SMALL = 4;
const BAR_NORMAL = 6;
const BAR_LARGE = 8;
const CIRCLE_SMALL = 40;
const CIRCLE_NORMAL = 48;
const CIRCLE_LARGE = 56;
const STROKE_SMALL = 3;
const STROKE_NORMAL = 4;
const INFO_MIN_WIDTH = 34;

const FULL_PERCENT = 100;
const HALF_PERCENT = 50;
const QUARTER_TURN = '0deg';
const HALF_TURN = '180deg';
const PILL_RADIUS = 999;

const SIZE_STYLE_MAP: Record<ComponentSize, ProgressSizeConfig> = {
  small: {
    barHeight: BAR_SMALL,
    circleSize: CIRCLE_SMALL,
    strokeWidth: STROKE_SMALL,
    infoSize: 'xs',
    circleInfoSize: 'xs',
  },
  normal: {
    barHeight: BAR_NORMAL,
    circleSize: CIRCLE_NORMAL,
    strokeWidth: STROKE_NORMAL,
    infoSize: 'xs',
    circleInfoSize: 'sm',
  },
  large: {
    barHeight: BAR_LARGE,
    circleSize: CIRCLE_LARGE,
    strokeWidth: STROKE_NORMAL,
    infoSize: 'sm',
    circleInfoSize: 'md',
  },
};

function clampPercent(percent?: number): number {
  if (typeof percent !== 'number' || Number.isNaN(percent)) {
    return 0;
  }

  if (percent < 0) {
    return 0;
  }

  if (percent > FULL_PERCENT) {
    return FULL_PERCENT;
  }

  return percent;
}

function resolveSize(size?: ComponentSize): ComponentSize {
  return size ?? 'normal';
}

function resolveStatus(status?: ProgressStatus): ProgressStatus {
  return status ?? 'normal';
}

function resolveStatusColor(token: AliasToken, status: ProgressStatus): string {
  if (status === 'success') {
    return token.colorSuccess;
  }

  if (status === 'exception') {
    return token.colorError;
  }

  return token.colorPrimary;
}

function resolveInfoColor(status: ProgressStatus): TextColor {
  if (status === 'exception') {
    return 'error';
  }

  return 'secondary';
}

function resolveCircleInfoColor(status: ProgressStatus): TextColor {
  if (status === 'success') {
    return 'success';
  }

  if (status === 'exception') {
    return 'error';
  }

  return 'default';
}

function resolveCircleRotation(percent: number) {
  if (percent <= HALF_PERCENT) {
    return {
      left: `rotate(${QUARTER_TURN})`,
      right: `rotate(${(percent / HALF_PERCENT) * 180}deg)`,
    };
  }

  return {
    left: `rotate(${((percent - HALF_PERCENT) / HALF_PERCENT) * 180}deg)`,
    right: `rotate(${HALF_TURN})`,
  };
}

function defaultFormat(percent: number): string {
  return `${Math.round(percent)}%`;
}

interface RenderInfoOptions {
  format?: (percent: number) => ReactNode;
  percent: number;
  showInfo: boolean;
  size: TextSize;
  color: TextColor;
  style?: StyleProp<TextStyle>;
}

function renderInfo({
  color,
  format,
  percent,
  showInfo,
  size,
  style,
}: RenderInfoOptions) {
  if (!showInfo) {
    return null;
  }

  const content = format?.(percent) ?? defaultFormat(percent);

  if (
    typeof content === 'string'
    || typeof content === 'number'
    || content === null
    || content === undefined
  ) {
    return (
      <Text color={color} size={size} style={style}>
        {content ?? ''}
      </Text>
    );
  }

  return content;
}

const useBarStyles = createUseSheetStyle(
  (token, { size, status, indicatorWidth }: BarStyleOptions) => {
    const sizeConfig = SIZE_STYLE_MAP[size];
    const strokeColor = resolveStatusColor(token, status);

    return {
      barRoot: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: token.sizeXS,
      },
      barTrack: {
        backgroundColor: token.colorFillSecondary,
        borderRadius: PILL_RADIUS,
        flex: 1,
        height: sizeConfig.barHeight,
        overflow: 'hidden',
      },
      barIndicator: {
        backgroundColor: strokeColor,
        borderRadius: PILL_RADIUS,
        height: '100%',
        width: indicatorWidth,
      },
      barInfo: {
        fontVariant: ['tabular-nums' as const],
        minWidth: INFO_MIN_WIDTH,
        textAlign: 'right' as const,
      },
    };
  },
);

const useCircleStyles = createUseSheetStyle(
  (token, { size, status, leftRotation, rightRotation }: CircleStyleOptions) => {
    const sizeConfig = SIZE_STYLE_MAP[size];
    const dimension = sizeConfig.circleSize;
    const radius = dimension / 2;
    const strokeColor = resolveStatusColor(token, status);

    return {
      circleRoot: {
        alignItems: 'center',
      },
      circleContainer: {
        alignItems: 'center',
        height: dimension,
        justifyContent: 'center',
        position: 'relative',
        width: dimension,
      },
      circleTrack: {
        borderColor: token.colorFillSecondary,
        borderRadius: radius,
        borderWidth: sizeConfig.strokeWidth,
        height: dimension,
        position: 'absolute',
        width: dimension,
      },
      circleMask: {
        borderRadius: radius,
        height: dimension,
        overflow: 'hidden',
        position: 'absolute',
        width: dimension,
      },
      halfBase: {
        height: dimension,
        overflow: 'hidden',
        position: 'absolute',
        width: radius,
      },
      halfLeft: {
        left: 0,
      },
      halfRight: {
        right: 0,
      },
      halfCircle: {
        borderColor: strokeColor,
        borderRadius: radius,
        borderWidth: sizeConfig.strokeWidth,
        height: dimension,
        left: 0,
        position: 'absolute',
        width: dimension,
      },
      halfCircleLeft: {
        transform: [{ rotate: leftRotation }] as ViewStyle['transform'],
      },
      halfCircleRight: {
        left: -radius,
        transform: [{ rotate: rightRotation }] as ViewStyle['transform'],
      },
      circleInfo: {
        fontVariant: ['tabular-nums' as const],
        textAlign: 'center' as const,
      },
    };
  },
);

export function ProgressBar({
  format,
  percent,
  showInfo = true,
  size,
  status,
  style,
  styles,
}: ProgressBarProps) {
  const resolvedSize = resolveSize(size);
  const resolvedStatus = resolveStatus(status);
  const normalizedPercent = clampPercent(percent);
  const [trackWidth, setTrackWidth] = React.useState(0);
  const indicatorWidth = trackWidth * normalizedPercent / FULL_PERCENT;
  const sizeConfig = SIZE_STYLE_MAP[resolvedSize];
  const tokenStyles = useBarStyles({
    indicatorWidth,
    size: resolvedSize,
    status: resolvedStatus,
  });

  return (
    <View style={[tokenStyles.barRoot, style]}>
      <View
        onLayout={event => {
          setTrackWidth(event.nativeEvent.layout.width);
        }}
        style={[tokenStyles.barTrack, styles?.track]}
      >
        <View
          style={[
            tokenStyles.barIndicator,
            styles?.indicator,
          ]}
        />
      </View>
      {renderInfo({
        color: resolveInfoColor(resolvedStatus),
        format,
        percent: normalizedPercent,
        showInfo,
        size: sizeConfig.infoSize,
        style: [tokenStyles.barInfo, styles?.info],
      })}
    </View>
  );
}

export function ProgressCircle({
  format,
  percent,
  showInfo = true,
  size,
  status,
  style,
  styles,
}: ProgressCircleProps) {
  const resolvedSize = resolveSize(size);
  const resolvedStatus = resolveStatus(status);
  const normalizedPercent = clampPercent(percent);
  const sizeConfig = SIZE_STYLE_MAP[resolvedSize];
  const rotation = resolveCircleRotation(normalizedPercent);
  const tokenStyles = useCircleStyles({
    size: resolvedSize,
    status: resolvedStatus,
    leftRotation: rotation.left,
    rightRotation: rotation.right,
  });

  return (
    <View style={[tokenStyles.circleRoot, style]}>
      <View style={tokenStyles.circleContainer}>
        <View style={[tokenStyles.circleTrack, styles?.track]} />
        <View style={[tokenStyles.circleMask, styles?.mask]}>
          <View style={[tokenStyles.halfBase, tokenStyles.halfLeft]}>
            <View
              style={[
                tokenStyles.halfCircle,
                tokenStyles.halfCircleLeft,
                styles?.indicator,
              ]}
            />
          </View>
          <View style={[tokenStyles.halfBase, tokenStyles.halfRight]}>
            <View
              style={[
                tokenStyles.halfCircle,
                tokenStyles.halfCircleRight,
                styles?.indicator,
              ]}
            />
          </View>
        </View>
        {renderInfo({
          color: resolveCircleInfoColor(resolvedStatus),
          format,
          percent: normalizedPercent,
          showInfo,
          size: sizeConfig.circleInfoSize,
          style: [tokenStyles.circleInfo, styles?.info],
        })}
      </View>
    </View>
  );
}

function ProgressRoot() {
  return null;
}

export const Progress = Object.assign(ProgressRoot, {
  Bar: ProgressBar,
  Circle: ProgressCircle,
}) as ProgressComponent;
