import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable } from 'react-native';
import { CircleIcon } from 'phosphor-react-native';
import { useTheme } from '@pennyspring/theme';
import { Button } from '../Button';
import { Column } from '../Column';
import { DisplayInput } from '../DisplayInput';
import { Icon } from '../Icon';
import { Input } from '../Input';
import { Popup } from '../Popup';
import { Row } from '../Row';
import { Spacer } from '../Spacer';
import { Text } from '../Text';
import { TagValueDisplay } from '../_internal/TagValueDisplay';
import type { TagValueItem } from '../_internal/TagValueDisplay';
import { useControllableValue } from '../_hooks';
import { useListPickerStyles } from './style';
import type { ComponentSize } from '../shares/types';
import { renderTextNode } from '../shares/node';
import type {
  ListPickerMode,
  ListPickerOption,
  ListPickerOptionGroup,
  ListPickerPopupProps,
  ListPickerProps,
  ListPickerSelectedValue,
  ListPickerStatus,
  ListPickerValue,
} from './types';

interface RenderGroup {
  key: string;
  title?: React.ReactNode;
  titleText?: string;
  options: ListPickerOption[];
}

function resolveSize(size?: ComponentSize): ComponentSize {
  return size ?? 'normal';
}

function resolveMode(mode?: ListPickerMode): ListPickerMode {
  return mode ?? 'single';
}

function resolveStatus(status?: ListPickerStatus): ListPickerStatus {
  return status ?? 'default';
}

function resolveTextSize(
  size: ComponentSize,
): React.ComponentProps<typeof Text>['size'] {
  if (size === 'small') {
    return 'sm';
  }

  if (size === 'large') {
    return 'lg';
  }

  return 'md';
}

function normalizeValue(
  mode: ListPickerMode,
  value: ListPickerProps['value'],
): ListPickerSelectedValue | undefined {
  if (mode === 'multiple') {
    return Array.isArray(value) ? value : value === undefined ? [] : [value];
  }

  return Array.isArray(value) ? value[0] : value;
}

