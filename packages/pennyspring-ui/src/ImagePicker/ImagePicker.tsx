import React from 'react';
import { useControllableValue } from '../_hooks';
import { PickerTrigger } from '../_internal/PickerTrigger';
import { Icon } from '../Icon';
import { Text } from '../Text';
import { useFieldProps } from '../Form/hooks/useFieldProps.ts';
import { ImagePickerActionSheet } from './ImagePickerActionSheet';
import { ImagePickerPanel } from './ImagePickerPanel';
import { ImagePickerPopup } from './ImagePickerPopup';
import { persistImage } from './persistImage';
import { useStyles } from './style';
import {
  DEFAULT_CAMERA_TEXT,
  DEFAULT_OK_TEXT,
  DEFAULT_EMPTY_TEXT,
  DEFAULT_FILE_SYSTEM_TEXT,
  DEFAULT_MAX_COUNT,
  DEFAULT_PHOTO_TEXT,
  DEFAULT_SELECTED_TEXT,
  DEFAULT_SOURCES,
  DEFAULT_TITLE_TEXT,
  createOpenChangeParams,
  getSelectedCount,
  getStatusText,
} from './utils';
import type {
  ImagePickerOpenChangeParams,
  ImagePickerProps,
  ImagePickerSelectedValue,
} from './types';

function ImagePickerRoot({
  allowClear,
  cameraText = DEFAULT_CAMERA_TEXT,
  defaultOpen,
  defaultValue,
  disabled,
  displayInputProps,
  okText = DEFAULT_OK_TEXT,
  emptyText = DEFAULT_EMPTY_TEXT,
  fileSystemText = DEFAULT_FILE_SYSTEM_TEXT,
  includeBase64 = false,
  label,
  labelText,
  maxCount = DEFAULT_MAX_COUNT,
  maxHeight,
  maxWidth,
  multipleHintText,
  multiple = false,
  onClear,
  photoText = DEFAULT_PHOTO_TEXT,
  placeholder,
  quality,
  selectedText = DEFAULT_SELECTED_TEXT,
  size,
  status,
  onChange,
  onError,
  onOpenChange,
  open,
  readonly,
  sources = DEFAULT_SOURCES,
  style,
  styles,
  titleText = DEFAULT_TITLE_TEXT,
  unselectedText,
  value,
}: ImagePickerProps): React.ReactElement {
  const field = useFieldProps<ImagePickerSelectedValue | undefined>({
    value: value as ImagePickerSelectedValue | undefined,
    onChange: onChange as
      | ((nextValue: ImagePickerSelectedValue | undefined) => void)
      | undefined,
    label,
    labelText,
    disabled,
    readonly,
    status,
  });
  const resolvedDisabled = field.disabled === true;
  const resolvedReadonly = field.readonly === true;
  const [resolvedValue, setResolvedValue] = useControllableValue<
    ImagePickerSelectedValue | undefined
  >(
    defaultValue as ImagePickerSelectedValue | undefined,
    field.value,
    field.onChange,
  );
  const [resolvedOpen, setResolvedOpen] = useControllableValue(
    defaultOpen === true,
    open,
    undefined,
  );
  const tokenStyles = useStyles();
  const isOpen = resolvedOpen === true;
  const isDisabled = resolvedDisabled;
  const isReadonly = resolvedReadonly;
  const isInteractive = !isDisabled && !isReadonly;
  const selectedCount = getSelectedCount(resolvedValue);
  const hasSelectedValue = selectedCount > 0;
  const statusText = getStatusText(
    resolvedValue,
    multiple,
    selectedText,
    unselectedText,
  );

  function updateOpen(
    nextOpen: boolean,
    params: ImagePickerOpenChangeParams,
  ): void {
    setResolvedOpen(nextOpen);
    onOpenChange?.(nextOpen, params);
  }

  function handleTriggerPress(): void {
    if (isDisabled || isReadonly) {
      return;
    }

    updateOpen(true, createOpenChangeParams('trigger'));
  }

  function handleClearPress(): void {
    if (!isInteractive) {
      return;
    }

    setResolvedValue(undefined);
    onClear?.();
  }

  return (
    <>
      <PickerTrigger
        active={isOpen && field.status !== 'error'}
        allowClear={allowClear}
        disabled={isDisabled}
        displayInputProps={displayInputProps}
        externalInputStyles={styles?.input}
        externalTriggerStyle={style}
        hasValue={hasSelectedValue}
        label={field.label ?? field.labelText}
        onClearPress={handleClearPress}
        onPress={handleTriggerPress}
        placeholder={placeholder}
        prefix={
          <Icon
            color={hasSelectedValue ? 'primary' : 'tertiary'}
            icon="image"
            size="large"
            weight={hasSelectedValue ? 'fill' : undefined}
          />
        }
        readonly={isReadonly}
        size={size}
        status={field.status}
        suffix={
          multiple && hasSelectedValue ? (
            <Text color="tertiary" size="xs" style={tokenStyles.countText}>
              {`${selectedCount} / ${maxCount}`}
            </Text>
          ) : undefined
        }
        valueText={statusText}
      />
      <ImagePickerPanel
        cameraText={cameraText}
        disabled={isDisabled}
        doneText={okText}
        emptyText={emptyText}
        fileSystemText={fileSystemText}
        includeBase64={includeBase64}
        maxCount={maxCount}
        maxHeight={maxHeight}
        maxWidth={maxWidth}
        multiple={multiple}
        multipleHintText={multipleHintText}
        onChange={setResolvedValue}
        onError={onError}
        onOpenChange={updateOpen}
        open={isOpen}
        photoText={photoText}
        quality={quality}
        readonly={isReadonly}
        sources={sources}
        styles={styles}
        titleText={titleText}
        value={resolvedValue}
      />
    </>
  );
}

export const ImagePicker = Object.assign(ImagePickerRoot, {
  ActionSheet: ImagePickerActionSheet,
  Popup: ImagePickerPopup,
  persistImage,
});
