import React from 'react';
import { Text } from '@pennyspring/ui';

interface GrowthTextProps {
  ratio: number | null;
  inverse?: boolean;
  points?: boolean;
}

const PERCENT_BASE = 100;
const FRACTION_DIGITS = 1;

export function GrowthText({
  ratio,
  inverse = false,
  points = false,
}: GrowthTextProps) {
  const isNeutral = ratio === null || ratio === 0 || !Number.isFinite(ratio);
  const isUp = (ratio ?? 0) > 0;
  const isGood = isUp !== inverse;
  const color = isNeutral ? 'tertiary' : isGood ? 'success' : 'error';
  const text = isNeutral
    ? '—'
    : `${isUp ? '↑' : '↓'} ${Math.abs((ratio ?? 0) * PERCENT_BASE).toFixed(
        FRACTION_DIGITS,
      )}${points ? 'pt' : '%'}`;

  return (
    <Text size="xs" weight="medium" color={color}>
      {text}
    </Text>
  );
}
