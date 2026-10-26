import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { Icon } from '../Icon';
import { Column } from '../Column';
import { Row } from '../Row';
import { Text } from '../Text';
import { useControllableValue } from '../_hooks';
import type { ReactNode } from 'react';
import type { AliasToken } from '@pennyspring/theme';
import type {
  CalendarPickerViewFormat,
  CalendarPickerViewMode,
  CalendarPickerViewProps,
  CalendarPickerViewRangeProps,
  CalendarPickerViewRangeValue,
  CalendarPickerViewSize,
  CalendarPickerViewStyles,
  CalendarPickerViewValue,
} from './types';
import type { ComponentSize } from '../shares/types';

const DEFAULT_SIZE: CalendarPickerViewSize = 'normal';
const DEFAULT_MODE: CalendarPickerViewMode = 'date';
const DEFAULT_TODAY_TEXT = '今天';
const DEFAULT_CANCEL_TEXT = '取消';
const DEFAULT_OK_TEXT = '确定';
const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'];
const MONTH_COUNT = 12;
const YEAR_WINDOW = 12;
const DATE_COLUMN_COUNT = 7;
const MONTH_COLUMN_COUNT = 3;
const YEAR_COLUMN_COUNT = 4;

interface CalendarStyleOptions {
  size: CalendarPickerViewSize;
}

interface PanelDate {
  year: number;
  month: number;
}

function getCellHeight(size: CalendarPickerViewSize, token: AliasToken) {
  if (size === 'small') {
    return token.controlHeightSM;
  }

  if (size === 'large') {
    return token.controlHeightLG;
  }

  return token.controlHeight;
}

function resolveColumnCount(mode: CalendarPickerViewMode): number {
  if (mode === 'month') {
    return MONTH_COLUMN_COUNT;
  }

  if (mode === 'year') {
    return YEAR_COLUMN_COUNT;
  }

  return DATE_COLUMN_COUNT;
}

function resolveCellFlexBasis(mode: CalendarPickerViewMode): `${number}%` {
  return `${100 / resolveColumnCount(mode)}%`;
}

