import React, { useMemo, useState } from 'react';
import { Pressable } from 'react-native';
import { Card, Column, Empty, Icon, Row, Text } from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import type { RecordRow, TypeRow } from '@pennyspring/api';

import { aggregateExpenseStatsForRange } from './chartData';
import {
  buildCalendarDays,
  buildDailyExpense,
  buildDayCategoryStats,
  buildExpenseInsights,
  buildMovers,
  buildPreviousDailyExpense,
  buildStructure,
  comparePeriods,
  createMonthPeriod,
  formatBalance,
  formatMoney,
  formatPercent,
  formatSignedPercent,
  getPeriodCutoff,
  getPreviousRange,
  shiftMonth,
  summarizeMonth,
} from './analysisData';
import type { ChartPeriod } from './analysisData';
import { categoryColorAt } from './chartPalette';
import { CalendarHeatmap } from './components/CalendarHeatmap';
import { ChartCard } from './components/ChartCard';
import { ColorDot } from './components/ColorDot';
import { GrowthText } from './components/GrowthText';
import { InsightList } from './components/InsightList';
import { PaceChart } from './components/PaceChart';
import { StackBar } from './components/StackBar';

const RECENT_AVERAGE_DAYS = 7;
const STRUCTURE_LIMIT = 3;
const DAY_DETAIL_LIMIT = 3;
const NO_SPEND_TEXT = '天无消费';

interface OverviewViewProps {
  records: readonly RecordRow[];
  types: readonly TypeRow[];
  period: ChartPeriod;
  compareEnabled: boolean;
  now: Date;
  onOpenExpense: () => void;
}

