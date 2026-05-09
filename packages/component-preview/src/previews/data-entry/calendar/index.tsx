import React from 'react';
import { View } from 'react-native';
import { Calendar, Text } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
  calendarBox: {
    borderWidth: token.lineWidth,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorBgContainer,
  },
}));

export function CalendarPreview() {
  const styles = useStyles();

  return (
    <PreviewScaffold>
      <PreviewSection title="Date">
        <Calendar
          defaultValue="2026-05-07"
          marks={[
            { date: '2026-05-07', content: <Text size="sm">2</Text> },
            { date: '2026-05-12', content: <Text size="sm">1</Text> },
          ]}
          showToday
          style={styles.calendarBox}
        />
      </PreviewSection>

      <PreviewSection title="Modes and range">
        <View style={styles.stack}>
          <Calendar mode="month" defaultValue="2026-05" style={styles.calendarBox} />
          <Calendar.Range defaultValue={['2026-05-03', '2026-05-12']} style={styles.calendarBox} />
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
