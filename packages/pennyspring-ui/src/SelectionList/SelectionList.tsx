import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  TextInput,
  View,
} from 'react-native';
import { useTheme } from '@pennyspring/theme';
import { Button } from '../Button';
import { DisplayInput } from '../DisplayInput';
import { Icon } from '../Icon';
import { Popup } from '../Popup';
import { Text } from '../Text';
import { TagValueDisplay } from '../_internal/TagValueDisplay';
import type { TagValueItem } from '../_internal/TagValueDisplay';
import { useControllableValue } from '../_hooks';
import { useSelectionListStyles } from './styles';
import type { ComponentSize } from '../shares/types';
import type {
  SelectionListMode,
  SelectionListOption,
  SelectionListOptionGroup,
  SelectionListPopupProps,
  SelectionListProps,
  SelectionListStatus,
  SelectionListValue,
} from './types';

interface RenderGroup {
  key: string;
  title?: React.ReactNode;
  titleText?: string;
  options: SelectionListOption[];
}

const DEFAULT_PLACEHOLDER = '请选择';

function resolveSize(size?: ComponentSize): ComponentSize {
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
      titleText: group.titleText,
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
    option.labelText ?? extractText(option.label),
    option.descriptionText ?? extractText(option.description),
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
    .map(option => option.labelText ?? extractText(option.label))
    .filter(Boolean)
    .join(', ');
}

