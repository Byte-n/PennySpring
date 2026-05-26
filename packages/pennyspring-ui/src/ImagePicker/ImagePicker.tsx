import React from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import type { ImageStyle } from 'react-native';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { Popup } from '../Popup';
import { Text } from '../Text';
import { useControllableValue } from '../_hooks';
import {
  pickImageFromCamera,
  pickImageFromFiles,
  pickImageFromLibrary,
} from './nativePickers';
import { useStyles } from './style';
import type {
  ImagePickerOpenChangeParams,
  ImagePickerProps,
  ImagePickerSource,
  ImagePickerSelectedValue,
  ImagePickerValue,
} from './types';

const DEFAULT_CAMERA_TEXT = '拍照';
const DEFAULT_PHOTO_TEXT = '相册';
const DEFAULT_FILE_SYSTEM_TEXT = '文件';
const DEFAULT_DONE_TEXT = '完成';
const DEFAULT_TITLE_TEXT = '请选择图片';
const DEFAULT_EMPTY_TEXT = '暂无已选图片';
const DEFAULT_SINGLE_HINT_TEXT = '最多1张';
const DEFAULT_SELECTED_TEXT = '已选择';
const DEFAULT_UNSELECTED_TEXT = '未选择';
const DEFAULT_MAX_COUNT = 9;
const DEFAULT_PANEL_HEIGHT = '45%';
const DEFAULT_SOURCES: ImagePickerSource[] = ['camera', 'photo'];

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

