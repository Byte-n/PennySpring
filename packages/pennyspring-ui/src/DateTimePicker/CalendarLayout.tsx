import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { createUseSheetStyle, useTheme } from '@pennyspring/theme';
import { CalendarPickerSheet } from '../CalendarPicker/CalendarPickerSheet';
import { CalendarPickerView } from '../CalendarPicker/CalendarPickerView';
import {
  formatDateValue,
  parseDateValue,
  startOfDay,
} from '../CalendarPicker/dateValue';
import { PickerTrigger } from '../_internal/PickerTrigger';
import { getPickerItemHeight } from '../Picker/usePickerStyles';
import { Text } from '../Text';
import { WheelGroup } from '../WheelGroup';
import { useControllableValue } from '../_hooks';
import {
  getCalendarViewMode,
  getDatePrecision,
  getTimePrecision,
  hasTimePart,
  normalizePrecision,
} from './precision';
import {
  buildTimeColumns,
  dateToTimePickerValue,
  getTimeCandidateDate,
  formatTimeDateValue,
  getTimeColumnTypes,
  pickerValueToTimeDate,
} from './timeColumns';
import type { CalendarPickerViewStyles } from '../CalendarPicker/types';
import type { PickerColumnItemData, PickerValue } from '../Picker';
import type { WheelGroupStyles } from '../WheelGroup';
import type { ComponentSize } from '../shares/types';
import type { DateTimePickerCoreProps } from './DateTimePickerCore';
import type {
  DateTimePickerParts,
  DateTimePickerPrecision,
  DateTimePickerValueParams,
} from './types';

const DEFAULT_SIZE: ComponentSize = 'normal';
const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'];

type DateTimeCalendarView = 'calendar' | 'time';

const useStyles = createUseSheetStyle(token => ({
  content: {
    position: 'relative',
  },
  calendarRoot: {
    backgroundColor: token.colorBgElevated,
  },
  timePane: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
  },
  entry: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: token.marginXS,
    minHeight: token.controlHeight,
    borderTopWidth: token.lineWidth,
    borderTopColor: token.colorBorderSecondary,
  },
  entryLabel: {
    flexShrink: 0,
  },
  entryValue: {
    flex: 1,
    textAlign: 'right',
  },
  entryArrow: {
    flexShrink: 0,
  },
  loading: {
    minHeight: token.controlHeight,
    alignItems: 'center',
    justifyContent: 'center',
    gap: token.marginXS,
    padding: token.paddingMD,
  },
}));

function formatShortDate(date: Date): string {
  return `${date.getMonth() + 1}月${date.getDate()}日 周${WEEK_DAYS[date.getDay()]}`;
}

/** 触发器文本：日期部分按精度裁剪，时间部分仅在含时间时拼接。 */
function formatValueText(
  parts: DateTimePickerParts,
  precision: DateTimePickerPrecision,
  date: Date,
): string {
  const dateText = formatDateValue(date, getDatePrecision(precision));

  if (!hasTimePart(parts, precision)) {
    return dateText;
  }

  return `${dateText} ${formatTimeDateValue(date, getTimePrecision(precision))}`;
}

/** 不含时间部分的选择器把时分秒归零，与滚轮布局保持一致。 */
function normalizeDateOnly(date: Date, dateOnly: boolean): Date {
  return dateOnly ? startOfDay(date) : date;
}

function buildValueParams(date: Date): DateTimePickerValueParams {
  return {
    date,
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
  };
}

/**
 * 日历布局：底部浮层内使用日历面板选择日期，含时间精度时支持翻转到时间轮盘。
 */
