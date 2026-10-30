import React from 'react';
import { useControllableValue } from '../_hooks';
import { useFieldProps } from '../Form/hooks/useFieldProps.ts';
import { ImagePickerPanel } from './ImagePickerPanel';
import {
  DEFAULT_CAMERA_TEXT,
  DEFAULT_OK_TEXT,
  DEFAULT_EMPTY_TEXT,
  DEFAULT_FILE_SYSTEM_TEXT,
  DEFAULT_MAX_COUNT,
  DEFAULT_PHOTO_TEXT,
  DEFAULT_SOURCES,
  DEFAULT_TITLE_TEXT,
} from './utils';
import type {
  ImagePickerOpenChangeParams,
  ImagePickerPopupProps,
  ImagePickerSelectedValue,
} from './types';

function ImagePickerPopupRoot({
  cameraText = DEFAULT_CAMERA_TEXT,
  defaultOpen,
  defaultValue,
  disabled,
  okText = DEFAULT_OK_TEXT,
  emptyText = DEFAULT_EMPTY_TEXT,
  fileSystemText = DEFAULT_FILE_SYSTEM_TEXT,
  includeBase64 = false,
  maxCount = DEFAULT_MAX_COUNT,
  maxHeight,
  maxWidth,
  multiple = false,
  multipleHintText,
  onChange,
  onError,
  onOpenChange,
  open,
  photoText = DEFAULT_PHOTO_TEXT,
  quality,
  readonly,
  sources = DEFAULT_SOURCES,
  style,
  styles,
  titleText = DEFAULT_TITLE_TEXT,
  value,
}: ImagePickerPopupProps): React.ReactElement {
  const field = useFieldProps<ImagePickerSelectedValue | undefined>({
    value: value as ImagePickerSelectedValue | undefined,
    onChange: onChange as
      | ((nextValue: ImagePickerSelectedValue | undefined) => void)
      | undefined,
    disabled,
    readonly,
  });
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
  const isOpen = resolvedOpen === true;

  function updateOpen(
    nextOpen: boolean,
    params: ImagePickerOpenChangeParams,
  ): void {
    setResolvedOpen(nextOpen);
    onOpenChange?.(nextOpen, params);
  }

  return (
    <ImagePickerPanel
      cameraText={cameraText}
      disabled={field.disabled === true}
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
      readonly={field.readonly === true}
      sources={sources}
      style={style}
      styles={styles}
      titleText={titleText}
      value={resolvedValue}
    />
  );
}

export const ImagePickerPopup = ImagePickerPopupRoot;
