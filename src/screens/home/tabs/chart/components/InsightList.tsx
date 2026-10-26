import React from 'react';
import { Column, Row, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

import { formatMoney, formatSignedPercent } from '../analysisData';
import type { ChartPeriod, ExpenseInsight } from '../analysisData';

interface InsightListProps {
  insights: readonly ExpenseInsight[];
  period: ChartPeriod;
}

const CHIP_GLYPHS = {
  pace: '!',
  category: '↑',
  peak: 'i',
} as const;

const useStyles = createUseSheetStyle(token => ({
  list: {
    gap: token.marginSM,
  },
  row: {
    gap: token.marginXS,
  },
  text: {
    flex: 1,
  },
}));

const useChipStyles = createUseSheetStyle(
  (token, { kind }: { kind: ExpenseInsight['kind'] }) => ({
    chip: {
      width: token.sizeLG,
      height: token.sizeLG,
      borderRadius: token.borderRadiusXS,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        kind === 'pace'
          ? token.colorWarningBg
          : kind === 'category'
            ? token.colorErrorBg
            : token.colorPrimaryBg,
    },
  }),
);

interface InsightRowProps {
  insight: ExpenseInsight;
  month: number;
}

function InsightRow({ insight, month }: InsightRowProps) {
  const styles = useStyles();
  const chipStyles = useChipStyles({ kind: insight.kind });
  const chipColor =
    insight.kind === 'pace'
      ? 'warning'
      : insight.kind === 'category'
        ? 'error'
        : 'primary';

  return (
    <Row align="start" gap="normal" style={styles.row}>
      <Column style={chipStyles.chip}>
        <Text size="xs" weight="strong" color={chipColor}>
          {CHIP_GLYPHS[insight.kind]}
        </Text>
      </Column>
      <Text size="sm" color="secondary" style={styles.text}>
        {insight.kind === 'pace' ? (
          <>
            支出增速{' '}
            <Text size="sm" weight="medium" color="heading">
              {formatSignedPercent(insight.expenseGrowth)}
            </Text>{' '}
            高于收入{' '}
            <Text size="sm" weight="medium" color="heading">
              {formatSignedPercent(insight.incomeGrowth)}
            </Text>
            ，结余比上月同期
            {insight.balanceDelta === 0
              ? '持平'
              : `${insight.balanceDelta > 0 ? '多' : '少'} ¥${formatMoney(
                  insight.balanceDelta,
                )}`}
            。
          </>
        ) : null}
        {insight.kind === 'category' ? (
          <>
            {insight.name}比上月
            {insight.delta > 0 ? '多' : '少'} ¥
            <Text size="sm" weight="medium" color="heading">
              {formatMoney(insight.delta)}
            </Text>
            （
            <Text size="sm" weight="medium" color="heading">
              {insight.percent === null
                ? '新增'
                : formatSignedPercent(insight.percent)}
            </Text>
            ），本月 {insight.count} 笔。
          </>
        ) : null}
        {insight.kind === 'peak' ? (
          <>
            {month}/{insight.day} 单日 ¥
            <Text size="sm" weight="medium" color="heading">
              {formatMoney(insight.amount)}
            </Text>{' '}
            为月内峰值。
          </>
        ) : null}
      </Text>
    </Row>
  );
}

export function InsightList({ insights, period }: InsightListProps) {
  const styles = useStyles();
  const month = new Date(period.start).getMonth() + 1;

  return (
    <Column style={styles.list}>
      {insights.map((insight, index) => (
        <InsightRow
          key={`${insight.kind}-${index}`}
          insight={insight}
          month={month}
        />
      ))}
    </Column>
  );
}
