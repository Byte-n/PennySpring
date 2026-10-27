import React from 'react';
import { Row, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

const CENTS_PER_YUAN = 100;
const DECIMAL_OPACITY = 0.72;
const CURRENCY_OPACITY = 0.55;
const HERO_LETTER_SPACING = -0.028;
const ROW_LETTER_SPACING = -0.015;
const MINUS_SIGN = '−';

export type ManageAmountVariant = 'row' | 'hero';
export type ManageAmountTone = 'default' | 'negative' | 'dim';

export interface ManageAmountProps {
  /** 金额，单位为分；负值会渲染为「−」前缀。 */
  value: number;
  variant?: ManageAmountVariant;
  tone?: ManageAmountTone;
  showCurrency?: boolean;
}

interface ManageAmountStyleOptions {
  variant: ManageAmountVariant;
  tone: ManageAmountTone;
}

export interface MoneyParts {
  integer: string;
  decimal: string;
  isNegative: boolean;
}

export function splitMoney(value: number): MoneyParts {
  const absolute = Math.abs(value) / CENTS_PER_YUAN;
  const [integer, decimal = '00'] = absolute.toFixed(2).split('.');
  const withSeparators = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return {
    integer: withSeparators,
    decimal,
    isNegative: value < 0,
  };
}

const useStyles = createUseSheetStyle(
  (token, { variant, tone }: ManageAmountStyleOptions) => {
    const toneColor =
      tone === 'negative'
        ? token.colorErrorText
        : tone === 'dim'
          ? token.colorTextTertiary
          : token.colorText;

    if (variant === 'hero') {
      return {
        sign: {
          color: toneColor,
          fontSize: token.fontSizeLG,
          lineHeight: token.lineHeightLG,
          marginRight: token.marginXXS,
          opacity: DECIMAL_OPACITY,
        },
        currency: {
          color: toneColor,
          fontSize: token.fontSize,
          lineHeight: token.lineHeight,
          marginRight: token.marginXXS,
          opacity: CURRENCY_OPACITY,
        },
        integer: {
          color: toneColor,
          fontSize: token.fontSizeHeading2,
          lineHeight: token.lineHeightHeading2,
          letterSpacing: HERO_LETTER_SPACING,
        },
        decimal: {
          color: toneColor,
          fontSize: token.fontSizeLG,
          lineHeight: token.lineHeightLG,
          opacity: DECIMAL_OPACITY,
        },
      };
    }

    return {
      sign: {
        color: toneColor,
        fontSize: token.fontSizeSM,
        lineHeight: token.lineHeightSM,
        marginRight: token.marginXXS,
      },
      currency: {
        color: toneColor,
        fontSize: token.fontSizeXS,
        lineHeight: token.lineHeightXS,
        marginRight: token.marginXXS,
        opacity: CURRENCY_OPACITY,
      },
      integer: {
        color: toneColor,
        fontSize: token.fontSize,
        lineHeight: token.lineHeight,
        letterSpacing: ROW_LETTER_SPACING,
      },
      decimal: {
        color: toneColor,
        fontSize: token.fontSizeXS,
        lineHeight: token.lineHeightXS,
        opacity: DECIMAL_OPACITY,
      },
    };
  },
);

export function ManageAmount({
  value,
  variant = 'row',
  tone = 'default',
  showCurrency = false,
}: ManageAmountProps) {
  const styles = useStyles({ variant, tone });
  const parts = splitMoney(value);

  return (
    <Row align="baseline">
      {parts.isNegative ? <Text style={styles.sign}>{MINUS_SIGN}</Text> : null}
      {showCurrency ? <Text style={styles.currency}>¥</Text> : null}
      <Text style={styles.integer} weight="semibold">
        {parts.integer}
      </Text>
      <Text style={styles.decimal} weight="semibold">
        {`.${parts.decimal}`}
      </Text>
    </Row>
  );
}
