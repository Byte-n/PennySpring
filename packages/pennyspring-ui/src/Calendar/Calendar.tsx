import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { createUseSheetStyle } from '@pennyspring/theme';
import { Icon } from '../Icon';
import { Text } from '../Text';
import { useControllableValue } from '../_hooks';
import type { ReactNode } from 'react';
import type { AliasToken } from '@pennyspring/theme';
import type {
  CalendarFormat,
  CalendarMode,
  CalendarProps,
  CalendarRangeProps,
  CalendarRangeValue,
  CalendarSize,
  CalendarValue,
} from './types';
import type { ComponentSize } from '../shares/types.ts';

const DEFAULT_SIZE: CalendarSize = 'normal';
const DEFAULT_MODE: CalendarMode = 'date';
const DEFAULT_TODAY_TEXT = '今天';
const DEFAULT_CANCEL_TEXT = '取消';
const DEFAULT_OK_TEXT = '确定';
const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'];
const MONTH_COUNT = 12;
const YEAR_WINDOW = 12;
const GRID_CELL_PERCENT = '14.2857%';
const ACTION_HIT_SLOP = 8;

interface CalendarStyleOptions {
  size: CalendarSize;
}

interface PanelDate {
  year: number;
  month: number;
}

function getCellHeight(size: CalendarSize, token: AliasToken) {
  if (size === 'small') {
    return token.controlHeightSM;
  }

  if (size === 'large') {
    return token.controlHeightLG;
  }

  return token.controlHeight;
}

