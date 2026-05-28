import type { ComponentSize } from '../shares/types';
import type { TextSize } from '../Text/types';
import React from 'react';
import { View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import { Text } from '../Text';
import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import type { AliasColorTokenKey, AliasToken } from '@pennyspring/theme';
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
  barHeight: (token: AliasToken) => number;
  circleSize: (token: AliasToken) => number;
  textSize: TextSize;
  gap: (token: AliasToken) => number;
}

const FULL_PERCENT = 100;
const HALF_PERCENT = 50;
const QUARTER_TURN = '0deg';
const HALF_TURN = '180deg';

const SIZE_STYLE_MAP: Record<ComponentSize, ProgressSizeConfig> = {
  small: {
    barHeight: token => token.sizeXXS,
    circleSize: token => token.controlHeight,
    textSize: 'sm',
    gap: token => token.marginXXS,
  },
  normal: {
    barHeight: token => token.sizeXS,
    circleSize: token => token.controlHeightLG,
    textSize: 'md',
    gap: token => token.marginXS,
  },
  large: {
    barHeight: token => token.sizeSM,
    circleSize: token => token.controlHeightLG + token.controlHeightXS,
    textSize: 'lg',
    gap: token => token.marginSM,
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

function resolveStatusColorKey(status: ProgressStatus): AliasColorTokenKey {
  if (status === 'success') {
    return 'success';
  }

  if (status === 'exception') {
    return 'error';
  }

  return 'primary';
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

function renderInfo(
  format: ((percent: number) => ReactNode) | undefined,
  percent: number,
  showInfo: boolean,
  textSize: TextSize,
  colorKey: AliasColorTokenKey,
) {
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
    return <Text color={colorKey} size={textSize}>{content ?? ''}</Text>;
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
        gap: sizeConfig.gap(token),
      },
      barTrack: {
        backgroundColor: token.colorFillSecondary,
        borderRadius: token.borderRadiusSM,
        flex: 1,
        height: sizeConfig.barHeight(token),
        overflow: 'hidden',
      },
      barIndicator: {
        backgroundColor: strokeColor,
        borderRadius: token.borderRadiusSM,
        height: '100%',
        width: indicatorWidth,
      },
    };
  },
);

const useCircleStyles = createUseSheetStyle(
  (token, { size, status, leftRotation, rightRotation }: CircleStyleOptions) => {
    const sizeConfig = SIZE_STYLE_MAP[size];
    const dimension = sizeConfig.circleSize(token);
    const radius = dimension / 2;
    const strokeColor = resolveStatusColor(token, status);

    return {
      circleRoot: {
        alignItems: 'center',
        gap: sizeConfig.gap(token),
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
        borderWidth: token.lineWidthBold,
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
        borderWidth: token.lineWidthBold,
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
      {renderInfo(
        format,
        normalizedPercent,
        showInfo,
        sizeConfig.textSize,
        resolveStatusColorKey(resolvedStatus),
      )}
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
        {renderInfo(
          format,
          normalizedPercent,
          showInfo,
          sizeConfig.textSize,
          resolveStatusColorKey(resolvedStatus),
        )}
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
