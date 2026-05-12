import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  TextInput,
  View,
} from 'react-native';
import { useTheme } from '@pennyspring/theme';
import { Button } from '../Button';
import { Popup } from '../Popup';
import { Text } from '../Text';
import {
  SELECTION_LIST_CLOSE_TEXT,
  SELECTION_LIST_CONFIRM_TEXT,
  SELECTION_LIST_EMPTY_TEXT,
  SELECTION_LIST_HEADER_TEXT,
  SELECTION_LIST_LOADING_TEXT,
  SELECTION_LIST_SELECTED_MARK,
  SELECTION_LIST_UNSELECTED_MARK,
  useSelectionListStyles,
} from './styles';
import type {
  SelectionListMode,
  SelectionListOption,
  SelectionListOptionGroup,
  SelectionListPopupProps,
  SelectionListProps,
  SelectionListSize,
  SelectionListStatus,
  SelectionListValue,
} from './types';

interface RenderGroup {
  key: string;
  title?: React.ReactNode;
  options: SelectionListOption[];
}

const DEFAULT_PLACEHOLDER = 'Select';
const TRIGGER_SUFFIX = '⌄';
const SEARCH_PLACEHOLDER = 'Search';

function resolveSize(size?: SelectionListSize): SelectionListSize {
  return size ?? 'normal';
}

function resolveMode(mode?: SelectionListMode): SelectionListMode {
  return mode ?? 'single';
}

function resolveStatus(status?: SelectionListStatus): SelectionListStatus {
  return status ?? 'default';
}

function normalizeValue(
  mode: SelectionListMode,
  value: SelectionListProps['value'],
): SelectionListValue | SelectionListValue[] | undefined {
  if (mode === 'multiple') {
    return Array.isArray(value) ? value : value === undefined ? [] : [value];
  }

  return Array.isArray(value) ? value[0] : value;
}

function toValueArray(value: SelectionListValue | SelectionListValue[] | undefined) {
  if (Array.isArray(value)) {
    return value;
  }

  return value === undefined ? [] : [value];
}

function extractText(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(extractText).join(' ');
  }

  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return extractText(node.props.children);
  }

  return '';
}

function buildRenderGroups(
  options?: SelectionListOption[],
  groups?: SelectionListOptionGroup[],
): RenderGroup[] {
  if (groups !== undefined && groups.length > 0) {
    return groups.map(group => ({
      key: group.key,
      title: group.title,
      options: group.options,
    }));
  }

  return [
    {
      key: 'default',
      options: options ?? [],
    },
  ];
}

function optionMatchesSearch(option: SelectionListOption, query: string): boolean {
  if (query.length === 0) {
    return true;
  }

  const searchableText = [
    extractText(option.label),
    extractText(option.description),
  ]
    .join(' ')
    .toLowerCase();

  return searchableText.includes(query.toLowerCase());
}

function filterGroups(groups: RenderGroup[], query: string): RenderGroup[] {
  return groups
    .map(group => ({
      ...group,
      options: group.options.filter(option =>
        optionMatchesSearch(option, query),
      ),
    }))
    .filter(group => group.options.length > 0);
}

function getSelectedLabel(
  options: SelectionListOption[],
  selectedValues: SelectionListValue[],
): string {
  return selectedValues
    .map(value => options.find(option => option.value === value))
    .filter((option): option is SelectionListOption => option !== undefined)
    .map(option => extractText(option.label))
    .filter(Boolean)
    .join(', ');
}

function isValueSelected(
  selectedValues: SelectionListValue[],
  value: SelectionListValue,
): boolean {
  return selectedValues.includes(value);
}

