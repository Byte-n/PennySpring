import React from 'react';
import Svg, { Line, Rect } from 'react-native-svg';
import { useTheme } from '@pennyspring/ui';

export type LanDeviceKind = 'phone' | 'tablet';

interface LanDeviceGlyphProps {
  kind: LanDeviceKind;
  size?: number;
  color?: string;
}

export function LanDeviceGlyph({
  kind,
  size = 18,
  color,
}: LanDeviceGlyphProps) {
  const { token } = useTheme();
  const stroke = color ?? token.colorPrimary;

  return (
    <Svg height={size} viewBox="0 0 20 20" width={size}>
      {kind === 'tablet' ? (
        <>
          <Rect
            fill="none"
            height={16}
            rx={2.2}
            stroke={stroke}
            strokeWidth={1.5}
            width={13.6}
            x={3.2}
            y={2}
          />
          <Line
            stroke={stroke}
            strokeLinecap="round"
            strokeWidth={1.5}
            x1={8}
            x2={12}
            y1={15.2}
            y2={15.2}
          />
        </>
      ) : (
        <>
          <Rect
            fill="none"
            height={16.4}
            rx={2.2}
            stroke={stroke}
            strokeWidth={1.5}
            width={8.8}
            x={5.6}
            y={1.8}
          />
          <Line
            stroke={stroke}
            strokeLinecap="round"
            strokeWidth={1.5}
            x1={8.5}
            x2={11.5}
            y1={15.2}
            y2={15.2}
          />
        </>
      )}
    </Svg>
  );
}
