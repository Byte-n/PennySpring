import React, { useMemo } from 'react';
import { ActivityIndicator } from 'react-native';
import { useTheme } from '@pennyspring/theme';
import { Icon } from '../../Icon';
import { TagValueDisplay } from '../../_internal/TagValueDisplay';
import { PickerTrigger } from '../../_internal/PickerTrigger';
import { useControllableValue } from '../../_hooks';
import { ListPickerCascaderPopup } from './CascaderPopup';
import {
  buildRemoveParams,
  buildSelectParams,
  clampLevel,
  getOptionsAtLevel,
  getPathLabel,
  getPathOptions,
  getPathTagItems,
  getVisibleLevelCount,
  normalizeValue,
} from './utils';
import type { ComponentSize } from '../../shares/types';
import type { TabsItem } from '../../Tabs';
import type {
  ListPickerCascaderOption,
  ListPickerCascaderProps,
  ListPickerCascaderValue,
} from './types';
import type { ListPickerValue } from '../types';

const DEFAULT_SIZE: ComponentSize = 'normal';
const DEFAULT_EMPTY_TEXT = '暂无选项';
const DEFAULT_TAB_PLACEHOLDER = '请选择';
const DEFAULT_LOADING_TEXT = '加载中...';

function resolveSize(size?: ComponentSize): ComponentSize {
  return size ?? DEFAULT_SIZE;
}