export function SelectionListPopup({
  defaultOpen,
  defaultValue,
  disabled,
  empty,
  groups,
  loading,
  mode,
  onChange,
  onOpenChange,
  onSearchChange,
  open,
  options,
  readonly,
  searchable,
  searchValue,
  size,
  style,
  styles,
  value,
}: SelectionListPopupProps) {
  const resolvedSize = resolveSize(size);
  const resolvedMode = resolveMode(mode);
  const tokenStyles = useSelectionListStyles({
    size: resolvedSize,
    status: 'default',
  });
  const { token } = useTheme();
  const [internalOpen, setInternalOpen] = useState(defaultOpen === true);
  const [internalValue, setInternalValue] = useState(
    normalizeValue(resolvedMode, defaultValue),
  );
  const [internalSearchValue, setInternalSearchValue] = useState('');
  const mergedOpen = open ?? internalOpen;
  const mergedValue = value ?? internalValue;
  const mergedSearchValue = searchValue ?? internalSearchValue;
  const isInteractive = !disabled && !readonly && !loading;
  const renderGroups = useMemo(
    () => buildRenderGroups(options, groups),
    [groups, options],
  );
  const filteredGroups = useMemo(
    () => filterGroups(renderGroups, mergedSearchValue),
    [mergedSearchValue, renderGroups],
  );
  const selectedValues = toValueArray(mergedValue);

  function closeSelectionList(): void {
    if (open === undefined) {
      setInternalOpen(false);
    }

    onOpenChange?.(false);
  }

  function commitValue(nextValue: SelectionListValue | SelectionListValue[]): void {
    if (value === undefined) {
      setInternalValue(nextValue);
    }

    onChange?.(nextValue);
  }

  function handleSelect(option: SelectionListOption): void {
    if (!isInteractive || option.disabled === true) {
      return;
    }

    if (resolvedMode === 'multiple') {
      const nextValue = isValueSelected(selectedValues, option.value)
        ? selectedValues.filter(item => item !== option.value)
        : [...selectedValues, option.value];

      commitValue(nextValue);
      return;
    }

    commitValue(option.value);
    closeSelectionList();
  }

  function handleSearchChange(nextValue: string): void {
    if (searchValue === undefined) {
      setInternalSearchValue(nextValue);
    }

    onSearchChange?.(nextValue);
  }

  function renderOption(option: SelectionListOption) {
    const isSelected = isValueSelected(selectedValues, option.value);
    const isDisabled = option.disabled === true || !isInteractive;
    const labelText = extractText(option.label);

    return (
      <Pressable
        accessibilityLabel={labelText}
        accessibilityRole="button"
        accessibilityState={{
          disabled: isDisabled,
          selected: isSelected,
        }}
        key={String(option.value)}
        onPress={() => handleSelect(option)}
        style={({ pressed }) => [
          tokenStyles.option,
          styles?.option,
          pressed && !isDisabled ? tokenStyles.optionPressed : null,
          isSelected ? tokenStyles.optionSelected : null,
          isDisabled ? tokenStyles.optionDisabled : null,
        ]}
      >
        <Text
          accessibilityElementsHidden
          style={[
            tokenStyles.marker,
            isDisabled ? tokenStyles.markerDisabled : null,
          ]}
        >
          {isSelected ? SELECTION_LIST_SELECTED_MARK : SELECTION_LIST_UNSELECTED_MARK}
        </Text>
        {option.prefix !== undefined ? (
          <View style={tokenStyles.optionMeta}>{option.prefix}</View>
        ) : null}
        <View style={tokenStyles.optionContent}>
          <Text
            style={[
              tokenStyles.optionLabel,
              styles?.optionLabel,
              isDisabled ? tokenStyles.optionLabelDisabled : null,
            ]}
          >
            {option.label}
          </Text>
          {option.description !== undefined ? (
            <Text size="sm" style={tokenStyles.optionDescription}>
              {option.description}
            </Text>
          ) : null}
        </View>
        {option.suffix !== undefined ? (
          <View style={tokenStyles.optionMeta}>{option.suffix}</View>
        ) : null}
      </Pressable>
    );
  }

  return (
    <Popup
      open={mergedOpen}
      position="bottom"
      onCancel={closeSelectionList}
      styles={{ body: [tokenStyles.popup, style, styles?.popup] }}
    >
      <View testID="selection-list-popup" style={tokenStyles.popupContent}>
        <View style={tokenStyles.header}>
          <Text weight="strong" style={tokenStyles.headerText}>
            {SELECTION_LIST_HEADER_TEXT}
          </Text>
          <Button
            accessibilityLabel="Close selection list"
            accessibilityRole="button"
            onPress={closeSelectionList}
            style={tokenStyles.footerButton}
            type="text"
          >
            {SELECTION_LIST_CLOSE_TEXT}
          </Button>
        </View>
        {searchable === true ? (
          <TextInput
            accessibilityLabel={SEARCH_PLACEHOLDER}
            editable={isInteractive}
            onChangeText={handleSearchChange}
            placeholder={SEARCH_PLACEHOLDER}
            placeholderTextColor={token.colorTextPlaceholder}
            style={tokenStyles.search}
            value={mergedSearchValue}
          />
        ) : null}
        {loading === true ? (
          <View style={tokenStyles.loading}>
            <Text color="description">{SELECTION_LIST_LOADING_TEXT}</Text>
          </View>
        ) : filteredGroups.length > 0 ? (
          <View style={tokenStyles.list}>
            {filteredGroups.map(group => (
              <View key={group.key} style={tokenStyles.group}>
                {group.title !== undefined ? (
                  <Text
                    size="sm"
                    style={[tokenStyles.groupTitle, styles?.groupTitle]}
                  >
                    {group.title}
                  </Text>
                ) : null}
                {group.options.map(renderOption)}
              </View>
            ))}
          </View>
        ) : (
          <View style={tokenStyles.empty}>
            {empty ?? <Text color="description">{SELECTION_LIST_EMPTY_TEXT}</Text>}
          </View>
        )}
        <View style={tokenStyles.footer}>
          <Button
            accessibilityLabel="Confirm selection"
            accessibilityRole="button"
            onPress={closeSelectionList}
            style={[tokenStyles.footerButton, tokenStyles.footerPrimaryButton]}
            styles={{ content: tokenStyles.footerPrimaryButtonText }}
            type="primary"
          >
            {SELECTION_LIST_CONFIRM_TEXT}
          </Button>
        </View>
      </View>
    </Popup>
  );
}

