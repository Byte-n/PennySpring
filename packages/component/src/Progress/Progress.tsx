import React from 'react';
import { View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import { Text } from '../Text';
import type { ReactNode } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { AliasToken } from '@pennyspring/theme';
import type {
  ProgressBarProps,
  ProgressCircleProps,
  ProgressComponent,
  ProgressSize,
  ProgressStatus,
} from './types';

interface ProgressStyleOptions {
  size: ProgressSize;
  status: ProgressStatus;
}

interface ProgressSizeConfig {
  barHeight: (token: AliasToken) => number;
  circleSize: (token: AliasToken) => number;
  fontSize: (token: AliasToken) => number;
  lineHeight: (token: AliasToken) => number;
  gap: (token: AliasToken) => number;
}

const FULL_PERCENT = 100;
const HALF_PERCENT = 50;
const QUARTER_TURN = '0deg';
const HALF_TURN = '180deg';

const SIZE_STYLE_MAP: Record<ProgressSize, ProgressSizeConfig> = {
  small: {
    barHeight: token => token.sizeXXS,
    circleSize: token => token.controlHeight,
    fontSize: token => token.fontSizeSM,
    lineHeight: token => token.lineHeightSM,
    gap: token => token.marginXXS,
  },
  normal: {
    barHeight: token => token.sizeXS,
    circleSize: token => token.controlHeightLG,
    fontSize: token => token.fontSize,
    lineHeight: token => token.lineHeight,
    gap: token => token.marginXS,
  },
  large: {
    barHeight: token => token.sizeSM,
    circleSize: token => token.controlHeightLG + token.controlHeightXS,
    fontSize: token => token.fontSizeLG,
    lineHeight: token => token.lineHeightLG,
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

function resolveSize(size?: ProgressSize): ProgressSize {
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

function defaultFormat(percent: number): string {
  return `${Math.round(percent)}%`;
}

function renderInfo(
  format: ((percent: number) => ReactNode) | undefined,
  percent: number,
  showInfo: boolean,
  style: StyleProp<TextStyle>,
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
    return <Text style={style}>{content ?? ''}</Text>;
  }

  return content;
}

const useStyles = createUseSheetStyle(
  (token, { size, status }: ProgressStyleOptions) => {
    const sizeConfig = SIZE_STYLE_MAP[size];
    const dimension = sizeConfig.circleSize(token);
    const radius = dimension / 2;
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
      },
      info: {
        color: token.colorTextSecondary,
        fontFamily: token.fontFamily,
        fontSize: sizeConfig.fontSize(token),
        fontWeight: String(token.fontWeightRegular) as TextStyle['fontWeight'],
        lineHeight: sizeConfig.lineHeight(token),
      },
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
      halfCircleRight: {
        left: -radius,
      },
      indicatorText: {
        color: strokeColor,
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
  const tokenStyles = useStyles({
    size: resolvedSize,
    status: resolvedStatus,
  });

  return (
    <View style={[tokenStyles.barRoot, style]}>
      <View style={[tokenStyles.barTrack, styles?.track]}>
        <View
          style={[
            tokenStyles.barIndicator,
            { width: `${normalizedPercent}%` },
            styles?.indicator,
          ]}
        />
      </View>
      {renderInfo(
        format,
        normalizedPercent,
        showInfo,
        [tokenStyles.info, styles?.info],
      )}
    </View>
  );
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
  const tokenStyles = useStyles({
    size: resolvedSize,
    status: resolvedStatus,
  });
  const rotation = resolveCircleRotation(normalizedPercent);

  return (
    <View style={[tokenStyles.circleRoot, style]}>
      <View style={tokenStyles.circleContainer}>
        <View style={[tokenStyles.circleTrack, styles?.track]} />
        <View style={[tokenStyles.circleMask, styles?.mask]}>
          <View style={[tokenStyles.halfBase, tokenStyles.halfLeft]}>
            <View
              style={[
                tokenStyles.halfCircle,
                { transform: [{ rotate: rotation.left }] as ViewStyle['transform'] },
                styles?.indicator,
              ]}
            />
          </View>
          <View style={[tokenStyles.halfBase, tokenStyles.halfRight]}>
            <View
              style={[
                tokenStyles.halfCircle,
                tokenStyles.halfCircleRight,
                { transform: [{ rotate: rotation.right }] as ViewStyle['transform'] },
                styles?.indicator,
              ]}
            />
          </View>
        </View>
        {renderInfo(
          format,
          normalizedPercent,
          showInfo,
          [tokenStyles.info, tokenStyles.indicatorText, styles?.info],
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

export { clampPercent, resolveCircleRotation };
