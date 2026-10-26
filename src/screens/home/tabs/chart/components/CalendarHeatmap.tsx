import React from 'react';
import type { ReactNode } from 'react';
import { Pressable } from 'react-native';
import { Column, Row, Text } from '@pennyspring/ui';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';

import type { CalendarDay } from '../analysisData';
import { ColorDot } from './ColorDot';

const WEEK_LENGTH = 7;
const MAX_LEVEL = 4;
const WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日'];
const MONDAY_OFFSET = 6;

interface CalendarHeatmapProps {
  start: number;
  days: readonly CalendarDay[];
  selectedDay: number | null;
  onSelectDay: (day: number) => void;
  detail?: ReactNode;
}

const useStyles = createUseSheetStyle(token => ({
  container: {
    gap: token.marginXS,
  },
  weekday: {
    flex: 1,
    alignItems: 'center',
  },
  week: {
    gap: token.marginXXS,
  },
  blank: {
    flex: 1,
    height: token.controlHeightSM,
  },
  legend: {
    alignItems: 'center',
  },
  legendDot: {
    marginHorizontal: token.marginXXS,
  },
}));

const useCellStyles = createUseSheetStyle(
  (
    token,
    {
      level,
      isSelected,
      isToday,
      isFuture,
    }: {
      level: number;
      isSelected: boolean;
      isToday: boolean;
      isFuture: boolean;
    },
  ) => {
    const background =
      level === 4
        ? token.colorPrimary
        : level === 3
          ? token.colorPrimaryBorder
          : level === 2
            ? token.colorPrimaryBgHover
            : level === 1
              ? token.colorPrimaryBg
              : token.colorFillQuaternary;
    const levelColor =
      level >= 3 ? token.colorTextLightSolid : token.colorTextSecondary;
    return {
      cell: {
        flex: 1,
        height: token.controlHeightSM,
        borderRadius: token.borderRadiusXS,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: token.lineWidth,
        borderColor: 'transparent',
        backgroundColor: isFuture ? token.colorFillQuaternary : background,
        ...(isFuture
          ? {
              borderStyle: 'dashed' as const,
              borderColor: token.colorBorderSecondary,
              opacity: token.opacityLoading,
            }
          : null),
        ...(isToday ? { borderColor: token.colorPrimary } : null),
        ...(isSelected
          ? {
              borderWidth: token.lineWidthBold,
              borderColor: token.colorText,
            }
          : null),
      },
      label: {
        color: isFuture ? token.colorTextQuaternary : levelColor,
      },
    };
  },
);

function levelOf(amount: number, maxAmount: number): number {
  if (amount <= 0) return 0;
  return Math.min(
    MAX_LEVEL,
    Math.max(1, Math.ceil((amount / maxAmount) * MAX_LEVEL)),
  );
}

interface CalendarCellProps {
  day: CalendarDay;
  maxAmount: number;
  isSelected: boolean;
  hitSlop: number;
  onSelect: (day: number) => void;
}

function CalendarCell({
  day,
  maxAmount,
  isSelected,
  hitSlop,
  onSelect,
}: CalendarCellProps) {
  const styles = useCellStyles({
    level: levelOf(day.amount, maxAmount),
    isSelected,
    isToday: day.isToday,
    isFuture: day.isFuture,
  });

  return (
    <Pressable
      disabled={day.isFuture}
      hitSlop={hitSlop}
      onPress={() => onSelect(day.day)}
      style={styles.cell}
    >
      <Text size="xs" style={styles.label}>
        {day.day}
      </Text>
    </Pressable>
  );
}

export function CalendarHeatmap({
  start,
  days,
  selectedDay,
  onSelectDay,
  detail,
}: CalendarHeatmapProps) {
  const styles = useStyles();
  const { token } = useTheme();
  const leading = (new Date(start).getDay() + MONDAY_OFFSET) % WEEK_LENGTH;
  const totalCells =
    Math.ceil((leading + days.length) / WEEK_LENGTH) * WEEK_LENGTH;
  const cells = Array.from({ length: totalCells }, (_, index) => {
    const dayIndex = index - leading;
    return dayIndex >= 0 && dayIndex < days.length ? days[dayIndex] : null;
  });
  const weeks = Array.from(
    { length: totalCells / WEEK_LENGTH },
    (_, index) => cells.slice(index * WEEK_LENGTH, (index + 1) * WEEK_LENGTH),
  );
  const maxAmount = Math.max(...days.map(day => day.amount), 1);

  return (
    <Column style={styles.container}>
      <Row style={styles.week}>
        {WEEKDAY_LABELS.map(label => (
          <Column key={label} style={styles.weekday}>
            <Text size="xs" color="tertiary">
              {label}
            </Text>
          </Column>
        ))}
      </Row>
      {weeks.map((week, weekIndex) => (
        <Row key={`week-${weekIndex}`} style={styles.week}>
          {week.map((day, dayIndex) =>
            day === null ? (
              <Column key={`blank-${weekIndex}-${dayIndex}`} style={styles.blank} />
            ) : (
              <CalendarCell
                key={day.day}
                day={day}
                maxAmount={maxAmount}
                isSelected={selectedDay === day.day}
                hitSlop={token.sizeXXS}
                onSelect={onSelectDay}
              />
            ),
          )}
        </Row>
      ))}
      <Row align="center" justify="between">
        <Row align="center" style={styles.legend}>
          <Text size="xs" color="tertiary">
            少
          </Text>
          <Column style={styles.legendDot}>
            <ColorDot color={token.colorPrimaryBg} />
          </Column>
          <Column style={styles.legendDot}>
            <ColorDot color={token.colorPrimaryBgHover} />
          </Column>
          <Column style={styles.legendDot}>
            <ColorDot color={token.colorPrimaryBorder} />
          </Column>
          <Column style={styles.legendDot}>
            <ColorDot color={token.colorPrimary} />
          </Column>
          <Text size="xs" color="tertiary">
            多
          </Text>
        </Row>
        <Text size="xs" color="tertiary">
          深色 = 当日支出高
        </Text>
      </Row>
      {detail}
    </Column>
  );
}