export function ListPickerCascader<TData = unknown>({
  activeLevel,
  allowClear,
  closeOnSelectLeaf = true,
  defaultActiveLevel,
  defaultOpen,
  defaultValue,
  disabled,
  displayInputProps,
  displayMode,
  empty,
  error,
  errorText,
  helper,
  helperText,
  label,
  labelText,
  loading,
  onActiveLevelChange,
  onCancel,
  onChange,
  onClear,
  onOpenChange,
  open,
  options,
  popupProps,
  readonly,
  renderOptionLabel,
  size,
  status,
  style,
  styles,
  tagProps,
  texts,
  value,
}: ListPickerCascaderProps<TData>) {
  const resolvedSize = resolveSize(size);
  const { token } = useTheme();
  const [mergedOpen, setMergedOpen] = useControllableValue(
    defaultOpen === true,
    open,
    undefined,
  );
  const normalizedDefaultValue = useMemo(
    () => normalizeValue(options, defaultValue),
    [defaultValue, options],
  );
  const normalizedControlledValue = useMemo(
    () => (value === undefined ? undefined : normalizeValue(options, value)),
    [options, value],
  );
  const [mergedValue, setMergedValue] = useControllableValue(
    normalizedDefaultValue,
    normalizedControlledValue,
    undefined,
  );
  const currentValue: ListPickerCascaderValue = mergedValue ?? [];
  const selectedPath = useMemo(
    () => getPathOptions(options, currentValue),
    [currentValue, options],
  );
  const visibleLevelCount = getVisibleLevelCount(selectedPath);
  const [resolvedActiveLevel, setResolvedActiveLevel] = useControllableValue(
    defaultActiveLevel ?? clampLevel(selectedPath.length, visibleLevelCount),
    activeLevel,
    onActiveLevelChange,
  );
  const currentLevel = clampLevel(resolvedActiveLevel ?? 0, visibleLevelCount);
  const currentOptions = getOptionsAtLevel(options, selectedPath, currentLevel);
  const isInteractive = !disabled && !readonly && !loading;
  const isError = status === 'error';
  const selectedLabel = getPathLabel(options, currentValue);
  const tagItems = displayMode === 'tag'
    ? getPathTagItems(options, currentValue)
    : [];
  const resolvedTabPlaceholder =
    texts?.tabPlaceholderText ?? DEFAULT_TAB_PLACEHOLDER;
  const tabItems: Array<TabsItem> = Array.from(
    { length: visibleLevelCount },
    (_, level) => {
      const option = selectedPath[level];

      return {
        value: level,
        label: option?.label ?? option?.labelText ?? resolvedTabPlaceholder,
        disabled: disabled === true,
      };
    },
  );

  function setOpen(nextOpen: boolean): void {
    setMergedOpen(nextOpen);
  }

  function handleTriggerPress(): void {
    if (!isInteractive) {
      return;
    }

    const nextOpen = !mergedOpen;

    setOpen(nextOpen);
    onOpenChange?.(nextOpen, { reason: 'trigger' });
  }

  function handleRequestClose(): void {
    onCancel?.();
    setOpen(false);
    onOpenChange?.(false, { reason: 'cancel' });
  }

  function handleOptionPress(
    option: ListPickerCascaderOption<TData>,
    optionIndex: number,
  ): void {
    if (!isInteractive || option.disabled === true) {
      return;
    }

    const nextValue: ListPickerCascaderValue = [
      ...currentValue.slice(0, currentLevel),
      option.value,
    ];
    const params = buildSelectParams(
      options,
      nextValue,
      option,
      currentLevel,
      optionIndex,
    );

    setMergedValue(nextValue);
    onChange?.(nextValue, params);

    if (!params.isLeaf) {
      setResolvedActiveLevel(currentLevel + 1);
      return;
    }

    if (closeOnSelectLeaf) {
      setOpen(false);
      onOpenChange?.(false, { reason: 'select' });
    }
  }

  function handleTagRemove(removedValue: ListPickerValue): void {
    if (!isInteractive) {
      return;
    }

    const removedLevel = currentValue.indexOf(removedValue);

    if (removedLevel < 0) {
      return;
    }

    const nextValue = currentValue.slice(0, removedLevel);
    const params = buildRemoveParams(
      options,
      currentValue,
      nextValue,
      removedLevel,
    );

    setMergedValue(nextValue);

    if (params) {
      onChange?.(nextValue, params);
    }
  }

  function handleClearPress(): void {
    if (!isInteractive) {
      return;
    }

    const nextValue: ListPickerCascaderValue = [];

    setMergedValue(nextValue);
    onChange?.(nextValue, { reason: 'clear', path: [], items: [] });
    onClear?.();
  }

  return (
    <>
      <PickerTrigger
        active={mergedOpen && !isError}
        allowClear={allowClear}
        disabled={disabled === true || loading === true}
        displayInputProps={displayInputProps}
        error={error}
        errorText={errorText}
        externalInputStyles={styles?.input}
        externalTriggerStyle={style}
        hasValue={selectedPath.length > 0}
        helper={helper}
        helperText={helperText}
        label={label ?? labelText}
        onClearPress={handleClearPress}
        overflow={
          displayInputProps?.overflow ??
          (displayMode === 'tag' ? 'visible' : 'hidden')
        }
        readonly={readonly}
        size={resolvedSize}
        status={status}
        suffix={
          loading === true ? (
            <ActivityIndicator color={token.colorTextTertiary} />
          ) : (
            <Icon color="icon" icon="caret-down" />
          )
        }
        valueText={
          displayMode !== 'tag' && selectedLabel.length > 0
            ? selectedLabel
            : undefined
        }
        onPress={handleTriggerPress}
      >
        {displayMode === 'tag' && tagItems.length > 0 ? (
          <TagValueDisplay
            disabled={!isInteractive}
            items={tagItems}
            onRemove={handleTagRemove}
            size={resolvedSize}
            tagProps={tagProps}
          />
        ) : undefined}
      </PickerTrigger>
      <ListPickerCascaderPopup
        activeLevel={currentLevel}
        closeText={texts?.closeText}
        disabled={disabled}
        empty={empty}
        emptyText={texts?.emptyText ?? DEFAULT_EMPTY_TEXT}
        headerText={texts?.headerText}
        loading={loading}
        loadingText={texts?.loadingText ?? DEFAULT_LOADING_TEXT}
        onChangeActiveLevel={nextLevel => setResolvedActiveLevel(nextLevel)}
        onOptionPress={handleOptionPress}
        onRequestClose={handleRequestClose}
        open={mergedOpen === true}
        options={currentOptions}
        popupProps={popupProps}
        readonly={readonly}
        renderOptionLabel={renderOptionLabel}
        selectedValue={currentValue}
        size={resolvedSize}
        styles={styles}
        tabItems={tabItems}
      />
    </>
  );
}