function getSelectedValues(
  value: ImagePickerSelectedValue | undefined,
): ImagePickerValue[] {
  if (value === undefined) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function createSelectedValue(
  values: ImagePickerValue[],
  multiple: boolean,
): ImagePickerSelectedValue | undefined {
  if (multiple) {
    return values;
  }

  return values[0];
}

function createOpenChangeParams(
  reason: ImagePickerOpenChangeParams['reason'],
): ImagePickerOpenChangeParams {
  return { reason };
}

function getActionText(
  source: ImagePickerSource,
  cameraText: string,
  photoText: string,
  fileSystemText: string,
): string {
  if (source === 'camera') {
    return cameraText;
  }

  return source === 'photo' ? photoText : fileSystemText;
}

function getActionTestID(source: ImagePickerSource): string {
  return `image-picker-action-${source}`;
}

function getMultipleHintText(maxCount: number): string {
  return `允许多选，最多${maxCount}张`;
}

function getSelectionHintText(
  multiple: boolean,
  maxCount: number,
  multipleHintText: string | undefined,
): string {
  if (multiple) {
    return multipleHintText ?? getMultipleHintText(maxCount);
  }

  return DEFAULT_SINGLE_HINT_TEXT;
}

export function ImagePicker({
  cameraText = DEFAULT_CAMERA_TEXT,
  defaultOpen,
  defaultValue,
  disabled,
  doneText = DEFAULT_DONE_TEXT,
  emptyText = DEFAULT_EMPTY_TEXT,
  fileSystemText = DEFAULT_FILE_SYSTEM_TEXT,
  maxCount = DEFAULT_MAX_COUNT,
  multipleHintText,
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
  titleText = DEFAULT_TITLE_TEXT,
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
  const selectedValues = getSelectedValues(resolvedValue);
  const isMaxReached = multiple && selectedCount >= maxCount;
  const statusText = getStatusText(
    resolvedValue,
    multiple,
    selectedText,
    unselectedText,
  );
  const tokenStyles = useStyles({
    disabled: isDisabled,
    maxReached: isMaxReached,
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

  function handleDonePress(): void {
    updateOpen(false, 'action');
  }

  function updateSelectedValue(nextValues: ImagePickerValue[]): void {
    const nextValue = createSelectedValue(nextValues, multiple);

    if (nextValue !== undefined) {
      setResolvedValue(nextValue);
    }
  }

  function removeSelectedValue(index: number): void {
    const nextValues = selectedValues.filter((_, itemIndex) => itemIndex !== index);
    const nextValue = createSelectedValue(nextValues, multiple);

    setResolvedValue(nextValue as ImagePickerSelectedValue);
  }

  async function handleSourcePress(source: ImagePickerSource): Promise<void> {
    if (isMaxReached) {
      return;
    }

    const remainingCount = multiple
      ? Math.max(maxCount - selectedCount, 0)
      : 1;

    try {
      const pickOptions = {
        maxCount: remainingCount,
        multiple: multiple && source !== 'camera',
      };
      const nextValue = source === 'camera'
        ? await pickImageFromCamera(pickOptions)
        : source === 'photo'
          ? await pickImageFromLibrary(pickOptions)
          : await pickImageFromFiles(pickOptions);

      if (nextValue !== undefined) {
        const nextValues = getSelectedValues(
          nextValue as ImagePickerSelectedValue,
        );
        const mergedValues = multiple
          ? [...selectedValues, ...nextValues].slice(0, maxCount)
          : nextValues.slice(0, 1);

        updateSelectedValue(mergedValues);
      }
    } catch (error: unknown) {
      onError?.(error);
    }
  }

  function renderPanelHeader(): React.ReactNode {
    return (
      <View style={[tokenStyles.popupHeader, styles?.popupHeader]}>
        <View style={[tokenStyles.popupTitleArea, styles?.popupTitleArea]}>
          <Text
            size="xl"
            weight="strong"
            style={[tokenStyles.popupTitle, styles?.popupTitle]}
            testID="image-picker-panel-title"
          >
            {titleText}
          </Text>
          <Text
            style={[tokenStyles.popupSubtitle, styles?.popupSubtitle]}
            testID="image-picker-panel-subtitle"
          >
            {getSelectionHintText(multiple, maxCount, multipleHintText)}
          </Text>
        </View>
        <View style={[tokenStyles.popupActions, styles?.popupActions]}>
          {sources.map(source => (
            <Button
              disabled={isMaxReached}
              key={source}
              onPress={() => {
                handleSourcePress(source);
              }}
              style={tokenStyles.actionButton}
              testID={getActionTestID(source)}
              type="link"
            >
              {getActionText(source, cameraText, photoText, fileSystemText)}
            </Button>
          ))}
          <Button
            onPress={handleDonePress}
            testID="image-picker-action-done"
          >
            {doneText}
          </Button>
        </View>
      </View>
    );
  }

  function renderSelectedImages(): React.ReactNode {
    if (selectedValues.length === 0) {
      return (
        <View style={[tokenStyles.empty, styles?.empty]}>
          <Text style={[tokenStyles.emptyText, styles?.emptyText]}>
            {emptyText}
          </Text>
        </View>
      );
    }

    return (
      <View style={[tokenStyles.imageGrid, styles?.imageGrid]}>
        {selectedValues.map((image, index) => (
          <View
            key={`${image.uri}-${index}`}
            style={[tokenStyles.imageItem, styles?.imageItem]}
            testID="image-picker-selected-item"
          >
            <Image
              source={{ uri: image.uri }}
              style={[tokenStyles.image as ImageStyle, styles?.image]}
            />
            {multiple ? (
              <Pressable
                onPress={() => removeSelectedValue(index)}
                style={[tokenStyles.removeButton, styles?.removeButton]}
                testID="image-picker-remove-image"
              >
                <Icon color="textLightSolid" icon="minus" size="small" />
              </Pressable>
            ) : null}
          </View>
        ))}
      </View>
    );
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
      <Popup.FloatingPanel
        cancel={null}
        closeOnMaskClick
        footer={null}
        header={renderPanelHeader()}
        height={DEFAULT_PANEL_HEIGHT}
        onCancel={() => updateOpen(false, 'cancel')}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            updateOpen(false, 'cancel');
          }
        }}
        open={isOpen}
        position="bottom"
        style={[tokenStyles.popup, styles?.popup]}
        styles={{ panelBody: [tokenStyles.popupBody, styles?.popupBody] }}
      >
        <ScrollView>
          {renderSelectedImages()}
        </ScrollView>
      </Popup.FloatingPanel>
    </>
  );
}