function SelectionListRoot({
  defaultOpen,
  defaultValue,
  disabled,
  errorText,
  groups,
  helperText,
  label,
  loading,
  mode,
  onChange,
  onOpenChange,
  open,
  options,
  placeholder,
  readonly,
  size,
  status,
  style,
  styles,
  value,
  ...popupProps
}: SelectionListProps) {
  const resolvedSize = resolveSize(size);
  const resolvedMode = resolveMode(mode);
  const resolvedStatus = resolveStatus(status);
  const tokenStyles = useSelectionListStyles({
    size: resolvedSize,
    status: resolvedStatus,
  });
  const { token } = useTheme();
  const [internalOpen, setInternalOpen] = useState(defaultOpen === true);
  const [internalValue, setInternalValue] = useState(
    normalizeValue(resolvedMode, defaultValue),
  );
  const mergedOpen = open ?? internalOpen;
  const mergedValue = value ?? internalValue;
  const isInteractive = !disabled && !readonly && !loading;
  const isError = resolvedStatus === 'error';
  const renderGroups = useMemo(
    () => buildRenderGroups(options, groups),
    [groups, options],
  );
  const flatOptions = useMemo(
    () => renderGroups.flatMap(group => group.options),
    [renderGroups],
  );
  const selectedValues = toValueArray(mergedValue);
  const selectedLabel = getSelectedLabel(flatOptions, selectedValues);
  const message = isError && errorText !== undefined ? errorText : helperText;
  const triggerLabel =
    typeof label === 'string'
      ? label
      : selectedLabel.length > 0
        ? selectedLabel
        : (placeholder ?? DEFAULT_PLACEHOLDER);

  function setOpen(nextOpen: boolean): void {
    if (!isInteractive) {
      return;
    }

    if (open === undefined) {
      setInternalOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);
  }

  function closeSelectionList(): void {
    if (open === undefined) {
      setInternalOpen(false);
    }

    onOpenChange?.(false);
  }

  function commitValue(nextValue: SelectionListValue | SelectionListValue[]): void {
    if (value === undefined) {
      setInternalValue(nextValue);
    }

    onChange?.(nextValue);
  }

  function handlePopupChange(
    nextValue: SelectionListValue | SelectionListValue[],
  ): void {
    commitValue(nextValue);
  }

  return (
    <View testID="selection-list-root" style={[tokenStyles.root, style]}>
      {label !== undefined ? (
        <Text style={[tokenStyles.label, styles?.label]}>{label}</Text>
      ) : null}
      <Pressable
        accessibilityLabel={triggerLabel}
        accessibilityRole="button"
        accessibilityState={{
          busy: loading === true,
          disabled: !isInteractive,
          expanded: mergedOpen,
        }}
        onPress={() => setOpen(!mergedOpen)}
        style={({ pressed }) => [
          tokenStyles.trigger,
          styles?.trigger,
          pressed && isInteractive ? tokenStyles.triggerPressed : null,
          mergedOpen ? tokenStyles.triggerOpen : null,
          isError ? tokenStyles.triggerError : null,
          !isInteractive ? tokenStyles.triggerDisabled : null,
        ]}
      >
        <View style={tokenStyles.valueArea}>
          {selectedLabel.length > 0 ? (
            <Text
              numberOfLines={1}
              style={[tokenStyles.valueText, styles?.valueText]}
            >
              {selectedLabel}
            </Text>
          ) : (
            <Text
              numberOfLines={1}
              style={[tokenStyles.placeholder, styles?.placeholder]}
            >
              {placeholder ?? DEFAULT_PLACEHOLDER}
            </Text>
          )}
        </View>
        {loading === true ? (
          <ActivityIndicator
            accessibilityElementsHidden
            color={token.colorTextTertiary}
          />
        ) : (
          <Text accessibilityElementsHidden style={tokenStyles.suffix}>
            {TRIGGER_SUFFIX}
          </Text>
        )}
      </Pressable>
      <SelectionListPopup
        {...popupProps}
        defaultOpen={defaultOpen}
        defaultValue={defaultValue}
        disabled={disabled}
        groups={groups}
        loading={loading}
        mode={resolvedMode}
        onChange={handlePopupChange}
        onOpenChange={nextOpen =>
          nextOpen ? setOpen(nextOpen) : closeSelectionList()
        }
        open={mergedOpen}
        options={options}
        readonly={readonly}
        size={resolvedSize}
        styles={styles}
        value={mergedValue}
      />
      {message !== undefined ? (
        <Text
          style={[
            isError ? tokenStyles.error : tokenStyles.helper,
            isError ? styles?.error : styles?.helper,
          ]}
        >
          {message}
        </Text>
      ) : null}
    </View>
  );
}

export const SelectionList = Object.assign(SelectionListRoot, {
  Popup: SelectionListPopup,
});
