import React from 'react';
import { Pressable } from 'react-native';
import { ActionSheet } from '../ActionSheet';
import { DisplayInput } from '../DisplayInput';
import { useControllableValue } from '../_hooks';
import { pickImageFromFiles, pickImageFromLibrary } from './nativePickers';
import type {
  ImagePickerOpenChangeParams,
  ImagePickerProps,
  ImagePickerSource,
  ImagePickerValue,
} from './types';

const DEFAULT_PHOTO_TEXT = 'Photo Library';
const DEFAULT_FILE_SYSTEM_TEXT = 'Files';
const DEFAULT_CANCEL_TEXT = 'Cancel';
const DEFAULT_SOURCES: ImagePickerSource[] = ['photo', 'fileSystem'];

function getValueText(value: ImagePickerValue | undefined): string | undefined {
  return value?.fileName ?? value?.name ?? value?.uri;
}

function createOpenChangeParams(
  reason: ImagePickerOpenChangeParams['reason'],
): ImagePickerOpenChangeParams {
  return { reason };
}

function getActionText(
  source: ImagePickerSource,
  photoText: string,
  fileSystemText: string,
): string {
  return source === 'photo' ? photoText : fileSystemText;
}

export function ImagePicker({
  cancelText = DEFAULT_CANCEL_TEXT,
  children,
  defaultOpen,
  defaultValue,
  disabled,
  displayInputProps,
  fileSystemText = DEFAULT_FILE_SYSTEM_TEXT,
  label,
  photoText = DEFAULT_PHOTO_TEXT,
  onChange,
  onError,
  onOpenChange,
  open,
  placeholder,
  readonly,
  sources = DEFAULT_SOURCES,
  style,
  styles,
  value,
}: ImagePickerProps) {
  const [resolvedValue, setResolvedValue] = useControllableValue(
    defaultValue,
    value,
    onChange,
  );
  const [resolvedOpen, setResolvedOpen] = useControllableValue(
    defaultOpen === true,
    open,
    undefined,
  );
  const isOpen = resolvedOpen === true;
  const isDisabled = disabled === true;
  const isReadonly = readonly === true;
  const {
    root: inputRootStyle,
    ...inputSlotStyles
  } = styles?.input ?? {};

  function updateOpen(
    nextOpen: boolean,
    reason: ImagePickerOpenChangeParams['reason'],
  ): void {
    setResolvedOpen(nextOpen);
    onOpenChange?.(nextOpen, createOpenChangeParams(reason));
  }

  function handleTriggerPress(): void {
    if (isDisabled || isReadonly) {
      return;
    }

    updateOpen(true, 'trigger');
  }

  async function handleSourcePress(source: ImagePickerSource): Promise<void> {
    updateOpen(false, 'action');

    try {
      const nextValue = source === 'photo'
        ? await pickImageFromLibrary()
        : await pickImageFromFiles();

      if (nextValue !== undefined) {
        setResolvedValue(nextValue);
      }
    } catch (error: unknown) {
      onError?.(error);
    }
  }

  function handleActionPress(_: unknown, index: number): Promise<void> {
    return handleSourcePress(sources[index]);
  }

  return (
    <>
      <Pressable
        disabled={isDisabled}
        onPress={handleTriggerPress}
        style={[styles?.trigger, style]}
        testID="image-picker-trigger"
      >
        <DisplayInput
          disabled={disabled}
          display="inline"
          label={label}
          placeholder={placeholder}
          readonly
          style={inputRootStyle}
          styles={inputSlotStyles}
          valueText={getValueText(resolvedValue)}
          {...displayInputProps}
        >
          {children}
        </DisplayInput>
      </Pressable>
      <ActionSheet
        actions={sources.map(source => ({
          text: getActionText(source, photoText, fileSystemText),
        }))}
        cancelText={cancelText}
        onAction={handleActionPress}
        onCancel={() => updateOpen(false, 'cancel')}
        onOpenChange={(nextOpen, params) => {
          if (!nextOpen) {
            updateOpen(false, params.reason === 'action' ? 'action' : 'cancel');
          }
        }}
        open={isOpen}
      />
    </>
  );
}