const useCalendarStyles = createUseSheetStyle(
  (token, { size }: CalendarStyleOptions) => ({
    root: {
      backgroundColor: token.colorBgContainer,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: token.marginSM,
    },
    title: {
      color: token.colorTextHeading,
    },
    navButton: {
      paddingHorizontal: token.paddingSM,
      paddingVertical: token.paddingSM / 2,
      borderRadius: token.borderRadiusSM,
      backgroundColor: token.colorFillQuaternary,
    },
    navIcon: {
      color: token.colorIcon,
      fontSize: token.fontSize,
    },
    weekHeader: {
      flexDirection: 'row',
      marginBottom: token.marginXXS,
    },
    weekCell: {
      width: GRID_CELL_PERCENT,
      alignItems: 'center',
    },
    weekText: {
      color: token.colorTextTertiary,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    cell: {
      width: GRID_CELL_PERCENT,
      minHeight: getCellHeight(size, token),
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: token.borderRadiusSM,
    },
    monthCell: {
      width: '33.3333%',
    },
    yearCell: {
      width: '25%',
    },
    cellSelected: {
      backgroundColor: token.controlItemBgActive,
    },
    cellDisabled: {
      opacity: token.opacityLoading,
      backgroundColor: token.colorBgContainerDisabled,
    },
    cellToday: {
      borderWidth: token.lineWidth,
      borderColor: token.colorPrimary,
    },
    cellInRange: {
      backgroundColor: token.colorPrimaryBg,
    },
    dateText: {
      color: token.colorText,
    },
    mark: {
      marginTop: token.marginXXS,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: token.marginSM,
    },
    footerAction: {
      marginLeft: token.marginSM,
    },
  }),
);

function resolveSize(size?: ComponentSize): ComponentSize {
  return size ?? DEFAULT_SIZE;
}

function resolveMode(mode?: CalendarMode): CalendarMode {
  return mode ?? DEFAULT_MODE;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function parsePanel(value: CalendarValue | undefined): PanelDate {
  const now = new Date();
  const [year, month] = String(value ?? '').split('-');

  return {
    year: Number(year) || now.getFullYear(),
    month: Math.max(1, Math.min(MONTH_COUNT, Number(month) || now.getMonth() + 1)),
  };
}

function normalizeValue(value: CalendarValue | undefined, mode: CalendarMode): CalendarValue {
  const panel = parsePanel(value);
  const day = Number(String(value ?? '').split('-')[2]) || 1;

  if (mode === 'year') {
    return String(panel.year);
  }

  if (mode === 'month') {
    return `${panel.year}-${pad(panel.month)}`;
  }

  return `${panel.year}-${pad(panel.month)}-${pad(day)}`;
}

function todayValue(mode: CalendarMode): CalendarValue {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  if (mode === 'year') {
    return String(year);
  }

  if (mode === 'month') {
    return `${year}-${pad(month)}`;
  }

  return `${year}-${pad(month)}-${pad(day)}`;
}

function compareValue(first: CalendarValue, second: CalendarValue): number {
  return first.localeCompare(second);
}

function sortRange(range: CalendarRangeValue): CalendarRangeValue {
  return compareValue(range[0], range[1]) <= 0 ? range : [range[1], range[0]];
}

function formatCalendarValue(value: CalendarValue, mode: CalendarMode, format?: CalendarFormat): string {
  if (typeof format === 'function') {
    return format(value);
  }

  if (format === 'dateSlash' || format === 'monthSlash') {
    return value.replace(/-/g, '/');
  }

  if (format === 'displayDate') {
    const [year, month, day] = value.split('-');
    return `${year}年${month}月${day}日`;
  }

  if (format === 'displayMonth') {
    const [year, month] = value.split('-');
    return `${year}年${month}月`;
  }

  if (format === 'displayYear') {
    return `${value}年`;
  }

  return normalizeValue(value, mode);
}

function addPanel(panel: PanelDate, mode: CalendarMode, offset: number): PanelDate {
  if (mode === 'year') {
    return { ...panel, year: panel.year + offset * YEAR_WINDOW };
  }

  if (mode === 'month') {
    return { ...panel, year: panel.year + offset };
  }

  const nextMonth = panel.month + offset;
  const date = new Date(panel.year, nextMonth - 1, 1);

  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
  };
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function buildValues(panel: PanelDate, mode: CalendarMode): CalendarValue[] {
  if (mode === 'year') {
    const startYear = panel.year - (panel.year % YEAR_WINDOW);

    return Array.from({ length: YEAR_WINDOW }, (_, index) => String(startYear + index));
  }

  if (mode === 'month') {
    return Array.from({ length: MONTH_COUNT }, (_, index) => `${panel.year}-${pad(index + 1)}`);
  }

  return Array.from(
    { length: daysInMonth(panel.year, panel.month) },
    (_, index) => `${panel.year}-${pad(panel.month)}-${pad(index + 1)}`,
  );
}

function panelTitle(panel: PanelDate, mode: CalendarMode): string {
  if (mode === 'year') {
    const startYear = panel.year - (panel.year % YEAR_WINDOW);
    return `${startYear}-${startYear + YEAR_WINDOW - 1}`;
  }

  if (mode === 'month') {
    return String(panel.year);
  }

  return `${panel.year}-${pad(panel.month)}`;
}

function isValueDisabled(
  value: CalendarValue,
  props: Pick<CalendarProps, 'disabled' | 'disabledDate' | 'maxDate' | 'minDate'>,
  mode: CalendarMode,
): boolean {
  if (props.disabled) {
    return true;
  }

  const normalized = normalizeValue(value, mode);

  if (props.minDate && compareValue(normalized, normalizeValue(props.minDate, mode)) < 0) {
    return true;
  }

  if (props.maxDate && compareValue(normalized, normalizeValue(props.maxDate, mode)) > 0) {
    return true;
  }

  return Boolean(props.disabledDate?.(normalized));
}

function renderTextNode(node: ReactNode) {
  if (node === undefined || node === null || node === false) {
    return null;
  }

  if (typeof node === 'string' || typeof node === 'number') {
    return <Text>{node}</Text>;
  }

  return node;
}

function renderSlotNode(node: ReactNode, text?: string) {
  if (node !== undefined) {
    return node;
  }

  return text === undefined ? null : <Text>{text}</Text>;
}

interface CalendarGridProps {
  disabledProps: Pick<CalendarProps, 'disabled' | 'disabledDate' | 'maxDate' | 'minDate'>;
  draftRange?: CalendarValue[];
  marks?: CalendarProps['marks'];
  mode: CalendarMode;
  panel: PanelDate;
  rangeValue?: CalendarRangeValue;
  selectedValue?: CalendarValue;
  styles: ReturnType<typeof useCalendarStyles>;
  slotStyles: CalendarProps['styles'];
  onSelect: (value: CalendarValue) => void;
}

function CalendarGrid({
  disabledProps,
  draftRange,
  marks,
  mode,
  onSelect,
  panel,
  rangeValue,
  selectedValue,
  slotStyles,
  styles,
}: CalendarGridProps) {
  const values = buildValues(panel, mode);
  const today = todayValue(mode);
  const activeRange = draftRange?.length === 2
    ? sortRange([draftRange[0], draftRange[1]])
    : rangeValue;

  return (
    <View style={[styles.grid, slotStyles?.grid]}>
      {values.map((value) => {
        const normalized = normalizeValue(value, mode);
        const disabled = isValueDisabled(normalized, disabledProps, mode);
        const selected = selectedValue === normalized ||
          Boolean(activeRange && (activeRange[0] === normalized || activeRange[1] === normalized));
        const inRange = Boolean(
          activeRange &&
          compareValue(normalized, activeRange[0]) >= 0 &&
          compareValue(normalized, activeRange[1]) <= 0,
        );
        const isToday = today === normalized;
        const mark = mode === 'date'
          ? marks?.find(item => item.date === normalized)
          : undefined;

        return (
          <Pressable
            disabled={disabled}
            key={normalized}
            onPress={() => {
              if (!disabled) {
                onSelect(normalized);
              }
            }}
            style={[
              styles.cell,
              mode === 'month' ? styles.monthCell : null,
              mode === 'year' ? styles.yearCell : null,
              slotStyles?.cell,
              inRange ? styles.cellInRange : null,
              selected ? styles.cellSelected : null,
              isToday ? styles.cellToday : null,
              disabled ? styles.cellDisabled : null,
            ]}
            testID={`calendar-cell-${normalized}`}
          >
            <Text style={[styles.dateText, slotStyles?.dateText]}>
              {mode === 'year' ? normalized : normalized.split('-').at(-1)}
            </Text>
            {mark ? <View style={[styles.mark, slotStyles?.mark]}>{renderTextNode(mark.content)}</View> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

function CalendarRoot({
  cancel,
  cancelText = DEFAULT_CANCEL_TEXT,
  defaultValue,
  disabled,
  disabledDate,
  format,
  marks,
  maxDate,
  minDate,
  mode,
  next,
  nextText,
  onCancel,
  onChange,
  onOk,
  ok,
  okText = DEFAULT_OK_TEXT,
  previous,
  previousText,
  readonly,
  showConfirm,
  showToday,
  size,
  style,
  styles,
  today,
  todayText = DEFAULT_TODAY_TEXT,
  value,
}: CalendarProps) {
  const resolvedMode = resolveMode(mode);
  const resolvedSize = resolveSize(size);
  const tokenStyles = useCalendarStyles({ size: resolvedSize });
  const normalizedControlledValue =
    value === undefined ? undefined : normalizeValue(value, resolvedMode);
  const [committedValue, setCommittedValue] = useControllableValue(
    defaultValue ? normalizeValue(defaultValue, resolvedMode) : undefined,
    normalizedControlledValue,
    onChange,
  );
  const [draftValue, setDraftValue] = useState<CalendarValue | undefined>(undefined);
  const visibleValue = draftValue ?? committedValue;
  const [panel, setPanel] = useState(parsePanel(visibleValue));
  const isInteractive = !disabled && !readonly;

  const commitValue = (nextValue: CalendarValue): void => {
    setCommittedValue(nextValue);
  };
  const handleSelect = (nextValue: CalendarValue): void => {
    if (!isInteractive) {
      return;
    }

    if (showConfirm) {
      setDraftValue(nextValue);
      return;
    }

    commitValue(nextValue);
  };
  const handleConfirm = (): void => {
    if (!draftValue) {
      return;
    }

    commitValue(draftValue);
    onOk?.(draftValue);
    setDraftValue(undefined);
  };
  const handleToday = (): void => {
    const nextToday = todayValue(resolvedMode);

    setPanel(parsePanel(nextToday));

    if (!isValueDisabled(nextToday, { disabled, disabledDate, maxDate, minDate }, resolvedMode)) {
      handleSelect(nextToday);
    }
  };

  return (
    <View style={[tokenStyles.root, style]}>
      {visibleValue ? (
        <Text>{formatCalendarValue(visibleValue, resolvedMode, format)}</Text>
      ) : null}
      <View style={[tokenStyles.header, styles?.header]}>
        <Pressable
          disabled={disabled}
          onPress={() => {
            if (!disabled) {
              setPanel(addPanel(panel, resolvedMode, -1));
            }
          }}
          style={tokenStyles.navButton}
          testID="calendar-nav-prev"
        >
          {renderSlotNode(previous, previousText) ?? (
            <Icon
              color="icon"
              icon="caret-left"
              size={resolvedSize}
            />
          )}
        </Pressable>
        <Text style={[tokenStyles.title, styles?.title]}>{panelTitle(panel, resolvedMode)}</Text>
        <Pressable
          disabled={disabled}
          onPress={() => {
            if (!disabled) {
              setPanel(addPanel(panel, resolvedMode, 1));
            }
          }}
          style={tokenStyles.navButton}
          testID="calendar-nav-next"
        >
          {renderSlotNode(next, nextText) ?? (
            <Icon
              color="icon"
              icon="caret-right"
              size={resolvedSize}
            />
          )}
        </Pressable>
      </View>
      {resolvedMode === 'date' ? (
        <View style={[tokenStyles.weekHeader, styles?.weekHeader]}>
          {WEEK_DAYS.map(day => (
            <View key={day} style={tokenStyles.weekCell}>
              <Text style={[tokenStyles.weekText, styles?.weekText]}>{day}</Text>
            </View>
          ))}
        </View>
      ) : null}
      <CalendarGrid
        disabledProps={{ disabled, disabledDate, maxDate, minDate }}
        marks={marks}
        mode={resolvedMode}
        onSelect={handleSelect}
        panel={panel}
        selectedValue={visibleValue}
        slotStyles={styles}
        styles={tokenStyles}
      />
      {showToday || showConfirm ? (
        <View style={[tokenStyles.footer, styles?.footer]}>
          {showToday ? (
            <Pressable
              disabled={disabled}
              hitSlop={ACTION_HIT_SLOP}
              onPress={handleToday}
            >
              {renderSlotNode(today, todayText)}
            </Pressable>
          ) : null}
          {showConfirm ? (
            <>
              <Pressable
                disabled={disabled}
                hitSlop={ACTION_HIT_SLOP}
                onPress={() => {
                  setDraftValue(undefined);
                  onCancel?.();
                }}
                style={tokenStyles.footerAction}
              >
                {renderSlotNode(cancel, cancelText)}
              </Pressable>
              <Pressable
                disabled={disabled}
                hitSlop={ACTION_HIT_SLOP}
                onPress={handleConfirm}
                style={tokenStyles.footerAction}
                testID="calendar-confirm"
              >
                {renderSlotNode(ok, okText)}
              </Pressable>
            </>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function CalendarRange({
  cancel,
  cancelText = DEFAULT_CANCEL_TEXT,
  defaultValue,
  disabled,
  disabledDate,
  format,
  marks,
  maxDate,
  minDate,
  mode,
  next,
  nextText,
  onCancel,
  onChange,
  onOk,
  ok,
  okText = DEFAULT_OK_TEXT,
  previous,
  previousText,
  readonly,
  showConfirm,
  showToday,
  size,
  style,
  styles,
  today,
  todayText = DEFAULT_TODAY_TEXT,
  value,
}: CalendarRangeProps) {
  const resolvedMode = resolveMode(mode);
  const resolvedSize = resolveSize(size);
  const tokenStyles = useCalendarStyles({ size: resolvedSize });
  const normalizedControlledValue =
    value === undefined
      ? undefined
      : [normalizeValue(value[0], resolvedMode), normalizeValue(value[1], resolvedMode)] as CalendarRangeValue;
  const [committedValue, setCommittedValue] = useControllableValue<CalendarRangeValue>(
    defaultValue
      ? [normalizeValue(defaultValue[0], resolvedMode), normalizeValue(defaultValue[1], resolvedMode)]
      : undefined,
    normalizedControlledValue,
    onChange,
  );
  const [draftRange, setDraftRange] = useState<CalendarValue[]>([]);
  const [panel, setPanel] = useState(parsePanel(committedValue?.[0]));
  const isInteractive = !disabled && !readonly;

  const commitRange = (nextRange: CalendarRangeValue): void => {
    const sorted = sortRange(nextRange);
    setCommittedValue(sorted);
  };
  const handleSelect = (nextValue: CalendarValue): void => {
    if (!isInteractive) {
      return;
    }

    const nextDraft = [...draftRange, nextValue];

    if (nextDraft.length < 2) {
      setDraftRange(nextDraft);
      return;
    }

    const completeRange = sortRange([nextDraft[0], nextDraft[1]]);

    if (showConfirm) {
      setDraftRange(completeRange);
      return;
    }

    commitRange(completeRange);
    setDraftRange([]);
  };
  const handleConfirm = (): void => {
    if (draftRange.length !== 2) {
      return;
    }

    const sorted = sortRange([draftRange[0], draftRange[1]]);
    commitRange(sorted);
    onOk?.(sorted);
    setDraftRange([]);
  };
  const displayValue = committedValue
    ? `${formatCalendarValue(committedValue[0], resolvedMode, format)} - ${formatCalendarValue(committedValue[1], resolvedMode, format)}`
    : null;

  return (
    <View style={[tokenStyles.root, style]}>
      {displayValue ? <Text>{displayValue}</Text> : null}
      <View style={[tokenStyles.header, styles?.header]}>
        <Pressable
          disabled={disabled}
          onPress={() => {
            if (!disabled) {
              setPanel(addPanel(panel, resolvedMode, -1));
            }
          }}
          style={tokenStyles.navButton}
          testID="calendar-nav-prev"
        >
          {renderSlotNode(previous, previousText) ?? (
            <Icon
              color="icon"
              icon="caret-left"
              size={resolvedSize}
            />
          )}
        </Pressable>
        <Text style={[tokenStyles.title, styles?.title]}>{panelTitle(panel, resolvedMode)}</Text>
        <Pressable
          disabled={disabled}
          onPress={() => {
            if (!disabled) {
              setPanel(addPanel(panel, resolvedMode, 1));
            }
          }}
          style={tokenStyles.navButton}
          testID="calendar-nav-next"
        >
          {renderSlotNode(next, nextText) ?? (
            <Icon
              color="icon"
              icon="caret-right"
              size={resolvedSize}
            />
          )}
        </Pressable>
      </View>
      <CalendarGrid
        disabledProps={{ disabled, disabledDate, maxDate, minDate }}
        draftRange={draftRange}
        marks={marks}
        mode={resolvedMode}
        onSelect={handleSelect}
        panel={panel}
        rangeValue={committedValue}
        slotStyles={styles}
        styles={tokenStyles}
      />
      {showToday || showConfirm ? (
        <View style={[tokenStyles.footer, styles?.footer]}>
          {showToday ? (
            <Pressable
              disabled={disabled}
              hitSlop={ACTION_HIT_SLOP}
              onPress={() => {
                const nextToday = todayValue(resolvedMode);
                setPanel(parsePanel(nextToday));

                if (!isValueDisabled(nextToday, { disabled, disabledDate, maxDate, minDate }, resolvedMode)) {
                  handleSelect(nextToday);
                }
              }}
            >
              {renderSlotNode(today, todayText)}
            </Pressable>
          ) : null}
          {showConfirm ? (
            <>
              <Pressable
                disabled={disabled}
                hitSlop={ACTION_HIT_SLOP}
                onPress={() => {
                  setDraftRange([]);
                  onCancel?.();
                }}
                style={tokenStyles.footerAction}
              >
                {renderSlotNode(cancel, cancelText)}
              </Pressable>
              <Pressable
                disabled={disabled}
                hitSlop={ACTION_HIT_SLOP}
                onPress={handleConfirm}
                style={tokenStyles.footerAction}
                testID="calendar-confirm"
              >
                {renderSlotNode(ok, okText)}
              </Pressable>
            </>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export const Calendar = Object.assign(CalendarRoot, {
  Range: CalendarRange,
});
