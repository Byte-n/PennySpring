import React from 'react';
import { Card, Row, Column, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import { formatAmount, type CashflowSummary } from './detailData';

const useStyles = createUseSheetStyle(token => ({
  cell: {
    flex: 1,
  },
  divider: {
    width: token.lineWidth,
    alignSelf: 'stretch',
    backgroundColor: token.colorBorderSecondary,
  },
}));

interface SummaryCellProps {
  labelText: string;
  amount: number;
  color: 'error' | 'success' | 'heading';
}

function SummaryCell({ labelText, amount, color }: SummaryCellProps) {
  const styles = useStyles();
  return (
    <Column align="center" gap="small" style={styles.cell}>
      <Text size="h3" weight="semibold" color={color}>
        {formatAmount(amount)}
      </Text>
      <Text size="sm" color="secondary">
        {labelText}
      </Text>
    </Column>
  );
}

interface MonthSummaryCardProps {
  monthLabel: string;
  summary: CashflowSummary;
}

export function MonthSummaryCard({ monthLabel, summary }: MonthSummaryCardProps) {
  const styles = useStyles();
  return (
    <Card variant="summary" titleText={monthLabel}>
      <Row align="center" justify="between">
        <SummaryCell labelText="支出" amount={summary.expense} color="error" />
        <Column style={styles.divider} />
        <SummaryCell labelText="收入" amount={summary.income} color="success" />
        <Column style={styles.divider} />
        <SummaryCell labelText="结余" amount={summary.balance} color="heading" />
      </Row>
    </Card>
  );
}
