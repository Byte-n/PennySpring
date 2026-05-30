import React from 'react';
import { Row, Text, Card, Divider } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/theme';
import { RecordRow } from './RecordRow';
import {
  formatAmount,
  formatDayTitle,
  type DayGroup,
  type DetailRecordView,
} from './detailData';

const useStyles = createUseSheetStyle(token => ({
  extra: {
    gap: token.marginXS,
  },
}));

interface DayGroupCardProps {
  group: DayGroup<DetailRecordView>;
  onPressRecord: (view: DetailRecordView) => void;
}

export function DayGroupCard({ group, onPressRecord }: DayGroupCardProps) {
  const styles = useStyles();
  const extra = (
    <Row align="center" gap="small" style={styles.extra}>
      <Text size="sm" color="tertiary">{`支 ${formatAmount(group.summary.expense)}`}</Text>
      <Text size="sm" color="tertiary">{`收 ${formatAmount(group.summary.income)}`}</Text>
    </Row>
  );

  return (
    <Card titleText={formatDayTitle(group.dayStart)} extra={extra}>
      {group.records.map((view, index) => (
        <React.Fragment key={view.record.id}>
          {index > 0 ? <Divider /> : null}
          <RecordRow view={view} onPress={onPressRecord} />
        </React.Fragment>
      ))}
    </Card>
  );
}
