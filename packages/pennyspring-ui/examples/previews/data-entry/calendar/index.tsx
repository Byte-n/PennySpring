import React from 'react';
import { View } from 'react-native';
import { Calendar, Text } from '@pennyspring/ui';
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
          <Calendar mode="year" defaultValue="2026" style={styles.calendarBox} />
          <Calendar.Range defaultValue={['2026-05-03', '2026-05-12']} style={styles.calendarBox} />
        </View>
      </PreviewSection>

      <PreviewSection title="Limits and date control">
        <View style={styles.stack}>
          <Calendar
            defaultValue="2026-05-10"
            minDate="2026-05-05"
            maxDate="2026-05-20"
            disabledDate={value => value === '2026-05-12' || value === '2026-05-18'}
            style={styles.calendarBox}
          />
        </View>
      </PreviewSection>

      <PreviewSection title="Confirm and custom texts">
        <View style={styles.stack}>
          <Calendar
            defaultValue="2026-05-09"
            showConfirm
            previousText="上一页"
            nextText="下一页"
            todayText="回到今天"
            cancelText="取消选择"
            okText="确认日期"
            style={styles.calendarBox}
          />
        </View>
      </PreviewSection>

      <PreviewSection title="Readonly and disabled">
        <View style={styles.stack}>
          <Calendar defaultValue="2026-05-16" readonly style={styles.calendarBox} />
          <Calendar defaultValue="2026-05-16" disabled style={styles.calendarBox} />
        </View>
      </PreviewSection>
    </PreviewScaffold>
  );
}
