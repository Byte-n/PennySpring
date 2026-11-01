import React from 'react';
import { Column, Row, Text, Card, Divider } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';
import { RecordRow } from './RecordRow';
import {
  formatAmount,
  formatWeekday,
  isSameDay,
  type DayGroup,
  type DetailListItem,
} from './detailData';

const useStyles = createUseSheetStyle(token => ({
  dayHeader: {
    paddingHorizontal: token.paddingSM,
    paddingTop: token.paddingSM,
    paddingBottom: token.paddingXS,
    backgroundColor: token.colorBgLayout,
  },
  card: { marginHorizontal: token.padding, padding: 0, overflow: 'hidden' },
  cardBody: { gap: 0 },
  spacer: { flex: 1 },
}));

interface DayGroupCardProps {
  group: DayGroup<DetailListItem>;
  onPressRecord: (recordId: number) => void;
  hidden?: boolean;
}

export function DayGroupCard({
  group,
  onPressRecord,
  hidden = false,
}: DayGroupCardProps) {
  const styles = useStyles();
  const today = isSameDay(new Date(group.dayStart), new Date());
  const title = (
    <Row align="center" gap="small" style={styles.dayHeader}>
      <Text size="md" weight="semibold" color="heading">
        {group.dayStart.formatDateBy('M月D日')}
      </Text>
      <Text size="sm" color="tertiary">
        {formatWeekday(group.dayStart)}
      </Text>
      {today ? (
        <Text size="xs" color="primary">
          今天
        </Text>
      ) : null}
      <Column style={styles.spacer} />
      {group.summary.expense > 0 ? (
        <Text size="xs" color="tertiary">
          支{' '}
          <Text size="xs" color="error">
            {hidden ? '••••' : formatAmount(group.summary.expense)}
          </Text>
        </Text>
      ) : null}
      {group.summary.income > 0 ? (
        <Text size="xs" color="tertiary">
          收{' '}
          <Text size="xs" color="success">
            {hidden ? '••••' : formatAmount(group.summary.income)}
          </Text>
        </Text>
      ) : null}
    </Row>
  );

  return (
    <>
      {title}
      <Card style={styles.card} styles={{ body: styles.cardBody }}>
        {group.records.map((view, index) => (
          <React.Fragment key={view.record.id}>
            {index > 0 ? <Divider spacing="none" /> : null}
            <RecordRow view={view} onPress={onPressRecord} hidden={hidden} />
          </React.Fragment>
        ))}
      </Card>
    </>
  );
}
