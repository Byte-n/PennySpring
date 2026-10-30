import React from 'react';
import { Column, Row, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';

import { formatMoney } from '../analysisData';
import type { ReimbursementSummary } from '../analysisData';
import { StackBar } from './StackBar';
import { useTheme } from '@pennyspring/theme';

interface ReimbursementCardProps {
  summary: ReimbursementSummary;
}

const useStyles = createUseSheetStyle(token => ({
  cell: {
    flex: 1,
    paddingHorizontal: token.paddingXS,
    paddingVertical: token.paddingXS,
    borderRadius: token.borderRadiusSM,
    backgroundColor: token.colorFillQuaternary,
  },
  bar: {
    marginTop: token.marginXS,
  },
}));

export function ReimbursementCard({ summary }: ReimbursementCardProps) {
  const styles = useStyles();
  const { token } = useTheme();

  return (
    <Column>
      <Row gap="small">
        <Column style={styles.cell} gap={token.marginXXS}>
          <Text size="xs" color="tertiary">
            可报销
          </Text>
          <Text size="sm" weight="semibold">
            {formatMoney(summary.total)}
          </Text>
        </Column>
        <Column style={styles.cell} gap={token.marginXXS}>
          <Text size="xs" color="tertiary">
            已报销
          </Text>
          <Text size="sm" weight="semibold" color="success">
            {formatMoney(summary.reimbursed)}
          </Text>
        </Column>
        <Column style={styles.cell} gap={token.marginXXS}>
          <Text size="xs" color="tertiary">
            待报销
          </Text>
          <Text size="sm" weight="semibold" color="error">
            {formatMoney(summary.pending)}
          </Text>
        </Column>
      </Row>
      <Column style={styles.bar}>
        <StackBar
          segments={[
            {
              key: 'reimbursed',
              value: summary.reimbursed,
              color: token.colorSuccess,
            },
            {
              key: 'pending',
              value: summary.pending,
              color: token.colorWarning,
            },
          ]}
        />
      </Column>
    </Column>
  );
}
