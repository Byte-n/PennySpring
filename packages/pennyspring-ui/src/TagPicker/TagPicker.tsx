import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator } from 'react-native';
import { useTheme } from '@pennyspring/theme';
import { Column } from '../Column';
import { Icon } from '../Icon';
import { Loading } from '../Loading';
import { Popup } from '../Popup';
import { Row } from '../Row';
import { Tag } from '../Tag';
import { Text } from '../Text';
import { TagValueDisplay } from '../_internal/TagValueDisplay';
import type { TagValueItem } from '../_internal/TagValueDisplay';
import { PickerTrigger } from '../_internal/PickerTrigger';
import { useControllableValue } from '../_hooks';
import type { ComponentSize } from '../shares/types';
import { useTagPickerStyles } from './style';
import type {
  TagPickerOption,
  TagPickerProps,
  TagPickerValue,
} from './types';

function isOption(
  option: TagPickerOption | undefined,
): option is TagPickerOption {
  return option !== undefined;
}

export function TagPicker({
  defaultOpen,
  defaultValue,
  disabled = false,
  displayInputProps,
  floatingPanelProps,
  labelText,
  loading = false,
  onChange,
  onOpenChange,
  open,
  options,
  size,
  style,
  styles,
  tagProps,
  texts,
  value,
}: TagPickerProps) {
  const { token } = useTheme();
  const tokenStyles = useTagPickerStyles();
  const resolvedSize: ComponentSize = size ?? 'normal';
  const [mergedOpen, setMergedOpen] = useControllableValue(
    defaultOpen === true,
    open,
    onOpenChange,
  );
  const [mergedValue, setMergedValue] = useControllableValue<TagPickerValue[]>(
    defaultValue,
    value,
    onChange,
  );
  const selectedValues = useMemo(() => mergedValue ?? [], [mergedValue]);
  const isInteractive = !disabled && !loading;
  const visibleOptions = useMemo(
    () => options.filter(option => option.hidden !== true),
    [options],
  );
  const hiddenSelectedOptions = useMemo(
    () =>
      options.filter(
        option =>
          option.hidden === true && selectedValues.includes(option.value),
      ),
    [options, selectedValues],
  );
  const tagItems = useMemo<TagValueItem[]>(
    () =>
      selectedValues
        .map(selected => options.find(option => option.value === selected))
        .filter(isOption)
        .map(option => ({ label: option.label, value: option.value })),
    [options, selectedValues],
  );

  function setOpen(nextOpen: boolean): void {
    if (!isInteractive) {
      return;
    }

    setMergedOpen(nextOpen);
  }

  function closePanel(): void {
    setMergedOpen(false);
  }

  const toggleOption = useCallback(
    (option: TagPickerOption): void => {
      if (!isInteractive || option.disabled === true) {
        return;
      }

      setMergedValue(
        selectedValues.includes(option.value)
          ? selectedValues.filter(item => item !== option.value)
          : [...selectedValues, option.value],
      );
    },
    [isInteractive, selectedValues, setMergedValue],
  );

  const handleRemove = useCallback(
    (removedValue: TagPickerValue): void => {
      if (!isInteractive) {
        return;
      }

      setMergedValue(selectedValues.filter(item => item !== removedValue));
    },
    [isInteractive, selectedValues, setMergedValue],
  );

  function renderChip(option: TagPickerOption, dashed: boolean) {
    const isSelected = selectedValues.includes(option.value);
    const isOptionDisabled = !isInteractive || option.disabled === true;
    const iconColor = isOptionDisabled
      ? 'disabled'
      : isSelected
        ? 'primary'
        : dashed
          ? 'tertiary'
          : 'secondary';
    const labelStyle =
      dashed && !isSelected
        ? [tokenStyles.chipLabelMuted, styles?.optionLabel]
        : [tokenStyles.chipLabel, styles?.optionLabel];

    return (
      <Tag
        color={isSelected ? 'primary' : 'default'}
        disabled={isOptionDisabled}
        key={String(option.value)}
        onPress={() => toggleOption(option)}
        prefix={
          option.icon === undefined ? undefined : (
            <Icon
              color={iconColor}
              icon={option.icon}
              size={resolvedSize}
            />
          )
        }
        size={resolvedSize}
        style={tokenStyles.chip}
        styles={{ content: labelStyle }}
        testID={`tag-picker-option-${option.value}`}
        variant={dashed ? 'dashed' : 'filled'}
      >
        {option.label}
      </Tag>
    );
  }

  function renderSection(
    sectionOptions: TagPickerOption[],
    sectionTitle: string | undefined,
    dashed: boolean,
    testID: string,
  ) {
    return (
      <Column style={tokenStyles.section}>
        {sectionTitle !== undefined ? (
          <Row style={tokenStyles.sectionHeader}>
            <Text color="secondary" size="xs" weight="semibold">
              {sectionTitle}
            </Text>
            <Text color="tertiary" size="xs">
              {sectionOptions.length}
            </Text>
          </Row>
        ) : null}
        <Row style={[tokenStyles.chips, styles?.chips]} testID={testID}>
          {sectionOptions.map(option => renderChip(option, dashed))}
        </Row>
      </Column>
    );
  }

  return (
    <>
      <PickerTrigger
        active={mergedOpen === true}
        disabled={!isInteractive}
        displayInputProps={displayInputProps}
        externalInputStyles={styles?.input}
        externalTriggerStyle={style}
        hasValue={tagItems.length > 0}
        label={labelText}
        onPress={() => setOpen(mergedOpen !== true)}
        overflow={displayInputProps?.overflow ?? 'visible'}
        size={resolvedSize}
        suffix={
          loading ? (
            <ActivityIndicator color={token.colorTextTertiary} />
          ) : (
            <Icon color="icon" icon="caret-down" />
          )
        }
      >
        {tagItems.length > 0 ? (
          <TagValueDisplay
            disabled={!isInteractive}
            items={tagItems}
            onRemove={handleRemove}
            size={resolvedSize}
            tagProps={tagProps}
          />
        ) : undefined}
      </PickerTrigger>
      <Popup.FloatingPanel
        {...floatingPanelProps}
        footer={null}
        onCancel={closePanel}
        onOpenChange={nextOpen => {
          if (nextOpen) {
            setOpen(true);
          } else {
            closePanel();
          }
        }}
        open={mergedOpen === true}
        position={floatingPanelProps?.position ?? 'bottom'}
        size={resolvedSize}
        style={styles?.panel}
      >
        <Column style={tokenStyles.content}>
          {loading ? (
            <Column style={tokenStyles.state}>
              <Loading size="small" text={texts?.loadingText} />
            </Column>
          ) : (
            <>
              {visibleOptions.length > 0
                ? renderSection(
                    visibleOptions,
                    texts?.optionsTitle,
                    false,
                    'tag-picker-chips',
                  )
                : texts?.emptyText !== undefined
                  ? (
                      <Column style={tokenStyles.state}>
                        <Text color="description">{texts.emptyText}</Text>
                      </Column>
                    )
                  : null}
              {hiddenSelectedOptions.length > 0
                ? renderSection(
                    hiddenSelectedOptions,
                    texts?.hiddenOptionsTitle,
                    true,
                    'tag-picker-hidden-chips',
                  )
                : null}
            </>
          )}
        </Column>
      </Popup.FloatingPanel>
    </>
  );
}
