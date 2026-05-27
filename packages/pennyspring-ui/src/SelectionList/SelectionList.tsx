import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  View,
} from 'react-native';
import { CircleIcon } from 'phosphor-react-native';
import { useTheme } from '@pennyspring/theme';
import { Button } from '../Button';
import { DisplayInput } from '../DisplayInput';
import { Icon } from '../Icon';
import { Input } from '../Input';
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
  SelectionListSelectedValue,
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

function resolveTextSize(size: ComponentSize): React.ComponentProps<typeof Text>['size'] {
  if (size === 'small') {
    return 'sm';
  }

  if (size === 'large') {
    return 'lg';
  }

  return 'md';
}

function normalizeValue(
  mode: SelectionListMode,
  value: SelectionListProps['value'],
): SelectionListSelectedValue | undefined {
  if (mode === 'multiple') {
    return Array.isArray(value) ? value : value === undefined ? [] : [value];
  }

  return Array.isArray(value) ? value[0] : value;
}

function toValueArray(value: SelectionListSelectedValue | undefined) {
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
  floatingPanelProps,
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
  searchInputProps,
  searchValue,
  size,
  style,
  styles,
  texts,
  value,
  ...popupFloatingPanelProps
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
  const {
    keyboardAvoiding: floatingPanelKeyboardAvoiding,
    position: floatingPanelPosition,
    style: floatingPanelStyle,
    styles: floatingPanelStyles,
    ...floatingPanelRestProps
  } = floatingPanelProps ?? {};
  const resolvedFloatingPanelPosition =
    floatingPanelPosition ?? popupFloatingPanelProps.position ?? 'bottom';
  const resolvedKeyboardAvoiding =
    floatingPanelKeyboardAvoiding ??
    popupFloatingPanelProps.keyboardAvoiding ??
    true;

  function closeSelectionList(): void {
    setMergedOpen(false);
  }

  function commitValue(nextValue: SelectionListSelectedValue): void {
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
          <Icon
            color={isDisabled ? 'textDisabled' : isSelected ? 'primaryText' : 'textQuaternary'}
            icon={isSelected ? 'check' : CircleIcon}
            size={tokenStyles.markerIcon.fontSize}
            testID={isSelected ? 'selection-list-option-marker-selected' : 'selection-list-option-marker-unselected'}
          />
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
            <Text size={resolveTextSize(resolvedSize)} style={tokenStyles.optionDescription}>
              {option.descriptionText}
            </Text>
          ) : typeof option.description === 'string' ? (
            <Text size={resolveTextSize(resolvedSize)} style={tokenStyles.optionDescription}>
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

  function renderGroupOptions(groupOptions: SelectionListOption[]) {
    return groupOptions.map((option, optionIndex) => {
      const isLastOption = optionIndex === groupOptions.length - 1;

      return (
        <React.Fragment key={String(option.value)}>
          {renderOption(option)}
          {!isLastOption ? (
            <View
              style={tokenStyles.optionDivider}
              testID="selection-list-option-divider"
            />
          ) : null}
        </React.Fragment>
      );
    });
  }

  return (
    <Popup.FloatingPanel
      {...popupFloatingPanelProps}
      {...floatingPanelRestProps}
      footer={null}
      header={null}
      open={mergedOpen}
      position={resolvedFloatingPanelPosition}
      size={resolvedSize}
      onCancel={closeSelectionList}
      style={[tokenStyles.popup, floatingPanelStyle, style, styles?.popup]}
      styles={floatingPanelStyles}
      keyboardAvoiding={resolvedKeyboardAvoiding}
    >
      <View testID="selection-list-popup" style={tokenStyles.popupContent}>
        {texts?.headerText !== undefined || texts?.closeText !== undefined ? (
          <View style={tokenStyles.header}>
            {texts.headerText !== undefined ? (
              <Text
                size={resolveTextSize(resolvedSize)}
                weight="strong"
                style={tokenStyles.headerText}
              >
                {texts.headerText}
              </Text>
            ) : (
              <View />
            )}
            {texts.closeText !== undefined ? (
              <Button
                onPress={closeSelectionList}
                size={resolvedSize}
                style={tokenStyles.footerButton}
                type="text"
              >
                {texts.closeText}
              </Button>
            ) : null}
          </View>
        ) : null}
        {searchable === true ? (
          <Input
            {...searchInputProps}
            disabled={disabled}
            loading={loading}
            onChangeText={handleSearchChange}
            placeholder={texts?.searchPlaceholder}
            readonly={readonly}
            size={resolvedSize}
            value={mergedSearchValue}
          />
        ) : null}
        {loading === true ? (
          <View style={tokenStyles.loading}>
            {texts?.loadingText !== undefined ? (
              <Text color="description">{texts.loadingText}</Text>
            ) : (
              <ActivityIndicator color={token.colorTextTertiary} />
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
                    size={resolveTextSize(resolvedSize)}
                    style={[tokenStyles.groupTitle, styles?.groupTitle]}
                  >
                    {group.titleText}
                  </Text>
                ) : null}
                {renderGroupOptions(group.options)}
              </View>
            ))}
          </View>
        ) : (
          <View style={tokenStyles.empty}>
            {empty ??
              (texts?.emptyText !== undefined ? (
                <Text color="description">{texts.emptyText}</Text>
              ) : null)}
          </View>
        )}
        {resolvedMode === 'multiple' && texts?.confirmText !== undefined ? (
          <View style={tokenStyles.footer}>
            <Button
              onPress={closeSelectionList}
              size={resolvedSize}
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
    </Popup.FloatingPanel>
  );
}

