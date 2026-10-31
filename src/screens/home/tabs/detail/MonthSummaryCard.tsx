import React, { useMemo } from 'react';
import { Button, Card, Column, Row, Text } from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/ui';
import { filterByMonth, formatAmountParts, getElapsedMonthDayCount, summarizeCashflow, type CashflowItem, type CashflowSummary, type DailyExpenseBar } from './detailData';

const useStyles = createUseSheetStyle(token => ({
  card: { marginHorizontal: token.padding, marginTop: token.paddingSM },
  amount: { marginTop: token.marginXXS },
  amountInteger: { fontVariant: ['tabular-nums'] },
  chart: { height: token.controlHeightSM },
  axis: { marginTop: token.marginXXS },
  split: { borderTopWidth: token.lineWidth, borderTopColor: token.colorSplit, paddingTop: token.paddingSM },
  stat: { flex: 1 },
  splitCell: { borderLeftWidth: token.lineWidth, borderLeftColor: token.colorSplit, paddingLeft: token.paddingSM, marginLeft: token.paddingSM },
}));

const useBarStyles = createUseSheetStyle((token, { ratio, isToday, isPlaceholder }: { ratio: number; isToday: boolean; isPlaceholder: boolean }) => ({
  bar: {
    flex: 1,
    minWidth: token.sizeXXS,
    height: Math.max(token.sizeXXS, ratio * token.controlHeightSM),
    borderRadius: token.borderRadiusXS,
    backgroundColor: isPlaceholder ? token.colorFillSecondary : isToday ? token.colorPrimary : token.colorPrimaryBgHover,
  },
}));

function SummaryBar({ ratio, isToday, isPlaceholder }: { ratio: number; isToday: boolean; isPlaceholder: boolean }) {
  const styles = useBarStyles({ ratio, isToday, isPlaceholder });
  return <Column style={styles.bar} />;
}

interface MonthSummaryCardProps {
  month: Date;
  summary: CashflowSummary;
  dailyExpenses: readonly DailyExpenseBar[];
  recordCount: number;
  hidden: boolean;
  onToggleHidden: () => void;
  records: readonly CashflowItem[];
}

export function MonthSummaryCard({ month, summary, dailyExpenses, recordCount, hidden, onToggleHidden, records }: MonthSummaryCardProps) {
  const { token } = useTheme();
  const styles = useStyles();
  const maxExpense = Math.max(...dailyExpenses.map(bar => bar.expense), 1);
  const average = summary.expense / getElapsedMonthDayCount(month) || 0;
  const monthLabel = month.formatDateBy('YYYY年M月');
  const bars = useMemo(() => dailyExpenses.slice(0, 26), [dailyExpenses]);
  const expense = formatAmountParts(summary.expense);
  const income = formatAmountParts(summary.income);
  const balance = formatAmountParts(summary.balance);
  const avg = formatAmountParts(average);
  const previousMonth = new Date(month.getFullYear(), month.getMonth() - 1, 1);
  const periodDays = getElapsedMonthDayCount(month);
  const previousExpense = summarizeCashflow(filterByMonth(records, previousMonth).filter(record => new Date(record.recordTime).getDate() <= periodDays)).expense;
  const delta = previousExpense > 0 ? ((summary.expense - previousExpense) / previousExpense) * 100 : null;
  const amountText = (parts: { integer: string; decimal: string }) => hidden ? '••••' : `${parts.integer}.${parts.decimal}`;
  return (
    <Card variant="elevated" style={styles.card}>
      <Column gap="small">
        <Row align="center" justify="between">
          <Column gap="small">
            <Text size="sm" color="secondary">{month.getMonth() === new Date().getMonth() && month.getFullYear() === new Date().getFullYear() ? '本月' : monthLabel}支出 · {recordCount} 笔</Text>
            <Text size="h2" weight="semibold" color="error" style={styles.amount}>
              {hidden ? '••••' : <>
              <Text size="h2" weight="semibold" color="error" style={styles.amountInteger}>{expense.integer}</Text>
              <Text size="sm" weight="semibold" color="error">.{expense.decimal}</Text>
              </>}
            </Text>
          </Column>
          <Row align="center" gap="small">
            <Text size="xs" color={delta === null ? 'tertiary' : delta <= 0 ? 'success' : 'error'}>
              {delta === null ? '暂无上月同期数据' : `${delta <= 0 ? '↓' : '↑'} ${Math.abs(delta).toFixed(1)}% 较上月同期`}
            </Text>
            <Button type="text" size="small" icon={hidden ? 'eye' : 'eye-slash'} onPress={onToggleHidden} />
          </Row>
        </Row>
        <Row align="end" gap={token.sizeXXS} style={styles.chart}>
          {bars.map(bar => (
            <SummaryBar
              key={bar.dayStart}
              ratio={Math.sqrt(bar.expense / maxExpense)}
              isToday={bar.dayStart === new Date().setHours(0, 0, 0, 0)}
              isPlaceholder={bar.isPlaceholder}
            />
          ))}
        </Row>
        <Row justify="between" style={styles.axis}>
          <Text size="xs" color="tertiary">{String(month.getMonth() + 1).padStart(2, '0')}-01</Text>
          <Text size="xs" color="primary">今天 {String(new Date().getMonth() + 1).padStart(2, '0')}-{String(new Date().getDate()).padStart(2, '0')}</Text>
        </Row>
        <Row style={styles.split}>
          <Column gap="small" style={styles.stat}>
            <Text size="xs" color="tertiary">收入</Text>
            <Text size="sm" weight="semibold" color="success">{amountText(income)}</Text>
          </Column>
          <Column gap="small" style={[styles.stat, styles.splitCell]}>
            <Text size="xs" color="tertiary">结余</Text>
            <Text size="sm" weight="semibold" color={summary.balance >= 0 ? 'heading' : 'error'}>{amountText(balance)}</Text>
          </Column>
          <Column gap="small" style={[styles.stat, styles.splitCell]}>
            <Text size="xs" color="tertiary">日均</Text>
            <Text size="sm" weight="semibold" color="heading">{amountText(avg)}</Text>
          </Column>
        </Row>
      </Column>
    </Card>
  );
}