function toValueArray(value: ListPickerSelectedValue | undefined) {
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
  options?: ListPickerOption[],
  groups?: ListPickerOptionGroup[],
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

function optionMatchesSearch(
  option: ListPickerOption,
  query: string,
): boolean {
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
  options: ListPickerOption[],
  selectedValues: ListPickerValue[],
): string {
  return selectedValues
    .map(value => options.find(option => option.value === value))
    .filter((option): option is ListPickerOption => option !== undefined)
    .map(option => option.labelText ?? extractText(option.label))
    .filter(Boolean)
    .join(', ');
}

function getSelectedTagItems(
  options: ListPickerOption[],
  selectedValues: ListPickerValue[],
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
  selectedValues: ListPickerValue[],
  value: ListPickerValue,
): boolean {
  return selectedValues.includes(value);
}

export function ListPickerPopup({
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
}: ListPickerPopupProps) {
  const resolvedSize = resolveSize(size);
  const resolvedMode = resolveMode(mode);
  const tokenStyles = useListPickerStyles({
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
  const headerNode =
    texts?.headerText !== undefined ||
    texts?.closeText !== undefined ||
    (resolvedMode === 'multiple' && texts?.confirmText !== undefined) ? (
      <Row style={tokenStyles.header} testID="list-picker-header">
        {texts?.headerText !== undefined ? (
          <Text
            color="heading"
            size={resolveTextSize(resolvedSize)}
            weight="strong"
            style={tokenStyles.headerText}
          >
            {texts.headerText}
          </Text>
        ) : (
          <Spacer />
        )}
        <Row align="center" style={tokenStyles.headerActions}>
          {texts?.closeText !== undefined ? (
            <Button
              onPress={closeListPicker}
              size={resolvedSize}
              style={tokenStyles.footerButton}
              type="text"
            >
              {texts.closeText}
            </Button>
          ) : null}
          {resolvedMode === 'multiple' && texts?.confirmText !== undefined ? (
            <Button
              onPress={closeListPicker}
              size={resolvedSize}
              style={tokenStyles.footerPrimaryButton}
              type="primary"
            >
              {texts.confirmText}
            </Button>
          ) : null}
        </Row>
      </Row>
    ) : undefined;

  function closeListPicker(): void {
    setMergedOpen(false);
  }

  function commitValue(nextValue: ListPickerSelectedValue): void {
    setMergedValue(nextValue);
  }

  function handleSelect(option: ListPickerOption): void {
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
    closeListPicker();
  }

  function handleSearchChange(nextValue: string): void {
    if (searchValue === undefined) {
      setInternalSearchValue(nextValue);
    }

    onSearchChange?.(nextValue);
  }

  function renderOption(option: ListPickerOption) {
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
        <Row align="center" justify="center" style={tokenStyles.marker}>
          <Icon
            color={
              isDisabled
                ? 'textDisabled'
                : isSelected
                ? 'primaryText'
                : 'textQuaternary'
            }
            icon={isSelected ? 'check' : CircleIcon}
            size={resolvedSize}
            testID={
              isSelected
                ? 'list-picker-option-marker-selected'
                : 'list-picker-option-marker-unselected'
            }
          />
        </Row>
        {option.prefix !== undefined ? (
          <Column style={tokenStyles.optionMeta}>
            {renderTextNode(option.prefix, text => (
              <Text size={resolveTextSize(resolvedSize)}>{text}</Text>
            ))}
          </Column>
        ) : null}
        <Column style={tokenStyles.optionContent}>
          {renderTextNode(option.label ?? option.labelText, text => (
            <Text
              color={isDisabled ? 'disabled' : 'default'}
              size={resolveTextSize(resolvedSize)}
              style={[styles?.optionLabel]}
            >
              {text}
            </Text>
          ))}
          {renderTextNode(
            option.description ?? option.descriptionText,
            text => (
              <Text
                color="description"
                size={resolveTextSize(resolvedSize)}
                style={tokenStyles.optionDescription}
              >
                {text}
              </Text>
            ),
          )}
        </Column>
        {option.suffix !== undefined ? (
          <Column style={tokenStyles.optionMeta}>
            {renderTextNode(option.suffix, text => (
              <Text size={resolveTextSize(resolvedSize)}>{text}</Text>
            ))}
          </Column>
        ) : null}
      </Pressable>
    );
  }

  return (
    <Popup.FloatingPanel
      {...popupFloatingPanelProps}
      {...floatingPanelRestProps}
      footer={null}
      header={headerNode}
      bodyScrollable={false}
      open={mergedOpen}
      position={resolvedFloatingPanelPosition}
      size={resolvedSize}
      onCancel={closeListPicker}
      style={[tokenStyles.popup, floatingPanelStyle, style, styles?.popup]}
      styles={{
        ...floatingPanelStyles,
        content: [
          tokenStyles.floatingPanelContent,
          floatingPanelStyles?.content,
        ],
        panelBody: [tokenStyles.panelBody, floatingPanelStyles?.panelBody],
      }}
      keyboardAvoiding={resolvedKeyboardAvoiding}
    >
      <Column testID="list-picker-popup" style={tokenStyles.popupRoot}>
        <Column style={tokenStyles.popupContent}>
          {searchable === true ? (
            <Input
              {...searchInputProps}
              disabled={disabled}
              labelText={texts?.searchLabelText}
              loading={loading}
              onChange={handleSearchChange}
              placeholder={texts?.searchPlaceholder}
              readonly={readonly}
              size={resolvedSize}
              value={mergedSearchValue}
            />
          ) : null}
          {loading === true ? (
            <Column align="center" style={tokenStyles.loading}>
              {texts?.loadingText !== undefined ? (
                <Text color="description">{texts.loadingText}</Text>
              ) : (
                <ActivityIndicator color={token.colorTextTertiary} />
              )}
            </Column>
          ) : filteredGroups.length > 0 ? (
            <FlatList
              data={filteredGroups.flatMap(group => [
                { kind: 'header' as const, key: `group-${group.key}`, group },
                ...group.options.map(option => ({
                  kind: 'option' as const,
                  key: String(option.value),
                  option,
                })),
              ])}
              keyExtractor={item => item.key}
              renderItem={({ item }) => item.kind === 'header' ? (
                <Column style={tokenStyles.group}>
                  {renderTextNode(item.group.title ?? item.group.titleText, text => (
                    <Text color="description" size={resolveTextSize(resolvedSize)} style={[tokenStyles.groupTitle, styles?.groupTitle]}>{text}</Text>
                  ))}
                </Column>
              ) : renderOption(item.option)}
              style={tokenStyles.list}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Column align="center" style={tokenStyles.empty}>
              {renderTextNode(empty ?? texts?.emptyText, text => (
                <Text color="description">{text}</Text>
              ))}
            </Column>
          )}
        </Column>
      </Column>
    </Popup.FloatingPanel>
  );
}

function ListPickerRoot({
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
  popupProps,
  readonly,
  size,
  status,
  style,
  styles,
  tagProps,
  value,
  ...directPopupProps
}: ListPickerProps) {
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
  const tagItems =
    displayMode === 'tag'
      ? getSelectedTagItems(flatOptions, selectedValues)
      : [];
  const tokenStyles = useListPickerStyles({
    size: resolvedSize,
  });
  const displayInputSuffix = displayInputProps?.suffix;
  const {
    style: popupStyle,
    styles: popupStyles,
    ...nestedPopupProps
  } = popupProps ?? {};
  const mergedPopupStyles =
    popupStyles === undefined
      ? styles
      : {
          ...styles,
          ...popupStyles,
        };

  function setOpen(nextOpen: boolean): void {
    if (!isInteractive) {
      return;
    }

    setMergedOpen(nextOpen);
  }

  function closeListPicker(): void {
    setMergedOpen(false);
  }

  function commitValue(nextValue: ListPickerSelectedValue): void {
    setMergedValue(nextValue);
  }

  function handleTagRemove(removedValue: ListPickerValue): void {
    if (!isInteractive) return;
    if (resolvedMode === 'multiple') {
      commitValue(selectedValues.filter(v => v !== removedValue));
    }
  }

  function handlePopupChange(nextValue: ListPickerSelectedValue): void {
    commitValue(nextValue);
  }

  return (
    <>
      <DisplayInput
        {...displayInputProps}
        disabled={disabled === true || loading === true}
        display={displayInputProps?.display}
        error={error}
        errorText={errorText}
        helper={helper}
        helperText={helperText}
        label={label ?? labelText}
        overflow={
          displayInputProps?.overflow ??
          (displayMode === 'tag' ? 'visible' : 'hidden')
        }
        readonly={readonly}
        size={resolvedSize}
        status={resolvedStatus}
        style={style}
        styles={{
          ...styles,
          underline: [
            styles?.underline,
            mergedOpen && !isError ? tokenStyles.underlineActive : undefined,
          ],
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
      <ListPickerPopup
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
          nextOpen ? setOpen(nextOpen) : closeListPicker()
        }
        open={mergedOpen}
        options={options}
        readonly={readonly}
        size={resolvedSize}
        style={popupStyle}
        styles={mergedPopupStyles}
        value={mergedValue}
      />
    </>
  );
}

export const ListPicker = ListPickerRoot;
