import React, { useMemo } from 'react';
import { Card, Column, Empty, Row, Text } from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import type { RecordRow, TypeRow } from '@pennyspring/api';

import {
  buildIncomeAnalysis,
  buildIncomeTrend,
  comparePeriods,
  foldForDonut,
  formatBalance,
  formatMoney,
  formatPercent,
} from './analysisData';
import type { ChartPeriod } from './analysisData';
import { categoryColorAt } from './chartPalette';
import { ChartCard } from './components/ChartCard';
import { ColorDot } from './components/ColorDot';
import { DonutChart } from './components/DonutChart';
import { GrowthText } from './components/GrowthText';
import { IncomeTrendChart } from './components/IncomeTrendChart';
import { RankList } from './components/RankList';
import type { RankItem } from './components/RankList';

const DONUT_LIMIT = 6;
const TREND_MONTHS = 6;

interface IncomeViewProps {
  records: readonly RecordRow[];
  types: readonly TypeRow[];
  period: ChartPeriod;
  compareEnabled: boolean;
  now: Date;
}

const useStyles = createUseSheetStyle(token => ({
  content: {
    gap: token.marginSM,
  },
  heroBody: {
    marginTop: token.marginSM,
  },
  heroAmount: {
    flex: 1,
    gap: token.marginXXS,
  },
  rateBox: {
    paddingHorizontal: token.paddingSM,
    paddingVertical: token.paddingXS,
    borderRadius: token.borderRadiusSM,
    backgroundColor: token.colorPrimaryBg,
    alignItems: 'center',
    gap: token.marginXXS,
  },
  footer: {
    marginTop: token.marginSM,
    paddingTop: token.marginXS,
    borderTopWidth: token.lineWidth,
    borderTopColor: token.colorSplit,
  },
  footerSeparator: {
    width: token.lineWidth,
    height: token.fontSizeSM,
    backgroundColor: token.colorSplit,
  },
  legend: {
    alignItems: 'center',
  },
  trendFooter: {
    marginTop: token.marginXS,
  },
  note: {
    gap: token.marginXS,
  },
}));

export function IncomeView({
  records,
  types,
  period,
  compareEnabled,
  now,
}: IncomeViewProps) {
  const styles = useStyles();
  const { token } = useTheme();
  const analysis = useMemo(
    () => buildIncomeAnalysis(records, types, period),
    [records, types, period],
  );
  const comparison = useMemo(
    () => comparePeriods(records, types, period),
    [records, types, period],
  );
  const trend = useMemo(
    () =>
      buildIncomeTrend(
        records,
        types,
        new Date(period.start),
        now,
        TREND_MONTHS,
      ),
    [records, types, period.start, now],
  );
  const donutStats = foldForDonut(analysis.stats, DONUT_LIMIT);
  const donutSlices = donutStats.map((item, index) => ({
    key: item.key,
    value: item.amount,
    color: categoryColorAt(index, token),
  }));
  const rankItems: RankItem[] = analysis.stats.map((item, index) => ({
    key: item.key,
    name: item.name,
    amount: item.amount,
    percent: item.percent,
    count: item.count,
    delta: null,
    color: categoryColorAt(index, token),
    drillable: false,
  }));
  const averageRate =
    trend.length === 0
      ? 0
      : trend.reduce((sum, month) => sum + month.savingsRate, 0) / trend.length;
  const currentRate =
    trend.length === 0 ? comparison.current.savingsRate : trend[trend.length - 1].savingsRate;
  const incomeCount = analysis.stats.reduce(
    (sum, item) => sum + item.count,
    0,
  );

  return (
    <Column style={styles.content}>
      <Card variant="summary">
        <Row align="start" justify="between" gap="normal">
          <Column gap="small">
            <Text size="md" weight="semibold">
              本月收入
            </Text>
            <Text size="xs" color="tertiary">
              {analysis.stats.length} 个来源 · {incomeCount} 笔
            </Text>
          </Column>
          {compareEnabled ? (
            <Text size="xs" color="tertiary">
              较上月同期
            </Text>
          ) : null}
        </Row>
        <Row align="end" justify="between" gap="normal" style={styles.heroBody}>
          <Column style={styles.heroAmount}>
            <Text size="h3" weight="semibold" color="success" numberOfLines={1}>
              {formatMoney(comparison.current.income)}
            </Text>
            {compareEnabled ? (
              <GrowthText ratio={comparison.incomeDelta} />
            ) : null}
          </Column>
          <Column style={styles.rateBox}>
            <Text size="xs" color="tertiary">
              结余率
            </Text>
            <Text size="md" weight="semibold" color="primary">
              {formatPercent(comparison.current.savingsRate)}
            </Text>
          </Column>
        </Row>
        <Row align="center" gap="small" style={styles.footer}>
          <Text size="xs" color="tertiary">
            支出{' '}
            <Text size="xs" weight="medium" color="heading">
              {formatMoney(comparison.current.expense)}
            </Text>
          </Text>
          <Column style={styles.footerSeparator} />
          <Text size="xs" color="tertiary">
            结余{' '}
            <Text size="xs" weight="medium" color="heading">
              {formatBalance(comparison.current.balance)}
            </Text>
          </Text>
          {compareEnabled ? (
            <>
              <Column style={styles.footerSeparator} />
              <GrowthText ratio={comparison.savingsRateDelta} points />
            </>
          ) : null}
        </Row>
      </Card>

      <ChartCard title="收入来源" subtitle="退款/报销按抵扣后余额计入">
        {analysis.total === 0 ? (
          <Empty size="small" messageText="本月暂无收入" />
        ) : (
          <>
            <DonutChart
              slices={donutSlices}
              centerLabel="本月收入"
              centerValue={formatMoney(analysis.total)}
              centerSub={`${analysis.stats.length} 个来源`}
            />
            <RankList
              items={rankItems}
              nameHeader="来源"
              showDelta={false}
              showHeader
            />
          </>
        )}
      </ChartCard>

      <ChartCard
        title="近 6 个月收支"
        subtitle="带 * 为月初至今"
        extra={
          <Row align="center" gap="small" style={styles.legend}>
            <ColorDot color={token.colorSuccess} />
            <Text size="xs" color="tertiary">
              收入
            </Text>
            <ColorDot color={token.colorError} />
            <Text size="xs" color="tertiary">
              支出
            </Text>
          </Row>
        }
      >
        <IncomeTrendChart months={trend} />
        <Text size="xs" color="tertiary" style={styles.trendFooter}>
          近 6 月平均结余率{' '}
          <Text size="xs" weight="medium" color="heading">
            {formatPercent(averageRate)}
          </Text>{' '}
          · 本期{' '}
          <Text size="xs" weight="medium" color="heading">
            {formatPercent(currentRate)}
          </Text>
        </Text>
      </ChartCard>

      <Card>
        <Column style={styles.note}>
          <Text size="sm" weight="medium">
            收入口径说明
          </Text>
          {analysis.refundGross > 0 ? (
            <Text size="xs" color="secondary">
              退款/报销到账 ¥{formatMoney(analysis.refundGross)}，其中 ¥
              {formatMoney(analysis.refundAbsorbed)} 抵扣关联支出，¥
              {formatMoney(analysis.refundNet)} 计入收入。
            </Text>
          ) : (
            <Text size="xs" color="secondary">
              退款/报销会先抵扣关联支出，余额才计入收入。
            </Text>
          )}
          <Text size="xs" color="tertiary">
            转账、信用卡还款不是收入或支出。
          </Text>
        </Column>
      </Card>
    </Column>
  );
}