const useStyles = createUseSheetStyle(token => ({
  content: {
    gap: token.marginSM,
  },
  kpis: {
    marginTop: token.marginSM,
  },
  kpi: {
    flex: 1,
    minWidth: 0,
    gap: token.marginXXS,
  },
  divider: {
    width: token.lineWidth,
    alignSelf: 'stretch',
    backgroundColor: token.colorBorderSecondary,
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
  legendLine: {
    width: token.sizeMD,
    height: token.lineWidthBold,
    borderRadius: token.borderRadiusXS,
    backgroundColor: token.colorPrimary,
  },
  projection: {
    marginTop: token.marginXS,
    paddingHorizontal: token.paddingXS,
    paddingVertical: token.paddingXS,
    borderRadius: token.borderRadiusSM,
    backgroundColor: token.colorPrimaryBg,
  },
  legendGrid: {
    marginTop: token.marginXS,
  },
  legendColumn: {
    flex: 1,
    gap: token.marginXS,
  },
  legendItem: {
    gap: token.marginXXS,
  },
  legendName: {
    flex: 1,
  },
  cardFooter: {
    marginTop: token.marginXS,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: token.marginXXS,
    paddingLeft: token.paddingXS,
  },
  calendarDetail: {
    gap: token.marginXXS,
    paddingHorizontal: token.paddingXS,
    paddingVertical: token.paddingXS,
    borderRadius: token.borderRadiusSM,
    backgroundColor: token.colorFillQuaternary,
  },
  chips: {
    marginTop: token.marginXXS,
  },
  chip: {
    paddingHorizontal: token.paddingXS,
    paddingVertical: token.paddingXXS,
    borderRadius: token.borderRadiusXS,
    backgroundColor: token.colorBgContainer,
  },
}));

export function OverviewView({
  records,
  types,
  period,
  compareEnabled,
  now,
  onOpenExpense,
}: OverviewViewProps) {
  const styles = useStyles();
  const { token } = useTheme();
  const cutoff = getPeriodCutoff(period);
  const defaultDay = period.isCurrent ? period.elapsedDays : period.totalDays;
  const [selectedDay, setSelectedDay] = useState(defaultDay);

  const comparison = useMemo(
    () => comparePeriods(records, types, period),
    [records, types, period],
  );
  const analysis = useMemo(
    () =>
      aggregateExpenseStatsForRange(
        records,
        types,
        null,
        period.start,
        cutoff,
      ),
    [records, types, period.start, cutoff],
  );
  const previousAnalysis = useMemo(() => {
    const range = getPreviousRange(period);
    return aggregateExpenseStatsForRange(
      records,
      types,
      null,
      range.start,
      range.end,
    );
  }, [records, types, period]);
  const movers = useMemo(
    () => buildMovers(analysis.stats, previousAnalysis.stats),
    [analysis.stats, previousAnalysis.stats],
  );
  const structure = useMemo(
    () => buildStructure(analysis.stats, STRUCTURE_LIMIT),
    [analysis.stats],
  );
  const daily = useMemo(
    () => buildDailyExpense(records, types, period),
    [records, types, period],
  );
  const previousDaily = useMemo(
    () => buildPreviousDailyExpense(records, types, period),
    [records, types, period],
  );
  const calendar = useMemo(
    () => buildCalendarDays(records, types, period),
    [records, types, period],
  );
  const insights = useMemo(
    () =>
      buildExpenseInsights({
        current: comparison.current,
        previous: comparison.previous,
        movers,
        calendar,
      }),
    [comparison, movers, calendar],
  );

  const selectedDate = new Date(period.start);
  const dayStart = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDay,
  ).getTime();
  const dayEnd = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDay + 1,
  ).getTime();
  const dayStats = useMemo(
    () => buildDayCategoryStats(records, types, dayStart, dayEnd, DAY_DETAIL_LIMIT),
    [records, types, dayStart, dayEnd],
  );
  const dayTotal = calendar.find(day => day.day === selectedDay)?.amount ?? 0;
  const noSpendDays = calendar.filter(
    day => !day.isFuture && day.amount === 0,
  ).length;

  const remainingDays = Math.max(period.totalDays - period.elapsedDays, 0);
  const recentDays = Math.min(daily.length, RECENT_AVERAGE_DAYS);
  const recentAverage =
    recentDays === 0
      ? 0
      : daily.slice(-RECENT_AVERAGE_DAYS).reduce((sum, day) => sum + day.amount, 0) /
        recentDays;
  const projection =
    period.isCurrent && remainingDays > 0 && daily.length > 0
      ? comparison.current.expense + recentAverage * remainingDays
      : null;
  const previousMonth = createMonthPeriod(
    shiftMonth(new Date(period.start), -1),
    now,
  );
  const previousFull = summarizeMonth(records, types, previousMonth);
  const projectionDelta =
    projection !== null && previousFull.expense > 0
      ? projection / previousFull.expense - 1
      : null;
  const balanceGrowth =
    comparison.previous.balance > 0
      ? comparison.current.balance / comparison.previous.balance - 1
      : null;
  const monthStart = new Date(period.start);
  const month = monthStart.getMonth() + 1;
  const subtitle = period.isCurrent
    ? `截至 ${month}月${period.elapsedDays}日`
    : '全月';

  const structureSegments = structure.map((item, index) => ({
    key: item.key,
    value: item.amount,
    color: item.isOther ? token.colorTextTertiary : categoryColorAt(index, token),
  }));
  const structureColumns = [
    structure.slice(0, 2),
    structure.slice(2, STRUCTURE_LIMIT + 1),
  ];
  const structureSubtitle =
    analysis.stats.length > STRUCTURE_LIMIT
      ? `Top ${STRUCTURE_LIMIT} 分类 + 其他 ${
          analysis.stats.length - STRUCTURE_LIMIT
        } 类`
      : `共 ${analysis.stats.length} 个分类`;

  return (
    <Column style={styles.content}>
      <Card variant="summary">
        <Row align="start" justify="between" gap="normal">
          <Column gap="small">
            <Text size="md" weight="semibold">
              本月收支
            </Text>
            <Text size="xs" color="tertiary">
              {subtitle}
            </Text>
          </Column>
          {compareEnabled ? (
            <Text size="xs" color="tertiary">
              较上月同期
            </Text>
          ) : null}
        </Row>
        <Row style={styles.kpis}>
          <Column style={styles.kpi}>
            <Text size="xs" color="tertiary">
              支出
            </Text>
            <Text size="md" weight="semibold" color="error" numberOfLines={1}>
              {formatMoney(comparison.current.expense)}
            </Text>
            {compareEnabled ? (
              <GrowthText ratio={comparison.expenseDelta} inverse />
            ) : null}
          </Column>
          <Column style={styles.divider} />
          <Column style={styles.kpi}>
            <Text size="xs" color="tertiary">
              收入
            </Text>
            <Text size="md" weight="semibold" color="success" numberOfLines={1}>
              {formatMoney(comparison.current.income)}
            </Text>
            {compareEnabled ? (
              <GrowthText ratio={comparison.incomeDelta} />
            ) : null}
          </Column>
          <Column style={styles.divider} />
          <Column style={styles.kpi}>
            <Text size="xs" color="tertiary">
              结余
            </Text>
            <Text size="md" weight="semibold" numberOfLines={1}>
              {formatBalance(comparison.current.balance)}
            </Text>
            {compareEnabled ? <GrowthText ratio={balanceGrowth} /> : null}
          </Column>
        </Row>
        <Row align="center" gap="small" style={styles.footer}>
          <Text size="xs" color="tertiary">
            储蓄率{' '}
            <Text size="xs" weight="medium" color="heading">
              {formatPercent(comparison.current.savingsRate)}
            </Text>
          </Text>
          <Column style={styles.footerSeparator} />
          <Text size="xs" color="tertiary">
            日均支出{' '}
            <Text size="xs" weight="medium" color="heading">
              ¥{formatMoney(comparison.current.dailyAverage)}
            </Text>
          </Text>
          <Column style={styles.footerSeparator} />
          <Text size="xs" color="tertiary">
            {comparison.current.expenseCount} 笔
          </Text>
        </Row>
      </Card>

      {analysis.totalExpense === 0 ? (
        <ChartCard title="本月支出" subtitle="还没有支出记录">
          <Empty size="small" messageText="本月暂无支出" />
        </ChartCard>
      ) : (
        <>
          <ChartCard
            title="支出节奏"
            subtitle="按日累计 · 截至今天"
            extra={
              <Row align="center" gap="small" style={styles.legend}>
                <Column style={styles.legendLine} />
                <Text size="xs" color="tertiary">
                  本月
                </Text>
                {compareEnabled ? (
                  <Text size="xs" color="tertiary">
                    ··· {period.compareLabel}同期
                  </Text>
                ) : null}
              </Row>
            }
          >
            <PaceChart
              current={daily}
              previous={compareEnabled ? previousDaily : []}
              totalDays={period.totalDays}
              todayDay={period.isCurrent ? period.elapsedDays : null}
              projection={projection}
            />
            {projection !== null ? (
              <Column style={styles.projection}>
                <Text size="xs" color="secondary">
                  按近 {recentDays} 日均速，月底约{' '}
                  <Text size="xs" weight="medium" color="primary">
                    ¥{formatMoney(projection)}
                  </Text>
                  {compareEnabled && projectionDelta !== null
                    ? `，较上月全月 ${formatSignedPercent(projectionDelta)}`
                    : ''}
                  ；剩余 {remainingDays} 天。
                </Text>
              </Column>
            ) : null}
          </ChartCard>

          <ChartCard
            title="钱花在哪"
            subtitle={structureSubtitle}
            extra={
              <Pressable onPress={onOpenExpense}>
                <Row align="center" style={styles.link}>
                  <Text size="xs" color="primary">
                    分类明细
                  </Text>
                  <Icon icon="caret-right" size="small" color="primary" />
                </Row>
              </Pressable>
            }
          >
            <StackBar segments={structureSegments} />
            <Row gap="large" style={styles.legendGrid}>
              {structureColumns.map((column, columnIndex) => (
                <Column key={`column-${columnIndex}`} style={styles.legendColumn}>
                  {column.map((item, index) => (
                    <Row key={item.key} align="center" gap="small" style={styles.legendItem}>
                      <ColorDot
                        color={
                          item.isOther
                            ? token.colorTextTertiary
                            : categoryColorAt(columnIndex * 2 + index, token)
                        }
                      />
                      <Text size="xs" color="secondary" style={styles.legendName}>
                        {item.name}
                      </Text>
                      <Text size="xs" weight="medium">
                        {formatMoney(item.amount)}
                      </Text>
                    </Row>
                  ))}
                </Column>
              ))}
            </Row>
            <Text size="xs" color="tertiary" style={styles.cardFooter}>
              共 {analysis.stats.length} 个分类
            </Text>
          </ChartCard>

          <ChartCard
            title="消费日历"
            subtitle="点击日期查看当天构成"
            extra={
              <Text size="xs" color="tertiary">
                {noSpendDays} {NO_SPEND_TEXT}
              </Text>
            }
          >
            <CalendarHeatmap
              start={period.start}
              days={calendar}
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
              detail={
                <Column style={styles.calendarDetail}>
                  <Text size="xs" color="secondary">
                    {month}/{selectedDay} · 支出{' '}
                    <Text size="xs" weight="medium" color="heading">
                      ¥{formatMoney(dayTotal)}
                    </Text>
                  </Text>
                  {dayStats.length > 0 ? (
                    <Row wrap gap="small" style={styles.chips}>
                      {dayStats.map(item => (
                        <Column key={item.name} style={styles.chip}>
                          <Text size="xs" color="secondary">
                            {item.name} ¥{formatMoney(item.amount)}
                          </Text>
                        </Column>
                      ))}
                    </Row>
                  ) : (
                    <Text size="xs" color="tertiary">
                      无消费日
                    </Text>
                  )}
                </Column>
              }
            />
          </ChartCard>

          {insights.length > 0 ? (
            <ChartCard title="本月洞察" subtitle="按规则生成">
              <InsightList insights={insights} period={period} />
            </ChartCard>
          ) : null}
        </>
      )}
    </Column>
  );
}