const useCalendarStyles = createUseSheetStyle(
  (token, { size }: CalendarStyleOptions) => ({
    root: {
      backgroundColor: token.colorBgContainer,
    },
    header: {
      marginBottom: token.marginSM,
    },
    title: {
    },
    titleColumn: {
      flexShrink: 1,
    },
    valueText: {
      marginTop: token.marginXXS,
    },
    navGroup: {
      flexShrink: 0,
    },
    navButton: {
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: token.controlHeightSM,
      minHeight: token.controlHeightSM,
      borderRadius: token.borderRadiusSM,
      backgroundColor: token.colorFillTertiary,
    },
    navButtonText: {
      paddingHorizontal: token.paddingSM,
    },
    weekHeader: {
      flexDirection: 'row',
      marginBottom: token.marginXXS,
    },
    weekCell: {
      flexBasis: resolveCellFlexBasis('date'),
      alignItems: 'center',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    cell: {
      flexBasis: resolveCellFlexBasis('date'),
      minHeight: getCellHeight(size, token),
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: token.borderRadiusSM,
    },
    monthCell: {
      flexBasis: resolveCellFlexBasis('month'),
    },
    yearCell: {
      flexBasis: resolveCellFlexBasis('year'),
    },
    cellSelected: {
      backgroundColor: token.colorPrimary,
    },
    cellDisabled: {
      opacity: token.opacityLoading,
    },
    cellToday: {
      borderWidth: token.lineWidth,
      borderColor: token.colorPrimary,
    },
    cellInRange: {
      backgroundColor: token.colorPrimaryBg,
    },
    mark: {
      alignItems: 'center',
      marginTop: token.marginXXS,
    },
    markDot: {
      width: token.sizeXXS,
      height: token.sizeXXS,
      borderRadius: token.borderRadiusSM,
      backgroundColor: token.colorPrimary,
    },
    markDotSelected: {
      backgroundColor: token.colorTextLightSolid,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: token.marginSM,
      marginTop: token.marginSM,
    },
  }),
);

function resolveSize(size?: ComponentSize): ComponentSize {
  return size ?? DEFAULT_SIZE;
}

function resolveMode(mode?: CalendarPickerViewMode): CalendarPickerViewMode {
  return mode ?? DEFAULT_MODE;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function parsePanel(value: CalendarPickerViewValue | undefined): PanelDate {
  const now = new Date();
  const [year, month] = String(value ?? '').split('-');

  return {
    year: Number(year) || now.getFullYear(),
    month: Math.max(1, Math.min(MONTH_COUNT, Number(month) || now.getMonth() + 1)),
  };
}

function normalizeValue(value: CalendarPickerViewValue | undefined, mode: CalendarPickerViewMode): CalendarPickerViewValue {
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

function todayValue(mode: CalendarPickerViewMode): CalendarPickerViewValue {
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

function compareValue(first: CalendarPickerViewValue, second: CalendarPickerViewValue): number {
  return first.localeCompare(second);
}

function sortRange(range: CalendarPickerViewRangeValue): CalendarPickerViewRangeValue {
  return compareValue(range[0], range[1]) <= 0 ? range : [range[1], range[0]];
}

function formatCalendarPickerViewValue(value: CalendarPickerViewValue, mode: CalendarPickerViewMode, format?: CalendarPickerViewFormat): string {
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

function addPanel(panel: PanelDate, mode: CalendarPickerViewMode, offset: number): PanelDate {
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

function buildValues(panel: PanelDate, mode: CalendarPickerViewMode): CalendarPickerViewValue[] {
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

function panelTitle(panel: PanelDate, mode: CalendarPickerViewMode): string {
  if (mode === 'year') {
    const startYear = panel.year - (panel.year % YEAR_WINDOW);
    return `${startYear} - ${startYear + YEAR_WINDOW - 1}`;
  }

  if (mode === 'month') {
    return `${panel.year} 年`;
  }

  return `${panel.year} 年 ${panel.month} 月`;
}

function isValueDisabled(
  value: CalendarPickerViewValue,
  props: Pick<CalendarPickerViewProps, 'disabled' | 'disabledDate' | 'maxDate' | 'minDate'>,
  mode: CalendarPickerViewMode,
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

interface CalendarGridProps {
  disabledProps: Pick<CalendarPickerViewProps, 'disabled' | 'disabledDate' | 'maxDate' | 'minDate'>;
  draftRange?: CalendarPickerViewValue[];
  marks?: CalendarPickerViewProps['marks'];
  mode: CalendarPickerViewMode;
  panel: PanelDate;
  rangeValue?: CalendarPickerViewRangeValue;
  selectedValue?: CalendarPickerViewValue;
  styles: ReturnType<typeof useCalendarStyles>;
  slotStyles: CalendarPickerViewProps['styles'];
  onSelect: (value: CalendarPickerViewValue) => void;
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
            <Text
              color={selected ? 'lightSolid' : isToday ? 'primaryText' : 'default'}
              numberOfLines={1}
              style={slotStyles?.dateText}
            >
              {mode === 'year' ? normalized : normalized.split('-').at(-1)}
            </Text>
            {mark ? (
              <View
                style={[styles.mark, slotStyles?.mark]}
                testID={`calendar-mark-${normalized}`}
              >
                {mark.content === undefined ? (
                  <View
                    style={[
                      styles.markDot,
                      selected ? styles.markDotSelected : undefined,
                    ]}
                  />
                ) : (
                  renderTextNode(mark.content)
                )}
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

interface CalendarHeaderProps {
  disabled?: boolean;
  mode: CalendarPickerViewMode;
  next?: ReactNode;
  nextText?: string;
  onNext: () => void;
  onPrevious: () => void;
  panel: PanelDate;
  previous?: ReactNode;
  previousText?: string;
  showValue: boolean;
  size: CalendarPickerViewSize;
  slotStyles?: CalendarPickerViewStyles;
  styles: ReturnType<typeof useCalendarStyles>;
  valueText: string | null;
}

function CalendarHeader({
  disabled,
  mode,
  next,
  nextText,
  onNext,
  onPrevious,
  panel,
  previous,
  previousText,
  showValue,
  size,
  slotStyles,
  styles,
  valueText,
}: CalendarHeaderProps) {
  const hasPreviousContent = previous !== undefined || previousText !== undefined;
  const hasNextContent = next !== undefined || nextText !== undefined;

  return (
    <Row
      align="center"
      justify="between"
      style={[styles.header, slotStyles?.header]}
    >
      <Column style={styles.titleColumn}>
        <Text
          color="heading"
          numberOfLines={1}
          size="lg"
          style={[styles.title, slotStyles?.title]}
          weight="strong"
        >
          {panelTitle(panel, mode)}
        </Text>
        {showValue && valueText ? (
          <Text
            color="description"
            size="sm"
            style={[styles.valueText, slotStyles?.valueText]}
            testID="calendar-value-text"
          >
            {valueText}
          </Text>
        ) : null}
      </Column>
      <Row gap="small" style={styles.navGroup}>
        <Pressable
          disabled={disabled}
          onPress={onPrevious}
          style={[
            styles.navButton,
            hasPreviousContent ? styles.navButtonText : undefined,
          ]}
          testID="calendar-nav-prev"
        >
          {previous !== undefined ? (
            previous
          ) : previousText !== undefined ? (
            <Text numberOfLines={1} size="sm">{previousText}</Text>
          ) : (
            <Icon color="icon" icon="caret-left" size={size} />
          )}
        </Pressable>
        <Pressable
          disabled={disabled}
          onPress={onNext}
          style={[
            styles.navButton,
            hasNextContent ? styles.navButtonText : undefined,
          ]}
          testID="calendar-nav-next"
        >
          {next !== undefined ? (
            next
          ) : nextText !== undefined ? (
            <Text numberOfLines={1} size="sm">{nextText}</Text>
          ) : (
            <Icon color="icon" icon="caret-right" size={size} />
          )}
        </Pressable>
      </Row>
    </Row>
  );
}

interface CalendarFooterProps {
  actionHitSlop: number;
  cancel?: ReactNode;
  cancelText: string;
  disabled?: boolean;
  ok?: ReactNode;
  okText: string;
  onCancel: () => void;
  onConfirm: () => void;
  onToday: () => void;
  showConfirm?: boolean;
  showToday?: boolean;
  slotStyles?: CalendarPickerViewStyles;
  styles: ReturnType<typeof useCalendarStyles>;
  today?: ReactNode;
  todayText: string;
}

function CalendarFooter({
  actionHitSlop,
  cancel,
  cancelText,
  disabled,
  ok,
  okText,
  onCancel,
  onConfirm,
  onToday,
  showConfirm,
  showToday,
  slotStyles,
  styles,
  today,
  todayText,
}: CalendarFooterProps) {
  return (
    <View style={[styles.footer, slotStyles?.footer]}>
      {showToday ? (
        <Pressable disabled={disabled} hitSlop={actionHitSlop} onPress={onToday}>
          {today !== undefined ? (
            today
          ) : (
            <Text color="primaryText" size="sm" weight="medium">
              {todayText}
            </Text>
          )}
        </Pressable>
      ) : null}
      {showConfirm ? (
        <>
          <Pressable disabled={disabled} hitSlop={actionHitSlop} onPress={onCancel}>
            {cancel !== undefined ? (
              cancel
            ) : (
              <Text color="secondary" size="sm">
                {cancelText}
              </Text>
            )}
          </Pressable>
          <Pressable
            disabled={disabled}
            hitSlop={actionHitSlop}
            onPress={onConfirm}
            testID="calendar-confirm"
          >
            {ok !== undefined ? (
              ok
            ) : (
              <Text color="primaryText" size="sm" weight="strong">
                {okText}
              </Text>
            )}
          </Pressable>
        </>
      ) : null}
    </View>
  );
}

function CalendarPickerViewRoot({
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
  showValue = true,
  size,
  style,
  styles,
  today,
  todayText = DEFAULT_TODAY_TEXT,
  value,
}: CalendarPickerViewProps) {
  const { token } = useTheme();
  const resolvedMode = resolveMode(mode);
  const resolvedSize = resolveSize(size);
  const actionHitSlop = token.paddingXXS;
  const tokenStyles = useCalendarStyles({ size: resolvedSize });
  const normalizedControlledValue =
    value === undefined ? undefined : normalizeValue(value, resolvedMode);
  const [committedValue, setCommittedValue] = useControllableValue(
    defaultValue ? normalizeValue(defaultValue, resolvedMode) : undefined,
    normalizedControlledValue,
    onChange,
  );
  const [draftValue, setDraftValue] = useState<CalendarPickerViewValue | undefined>(undefined);
  const visibleValue = draftValue ?? committedValue;
  const [panel, setPanel] = useState(parsePanel(visibleValue));
  const isInteractive = !disabled && !readonly;

  const commitValue = (nextValue: CalendarPickerViewValue): void => {
    setCommittedValue(nextValue);
  };
  const handleSelect = (nextValue: CalendarPickerViewValue): void => {
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

  const valueText = visibleValue
    ? formatCalendarPickerViewValue(visibleValue, resolvedMode, format)
    : null;

  return (
    <View style={[tokenStyles.root, styles?.root, style]}>
      <CalendarHeader
        disabled={disabled}
        mode={resolvedMode}
        next={next}
        nextText={nextText}
        onNext={() => {
          if (!disabled) {
            setPanel(addPanel(panel, resolvedMode, 1));
          }
        }}
        onPrevious={() => {
          if (!disabled) {
            setPanel(addPanel(panel, resolvedMode, -1));
          }
        }}
        panel={panel}
        previous={previous}
        previousText={previousText}
        showValue={showValue}
        size={resolvedSize}
        slotStyles={styles}
        styles={tokenStyles}
        valueText={valueText}
      />
      {resolvedMode === 'date' ? (
        <View style={[tokenStyles.weekHeader, styles?.weekHeader]}>
          {WEEK_DAYS.map(day => (
            <View key={day} style={tokenStyles.weekCell}>
              <Text color="tertiary" style={styles?.weekText}>{day}</Text>
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
        <CalendarFooter
          cancel={cancel}
          cancelText={cancelText}
          disabled={disabled}
          actionHitSlop={actionHitSlop}
          ok={ok}
          okText={okText}
          onCancel={() => {
            setDraftValue(undefined);
            onCancel?.();
          }}
          onConfirm={handleConfirm}
          onToday={handleToday}
          showConfirm={showConfirm}
          showToday={showToday}
          slotStyles={styles}
          styles={tokenStyles}
          today={today}
          todayText={todayText}
        />
      ) : null}
    </View>
  );
}

function CalendarPickerViewRange({
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
  showValue = true,
  size,
  style,
  styles,
  today,
  todayText = DEFAULT_TODAY_TEXT,
  value,
}: CalendarPickerViewRangeProps) {
  const { token } = useTheme();
  const resolvedMode = resolveMode(mode);
  const resolvedSize = resolveSize(size);
  const actionHitSlop = token.paddingXXS;
  const tokenStyles = useCalendarStyles({ size: resolvedSize });
  const normalizedControlledValue =
    value === undefined
      ? undefined
      : [normalizeValue(value[0], resolvedMode), normalizeValue(value[1], resolvedMode)] as CalendarPickerViewRangeValue;
  const [committedValue, setCommittedValue] = useControllableValue<CalendarPickerViewRangeValue>(
    defaultValue
      ? [normalizeValue(defaultValue[0], resolvedMode), normalizeValue(defaultValue[1], resolvedMode)]
      : undefined,
    normalizedControlledValue,
    onChange,
  );
  const [draftRange, setDraftRange] = useState<CalendarPickerViewValue[]>([]);
  const [panel, setPanel] = useState(parsePanel(committedValue?.[0]));
  const isInteractive = !disabled && !readonly;

  const commitRange = (nextRange: CalendarPickerViewRangeValue): void => {
    const sorted = sortRange(nextRange);
    setCommittedValue(sorted);
  };
  const handleSelect = (nextValue: CalendarPickerViewValue): void => {
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
    ? `${formatCalendarPickerViewValue(committedValue[0], resolvedMode, format)} - ${formatCalendarPickerViewValue(committedValue[1], resolvedMode, format)}`
    : null;

  return (
    <View style={[tokenStyles.root, styles?.root, style]}>
      <CalendarHeader
        disabled={disabled}
        mode={resolvedMode}
        next={next}
        nextText={nextText}
        onNext={() => {
          if (!disabled) {
            setPanel(addPanel(panel, resolvedMode, 1));
          }
        }}
        onPrevious={() => {
          if (!disabled) {
            setPanel(addPanel(panel, resolvedMode, -1));
          }
        }}
        panel={panel}
        previous={previous}
        previousText={previousText}
        showValue={showValue}
        size={resolvedSize}
        slotStyles={styles}
        styles={tokenStyles}
        valueText={displayValue}
      />
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
        <CalendarFooter
          cancel={cancel}
          cancelText={cancelText}
          disabled={disabled}
          actionHitSlop={actionHitSlop}
          ok={ok}
          okText={okText}
          onCancel={() => {
            setDraftRange([]);
            onCancel?.();
          }}
          onConfirm={handleConfirm}
          onToday={() => {
            const nextToday = todayValue(resolvedMode);
            setPanel(parsePanel(nextToday));

            if (!isValueDisabled(nextToday, { disabled, disabledDate, maxDate, minDate }, resolvedMode)) {
              handleSelect(nextToday);
            }
          }}
          showConfirm={showConfirm}
          showToday={showToday}
          slotStyles={styles}
          styles={tokenStyles}
          today={today}
          todayText={todayText}
        />
      ) : null}
    </View>
  );
}

export const CalendarPickerView = Object.assign(CalendarPickerViewRoot, {
  Range: CalendarPickerViewRange,
});