export function DateTimeCalendarPicker(props: DateTimePickerCoreProps) {
  const precision = normalizePrecision(props.parts, props.precision);
  const size = props.size ?? DEFAULT_SIZE;
  const { token } = useTheme();
  const styles = useStyles();

  const showTime = hasTimePart(props.parts, precision);
  const dateOnly = !showTime;
  const calendarMode = getCalendarViewMode(precision);
  const panelPrecision = getDatePrecision(precision);

  const [resolvedOpen, setResolvedOpen] = useControllableValue(
    props.defaultOpen === true,
    props.open,
    undefined,
  );
  const isOpen = resolvedOpen === true;
  const isLoading = props.loading === true;

  const [mainTime, setMainTime] = useControllableValue<number | undefined>(
    props.defaultValue?.getTime(),
    props.value?.getTime(),
    undefined,
  );
  // 未提交过任何值时触发器保持空白，避免把「今天」误当成选中值。
  const hasValue = mainTime !== undefined;
  // 缺省日期必须稳定，否则每次渲染都会生成新时间戳并触发草稿同步。
  const minTimestamp = props.min?.getTime();
  const fallbackTimestamp = useMemo(
    () => minTimestamp ?? new Date().getTime(),
    [minTimestamp],
  );
  const mainTimestamp = mainTime ?? fallbackTimestamp;
  const committedDate = useMemo(() => new Date(mainTimestamp), [mainTimestamp]);
  const [draft, setDraft] = useState<Date>(
    () => normalizeDateOnly(new Date(mainTimestamp), dateOnly),
  );
  const [view, setView] = useState<DateTimeCalendarView>('calendar');

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setDraft(normalizeDateOnly(new Date(mainTimestamp), dateOnly));
    setView('calendar');
  }, [dateOnly, isOpen, mainTimestamp]);

  const flipProgress = useSharedValue(view === 'time' ? 1 : 0);

  useEffect(() => {
    const easing = Easing?.bezier?.(...token.motionEaseOut);

    flipProgress.value = withTiming(view === 'time' ? 1 : 0, {
      duration: token.motionDurationMid,
      ...(easing ? { easing } : null),
    });
  }, [
    flipProgress,
    token.motionDurationMid,
    token.motionEaseOut,
    view,
  ]);

  const calendarAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 1 - flipProgress.value,
    transform: [{ translateX: -token.margin * flipProgress.value }],
  }));
  const timeAnimatedStyle = useAnimatedStyle(() => ({
    opacity: flipProgress.value,
    transform: [{ translateX: token.margin * (1 - flipProgress.value) }],
  }));

  const draftDayKey = `${draft.getFullYear()}-${draft.getMonth()}-${draft.getDate()}`;
  const timeBaseDate = useMemo(
    () => new Date(draft),
    // 只有日期变化时才重建时间列，避免滚轮每次滚动都重建候选项。
    [draftDayKey],
  );
  const timeColumns = useMemo(
    () => showTime
      ? buildTimeColumns({
        baseDate: timeBaseDate,
        disabledDate: props.disabledDate,
        formatLabel: props.formatLabel,
        max: props.max,
        min: props.min,
        minuteStep: props.minuteStep,
        precision: getTimePrecision(precision),
        secondStep: props.secondStep,
      })
      : [],
    [
      props.disabledDate,
      props.formatLabel,
      props.max,
      props.min,
      props.minuteStep,
      props.secondStep,
      precision,
      showTime,
      timeBaseDate,
    ],
  );
  const timeValues = useMemo(
    () => showTime
      ? dateToTimePickerValue(draft, getTimePrecision(precision))
      : [],
    [draft, precision, showTime],
  );
  const columnTypes = useMemo(
    () => getTimeColumnTypes(getTimePrecision(precision)),
    [precision],
  );
  const renderLabel = props.renderLabel;
  const wheelRenderLabel = renderLabel
    ? (item: PickerColumnItemData, columnIndex: number) => {
        const type = columnTypes[columnIndex];
        const value = Number(item.value);
        const candidate = getTimeCandidateDate(
          type,
          value,
          timeBaseDate,
          getTimePrecision(precision),
        );

        return renderLabel({ type, value, date: candidate });
      }
    : undefined;
  const wheelStyles = useMemo<WheelGroupStyles>(
    () => ({
      band: props.styles?.panel?.body?.view?.indicator,
      column: props.styles?.panel?.body?.view?.column?.root,
      item: props.styles?.panel?.body?.view?.column?.item,
      itemText: props.styles?.panel?.body?.view?.column?.itemText,
    }),
    [props.styles],
  );
  const wheelItemHeight = getPickerItemHeight(size, token);
  const calendarStyles = useMemo<CalendarPickerViewStyles>(
    () => ({
      ...props.styles?.calendar,
      root: [props.styles?.calendar?.root, styles.calendarRoot],
    }),
    [props.styles?.calendar, styles.calendarRoot],
  );
  const calendarValue = formatDateValue(draft, panelPrecision);
  const minDate = props.min
    ? formatDateValue(props.min, panelPrecision)
    : undefined;
  const maxDate = props.max
    ? formatDateValue(props.max, panelPrecision)
    : undefined;
  const marks = useMemo(
    () => props.marks?.map(mark => ({
      date: formatDateValue(mark.date, panelPrecision),
      content: mark.content,
    })),
    [panelPrecision, props.marks],
  );
  // 面板只处理字符串值，这里把字符串还原成 Date 后交给外部禁用判断。
  const panelDisabledDate = useMemo(
    () => props.disabledDate
      ? (value: string) => props.disabledDate!(parseDateValue(value, committedDate))
      : undefined,
    [committedDate, props.disabledDate],
  );

  const timeInvalid = showTime && timeColumns.some((column, columnIndex) => {
    const itemValue = timeValues[columnIndex];

    return column.find(item => item.value === itemValue)?.disabled === true;
  });
  const resolvedOkDisabled = props.okDisabled === true || timeInvalid || isLoading;

  function applyDraft(next: Date) {
    setDraft(next);
    props.onChange?.(next, buildValueParams(next));
  }

  function handleCalendarChange(value: string) {
    applyDraft(normalizeDateOnly(parseDateValue(value, draft), dateOnly));
  }

  function handleTimeChange(nextValue: PickerValue[]) {
    applyDraft(
      pickerValueToTimeDate(nextValue, draft, getTimePrecision(precision)),
    );
  }

  function handleTriggerPress() {
    if (props.disabled || props.readonly) {
      return;
    }

    setDraft(normalizeDateOnly(new Date(mainTimestamp), dateOnly));
    setView('calendar');
    setResolvedOpen(true);
    props.onOpenChange?.(true, { reason: 'trigger' });
  }

  function closePanel(reason: 'cancel' | 'mask' | 'ok') {
    setResolvedOpen(false);
    props.onOpenChange?.(false, { reason });
  }

  function handleCancelPress() {
    props.onCancel?.({ reason: 'cancel' });
    closePanel('cancel');
  }

  function handleMaskPress() {
    props.onCancel?.({ reason: 'mask' });
  }

  function handleClearPress() {
    if (props.disabled || props.readonly) {
      return;
    }

    setMainTime(undefined);
    setDraft(normalizeDateOnly(new Date(), dateOnly));
    props.onClear?.();
  }

  function handleOkPress() {
    if (props.disabled || resolvedOkDisabled) {
      return;
    }

    setMainTime(draft.getTime());
    props.onOk?.(draft, buildValueParams(draft));
    closePanel('ok');
  }

  return (
    <>
      <PickerTrigger
        active={isOpen && props.status !== 'error'}
        allowClear={props.allowClear}
        disabled={props.disabled || isLoading}
        displayInputProps={props.displayInputProps}
        error={props.error}
        errorText={props.errorText}
        externalInputStyles={props.styles?.input}
        externalTriggerStyle={[props.styles?.trigger, props.style]}
        hasValue={hasValue}
        helper={props.helper}
        helperText={props.helperText}
        label={props.label ?? props.labelText}
        onClearPress={handleClearPress}
        onPress={handleTriggerPress}
        readonly={props.readonly}
        size={size}
        status={props.status}
        valueText={hasValue
          ? formatValueText(props.parts, precision, committedDate)
          : undefined}
      />
      <CalendarPickerSheet
        cancel={props.cancel}
        cancelText={props.cancelText}
        ok={props.ok}
        okDisabled={resolvedOkDisabled}
        okText={props.okText}
        onCancelPress={handleCancelPress}
        onMaskPress={handleMaskPress}
        onOkPress={handleOkPress}
        onOpenChange={nextOpen => {
          if (nextOpen) {
            return;
          }

          closePanel('mask');
        }}
        open={isOpen}
        panelStyles={props.styles?.panel}
        popupStyles={props.styles?.popup}
        size={size}
        title={props.title}
        titleText={props.titleText}
      >
        <View style={styles.content}>
          {isLoading ? (
            <View style={styles.loading} testID="date-time-calendar-loading">
              {props.loadingIndicator ?? (
                <ActivityIndicator color={token.colorTextTertiary} />
              )}
              {props.loadingIndicatorText !== undefined ? (
                <Text color="description">{props.loadingIndicatorText}</Text>
              ) : null}
            </View>
          ) : (
            <Animated.View
              pointerEvents={view === 'calendar' ? 'auto' : 'none'}
              style={calendarAnimatedStyle}
            >
              <CalendarPickerView
                disabled={props.disabled}
                disabledDate={panelDisabledDate}
                marks={marks}
                maxDate={maxDate}
                minDate={minDate}
                mode={calendarMode}
                onChange={handleCalendarChange}
                readonly={props.readonly}
                showValue={false}
                size={size}
                styles={calendarStyles}
                value={calendarValue}
              />
            </Animated.View>
          )}
          {showTime && !isLoading ? (
            <Animated.View
              pointerEvents={view === 'time' ? 'auto' : 'none'}
              style={[styles.timePane, timeAnimatedStyle]}
            >
              <WheelGroup
                columns={timeColumns}
                fit="container"
                itemHeight={wheelItemHeight}
                onChange={handleTimeChange}
                renderLabel={wheelRenderLabel}
                styles={wheelStyles}
                testID="date-time-calendar-wheel"
                value={timeValues}
              />
            </Animated.View>
          ) : null}
        </View>
        {showTime && !isLoading ? (
          <Pressable
            onPress={() =>
              setView(current => (current === 'calendar' ? 'time' : 'calendar'))
            }
            style={[styles.entry, props.styles?.entry?.row]}
            testID="date-time-calendar-entry"
          >
            <Text
              color="description"
              size="sm"
              style={[styles.entryLabel, props.styles?.entry?.label]}
              testID="date-time-calendar-entry-label"
            >
              {view === 'calendar' ? '时间' : '日期'}
            </Text>
            <Text
              color="primaryText"
              size="sm"
              style={[styles.entryValue, props.styles?.entry?.value]}
              testID="date-time-calendar-entry-value"
              weight="strong"
            >
              {view === 'calendar'
                ? formatTimeDateValue(draft, getTimePrecision(precision))
                : formatShortDate(draft)}
            </Text>
            <Text
              color="tertiary"
              size="sm"
              style={[styles.entryArrow]}
            >
              ›
            </Text>
          </Pressable>
        ) : null}
      </CalendarPickerSheet>
    </>
  );
}