function SelectionListRoot({
  defaultOpen,
  defaultValue,
  disabled,
  displayInputProps,
  displayMode,
  error,
  errorText,
  groups,
  helper,
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
  popupProps,
  readonly,
  size,
  status,
  style,
  styles,
  tagProps,
  value,
  ...directPopupProps
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
  const tokenStyles = useSelectionListStyles({
    size: resolvedSize,
  });
  const displayInputSuffix = displayInputProps?.suffix;
  const {
    style: popupStyle,
    styles: popupStyles,
    ...nestedPopupProps
  } = popupProps ?? {};
  const mergedPopupStyles = popupStyles === undefined
    ? styles
    : {
        ...styles,
        ...popupStyles,
      };
  const rootStyle = styles?.root === undefined
    ? style
    : [styles.root, style];

  function setOpen(nextOpen: boolean): void {
    if (!isInteractive) {
      return;
    }

    setMergedOpen(nextOpen);
  }

  function closeSelectionList(): void {
    setMergedOpen(false);
  }

  function commitValue(nextValue: SelectionListSelectedValue): void {
    setMergedValue(nextValue);
  }

  function handleTagRemove(removedValue: SelectionListValue): void {
    if (!isInteractive) return;
    if (resolvedMode === 'multiple') {
      commitValue(selectedValues.filter(v => v !== removedValue));
    }
  }

  function handlePopupChange(
    nextValue: SelectionListSelectedValue,
  ): void {
    commitValue(nextValue);
  }

  return (
    <View testID="selection-list-root" style={rootStyle}>
      <DisplayInput
        {...displayInputProps}
        disabled={!isInteractive}
        display={displayInputProps?.display ?? 'inline'}
        error={error}
        errorText={errorText}
        helper={helper}
        helperText={helperText}
        label={label ?? labelText}
        overflow={
          displayInputProps?.overflow ??
          (displayMode === 'tag' ? 'visible' : 'hidden')
        }
        placeholder={placeholder ?? DEFAULT_PLACEHOLDER}
        size={resolvedSize}
        status={resolvedStatus}
        style={styles?.displayInput?.root}
        styles={{
          ...styles?.displayInput,
          field: [
            styles?.displayInput?.field,
            styles?.field,
            mergedOpen && !isError ? tokenStyles.fieldActive : undefined,
          ],
          value: [styles?.displayInput?.value, styles?.value],
          placeholder: [styles?.displayInput?.placeholder, styles?.placeholder],
          label: [styles?.displayInput?.label, styles?.label],
          suffix: [styles?.displayInput?.suffix, styles?.suffix],
          helper: [styles?.displayInput?.helper, styles?.helper],
          error: [styles?.displayInput?.error, styles?.error],
        }}
        suffix={
          displayInputSuffix !== undefined ? (
            displayInputSuffix
          ) : loading === true ? (
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
        {...directPopupProps}
        {...nestedPopupProps}
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
        style={popupStyle}
        styles={mergedPopupStyles}
        value={mergedValue}
      />
    </View>
  );
}

export const SelectionList = Object.assign(SelectionListRoot, {
  Popup: SelectionListPopup,
});
