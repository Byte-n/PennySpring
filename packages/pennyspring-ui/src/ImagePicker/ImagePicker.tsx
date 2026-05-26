import React from 'react';
import { Pressable, View } from 'react-native';
import { ActionSheet } from '../ActionSheet';
import { Icon } from '../Icon';
import { Text } from '../Text';
import { useControllableValue } from '../_hooks';
import { pickImageFromFiles, pickImageFromLibrary } from './nativePickers';
import { useStyles } from './style';
import type {
  ImagePickerOpenChangeParams,
  ImagePickerProps,
  ImagePickerSource,
  ImagePickerSelectedValue,
} from './types';

const DEFAULT_PHOTO_TEXT = '相册';
const DEFAULT_FILE_SYSTEM_TEXT = '文件';
const DEFAULT_CANCEL_TEXT = '取消';
const DEFAULT_SELECTED_TEXT = '已选择';
const DEFAULT_UNSELECTED_TEXT = '未选择';
const DEFAULT_MAX_COUNT = 9;
const DEFAULT_SOURCES: ImagePickerSource[] = ['photo', 'fileSystem'];

function getSelectedCount(value: ImagePickerSelectedValue | undefined): number {
  if (Array.isArray(value)) {
    return value.length;
  }

  return value === undefined ? 0 : 1;
}

function getStatusText(
  value: ImagePickerSelectedValue | undefined,
  multiple: boolean,
  selectedText: string,
  unselectedText: string,
): string {
  const count = getSelectedCount(value);

  if (count === 0) {
    return unselectedText;
  }

  return multiple ? `${selectedText} ${count} 张` : selectedText;
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
  defaultOpen,
  defaultValue,
  disabled,
  fileSystemText = DEFAULT_FILE_SYSTEM_TEXT,
  maxCount = DEFAULT_MAX_COUNT,
  multiple = false,
  photoText = DEFAULT_PHOTO_TEXT,
  selectedText = DEFAULT_SELECTED_TEXT,
  onChange,
  onError,
  onOpenChange,
  open,
  readonly,
  sources = DEFAULT_SOURCES,
  style,
  styles,
  unselectedText = DEFAULT_UNSELECTED_TEXT,
  value,
}: ImagePickerProps) {
  const [resolvedValue, setResolvedValue] = useControllableValue(
    defaultValue as ImagePickerSelectedValue | undefined,
    value as ImagePickerSelectedValue | undefined,
    onChange as ((nextValue: ImagePickerSelectedValue) => void) | undefined,
  );
  const [resolvedOpen, setResolvedOpen] = useControllableValue(
    defaultOpen === true,
    open,
    undefined,
  );
  const isOpen = resolvedOpen === true;
  const isDisabled = disabled === true;
  const isReadonly = readonly === true;
  const selectedCount = getSelectedCount(resolvedValue);
  const hasSelectedValue = selectedCount > 0;
  const statusText = getStatusText(
    resolvedValue,
    multiple,
    selectedText,
    unselectedText,
  );
  const tokenStyles = useStyles({
    disabled: isDisabled,
    selected: hasSelectedValue,
  });

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
        ? await pickImageFromLibrary({ maxCount, multiple })
        : await pickImageFromFiles({ maxCount, multiple });

      if (nextValue !== undefined) {
        setResolvedValue(
          nextValue as ImagePickerSelectedValue,
        );
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
        style={({ pressed }) => [
          tokenStyles.trigger,
          pressed && !isReadonly ? tokenStyles.triggerPressed : null,
          styles?.trigger,
          style,
        ]}
        testID="image-picker-trigger"
      >
        <View style={[tokenStyles.triggerContent, styles?.triggerContent]}>
          <View style={[tokenStyles.iconContainer, styles?.iconContainer]}>
            <Icon
              color={hasSelectedValue ? 'textLightSolid' : 'default'}
              icon="image"
              size="large"
              weight={hasSelectedValue ? 'fill' : undefined}
            />
          </View>
          <Text
            style={[tokenStyles.status, styles?.status]}
            testID="image-picker-status"
          >
            {statusText}
          </Text>
        </View>
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