function getSelectedTagItems(
  options: SelectionListOption[],
  selectedValues: SelectionListValue[],
): TagValueItem[] {
  return selectedValues
    .map(value => {
      const option = options.find(o => o.value === value);
      if (!option) return undefined;
      return { label: option.labelText ?? extractText(option.label), value };
    })
    .filter((item): item is TagValueItem => item !== undefined);
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
  texts,
  value,
}: SelectionListPopupProps) {
  const resolvedSize = resolveSize(size);
  const resolvedMode = resolveMode(mode);
  const tokenStyles = useSelectionListStyles({
    size: resolvedSize,
  });
  const { token } = useTheme();
  const [mergedOpen, setMergedOpen] = useControllableValue(
    defaultOpen === true,
    open,
    onOpenChange,
  );
  const [mergedValue, setMergedValue] = useControllableValue(
    normalizeValue(resolvedMode, defaultValue),
    value,
    onChange,
  );
  const [internalSearchValue, setInternalSearchValue] = useState('');
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
    setMergedOpen(false);
  }

  function commitValue(nextValue: SelectionListValue | SelectionListValue[]): void {
    setMergedValue(nextValue);
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

    return (
      <Pressable
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
        <View style={tokenStyles.marker}>
          {isSelected ? (
            <Icon
              color={isDisabled ? 'textDisabled' : 'primaryText'}
              icon="check"
              size={tokenStyles.markerIcon.fontSize}
            />
          ) : null}
        </View>
        {option.prefix !== undefined ? (
          <View style={tokenStyles.optionMeta}>{option.prefix}</View>
        ) : null}
        <View style={tokenStyles.optionContent}>
          {option.label !== undefined && typeof option.label !== 'string' ? (
            option.label
          ) : (
            <Text
              style={[
                tokenStyles.optionLabel,
                styles?.optionLabel,
              isDisabled ? tokenStyles.optionLabelDisabled : null,
            ]}
          >
              {option.labelText ?? option.label}
            </Text>
          )}
          {option.description !== undefined && typeof option.description !== 'string' ? (
            option.description
          ) : option.descriptionText !== undefined ? (
            <Text size="sm" style={tokenStyles.optionDescription}>
              {option.descriptionText}
            </Text>
          ) : typeof option.description === 'string' ? (
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
        {texts?.headerText !== undefined || texts?.closeText !== undefined ? (
          <View style={tokenStyles.header}>
            {texts.headerText !== undefined ? (
              <Text weight="strong" style={tokenStyles.headerText}>
                {texts.headerText}
              </Text>
            ) : (
              <View />
            )}
            {texts.closeText !== undefined ? (
              <Button
                onPress={closeSelectionList}
                style={tokenStyles.footerButton}
                type="text"
              >
                {texts.closeText}
              </Button>
            ) : null}
          </View>
        ) : null}
        {searchable === true ? (
          <TextInput
            editable={isInteractive}
            onChangeText={handleSearchChange}
            placeholder={texts?.searchPlaceholder}
            placeholderTextColor={token.colorTextPlaceholder}
            style={tokenStyles.search}
            value={mergedSearchValue}
          />
        ) : null}
        {loading === true ? (
          <View style={tokenStyles.loading}>
            {texts?.loadingText !== undefined ? (
              <Text color="description">{texts.loadingText}</Text>
            ) : (
              <ActivityIndicator
                color={token.colorTextTertiary}
              />
            )}
          </View>
        ) : filteredGroups.length > 0 ? (
          <View style={tokenStyles.list}>
            {filteredGroups.map(group => (
              <View key={group.key} style={tokenStyles.group}>
                {group.title !== undefined ? (
                  group.title
                ) : group.titleText !== undefined ? (
                  <Text
                    size="sm"
                    style={[tokenStyles.groupTitle, styles?.groupTitle]}
                  >
                    {group.titleText}
                  </Text>
                ) : null}
                {group.options.map(renderOption)}
              </View>
            ))}
          </View>
        ) : (
          <View style={tokenStyles.empty}>
            {empty ?? (
              texts?.emptyText !== undefined ? (
                <Text color="description">{texts.emptyText}</Text>
              ) : null
            )}
          </View>
        )}
        {resolvedMode === 'multiple' && texts?.confirmText !== undefined ? (
          <View style={tokenStyles.footer}>
            <Button
              onPress={closeSelectionList}
              style={[
                tokenStyles.footerButton,
                tokenStyles.footerPrimaryButton,
              ]}
              styles={{ content: tokenStyles.footerPrimaryButtonText }}
              type="primary"
            >
              {texts.confirmText}
            </Button>
          </View>
        ) : null}
      </View>
    </Popup>
  );
}

function SelectionListRoot({
  defaultOpen,
  defaultValue,
  disabled,
  displayMode,
  errorText,
  groups,
  helperText,
  label,
  labelText,
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
  tagProps,
  value,
  ...popupProps
}: SelectionListProps) {
  const resolvedSize = resolveSize(size);
  const resolvedMode = resolveMode(mode);
  const resolvedStatus = resolveStatus(status);
  const { token } = useTheme();
  const [mergedOpen, setMergedOpen] = useControllableValue(
    defaultOpen === true,
    open,
    onOpenChange,
  );
  const [mergedValue, setMergedValue] = useControllableValue(
    normalizeValue(resolvedMode, defaultValue),
    value,
    onChange,
  );
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
  const tagItems = displayMode === 'tag'
    ? getSelectedTagItems(flatOptions, selectedValues)
    : [];

  function setOpen(nextOpen: boolean): void {
    if (!isInteractive) {
      return;
    }

    setMergedOpen(nextOpen);
  }

  function closeSelectionList(): void {
    setMergedOpen(false);
  }

  function commitValue(nextValue: SelectionListValue | SelectionListValue[]): void {
    setMergedValue(nextValue);
  }

  function handleTagRemove(removedValue: SelectionListValue): void {
    if (!isInteractive) return;
    if (resolvedMode === 'multiple') {
      commitValue(selectedValues.filter(v => v !== removedValue));
    }
  }

  function handlePopupChange(
    nextValue: SelectionListValue | SelectionListValue[],
  ): void {
    commitValue(nextValue);
  }

  return (
    <View testID="selection-list-root" style={style}>
      <DisplayInput
        disabled={!isInteractive}
        display="inline"
        errorText={errorText}
        helperText={helperText}
        label={label ?? labelText}
        overflow={displayMode === 'tag' ? 'visible' : 'hidden'}
        placeholder={placeholder ?? DEFAULT_PLACEHOLDER}
        size={resolvedSize}
        status={resolvedStatus}
        styles={{
          field: [
            styles?.field,
            mergedOpen && !isError
              ? { borderColor: token.colorPrimary }
              : undefined,
          ],
          value: styles?.value,
          placeholder: styles?.placeholder,
          label: styles?.label,
          suffix: styles?.suffix,
          helper: styles?.helper,
          error: styles?.error,
        }}
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
        onPress={() => setOpen(!mergedOpen)}
      >
        {displayMode === 'tag' && tagItems.length > 0 ? (
          <TagValueDisplay
            items={tagItems}
            size={resolvedSize}
            tagProps={tagProps}
            disabled={!isInteractive}
            onRemove={handleTagRemove}
          />
        ) : undefined}
      </DisplayInput>
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
    </View>
  );
}

export const SelectionList = Object.assign(SelectionListRoot, {
  Popup: SelectionListPopup,
});
