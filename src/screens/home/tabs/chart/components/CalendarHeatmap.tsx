import React, { useMemo } from 'react';
import type { ReactNode } from 'react';
import { CalendarPicker as Calendar, Column, Row, Text } from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import type { CalendarPickerViewCellState } from '@pennyspring/ui';
import type { AliasToken } from '@pennyspring/theme';
import type { ViewStyle, TextStyle } from 'react-native';

import type { CalendarDay } from '../analysisData';
import { ColorDot } from './ColorDot';

const MAX_LEVEL = 4;

interface CalendarHeatmapProps {
  start: number;
  days: readonly CalendarDay[];
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
  detail?: ReactNode;
}

interface HeatmapStyleOptions {
  days: readonly CalendarDay[];
  maxAmount: number;
  start: number;
}

interface HeatmapStyles {
  root: ViewStyle;
  header: ViewStyle;
  grid: ViewStyle;
  weekHeader: ViewStyle;
  weekText: TextStyle;
  cell: (value: string, state: CalendarPickerViewCellState) => ViewStyle;
  dateText: (value: string, state: CalendarPickerViewCellState) => TextStyle;
  legend: ViewStyle;
  legendDot: ViewStyle;
}

function levelOf(amount: number, maxAmount: number): number {
  if (amount <= 0) return 0;
  return Math.min(MAX_LEVEL, Math.max(1, Math.ceil((amount / maxAmount) * MAX_LEVEL)));
}

function dateValue(start: number, day: number): string {
  const date = new Date(start);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const dateText = String(day).padStart(2, '0');

  return `${date.getFullYear()}-${month}-${dateText}`;
}

function createHeatmapStyles(token: AliasToken, { days, maxAmount, start }: HeatmapStyleOptions): HeatmapStyles {
  const dayByDate = new Map(days.map(day => [dateValue(start, day.day), day]));

  return {
    root: {
      gap: token.marginSM,
    },
    header: {
      display: 'none',
    },
    grid: {},
    weekHeader: {
      marginBottom: token.marginXXS,
    },
    weekText: {
      fontSize: token.fontSizeSM,
    },
    cell: (value: string, state: CalendarPickerViewCellState): ViewStyle => {
      const day = dayByDate.get(value);
      const level = day ? levelOf(day.amount, maxAmount) : 0;
      const background = level === 4
        ? token.colorPrimary
        : level === 3
          ? token.colorPrimaryBorder
          : level === 2
            ? token.colorPrimaryBgHover
            : level === 1
              ? token.colorPrimaryBg
              : token.colorFillQuaternary;

      return {
        backgroundColor: state.isDisabled ? token.colorFillQuaternary : background,
        borderWidth: state.isSelected ? token.lineWidthBold : token.lineWidth,
        borderColor: state.isSelected
          ? token.colorText
          : state.isToday
            ? token.colorPrimary
            : state.isDisabled
              ? token.colorBorderSecondary
              : 'transparent',
        ...(state.isDisabled
          ? { borderStyle: 'dashed' as const, opacity: token.opacityLoading }
          : null),
      };
    },
    dateText: (value: string, _state: CalendarPickerViewCellState): TextStyle => {
      const day = dayByDate.get(value);
      const level = day ? levelOf(day.amount, maxAmount) : 0;

      return {
        fontSize: token.fontSizeXS,
        lineHeight: token.lineHeightSM,
        color: day?.isFuture
          ? token.colorTextQuaternary
          : level >= 3
            ? token.colorTextLightSolid
            : token.colorTextSecondary,
      };
    },
    legend: {
      alignItems: 'center',
    },
    legendDot: {
      marginHorizontal: token.marginXXS,
    },
  };
}

const useStyles = createUseSheetStyle(
  (token, options: HeatmapStyleOptions) => createHeatmapStyles(token, options) as unknown as Record<string, ViewStyle | TextStyle>,
);

export function CalendarHeatmap({
  start,
  days,
  selectedDay,
  onSelectDay,
  detail,
}: CalendarHeatmapProps) {
  const { token } = useTheme();
  const maxAmount = Math.max(...days.map(day => day.amount), 1);
  const selectedValue = selectedDay === null ? undefined : dateValue(start, selectedDay);
  const dayByDate = useMemo(
    () => new Map(days.map(day => [dateValue(start, day.day), day])),
    [days, start],
  );
  const styles = useStyles({ days, maxAmount, start });

  return (
    <Column style={styles.root}>
      <Calendar.View
        key={`${new Date(start).getFullYear()}-${new Date(start).getMonth()}`}
        size="small"
        value={selectedValue}
        onChange={value => onSelectDay(Number(value.slice(-2)))}
        weekStartsOn="monday"
        showValue={false}
        showHeader={false}
        showToday={false}
        disabledDate={value => dayByDate.get(value)?.isFuture ?? true}
        styles={styles}
      />
      <Row align="center" justify="between">
        <Row align="center" style={styles.legend}>
          <Text size="xs" color="tertiary">少</Text>
          <Column style={styles.legendDot}><ColorDot color={token.colorPrimaryBg} /></Column>
          <Column style={styles.legendDot}><ColorDot color={token.colorPrimaryBgHover} /></Column>
          <Column style={styles.legendDot}><ColorDot color={token.colorPrimaryBorder} /></Column>
          <Column style={styles.legendDot}><ColorDot color={token.colorPrimary} /></Column>
          <Text size="xs" color="tertiary">多</Text>
        </Row>
        <Text size="xs" color="tertiary">深色 = 当日支出高</Text>
      </Row>
      {detail}
    </Column>
  );
}
