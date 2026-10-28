import React, { useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import type { ImageStyle } from 'react-native';
import { useTheme } from '@pennyspring/theme';
import { Button } from '../Button';
import { Column } from '../Column';
import { Grid } from '../Grid';
import { Icon } from '../Icon';
import { Popup } from '../Popup';
import { Row } from '../Row';
import { Text } from '../Text';
import { PickerTrigger } from '../_internal/PickerTrigger';
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
const DEFAULT_MAX_COUNT = 1;
const DEFAULT_PANEL_HEIGHT = '50%';
const DEFAULT_SOURCES: ImagePickerSource[] = ['camera', 'photo'];
const IMAGE_GRID_COLUMNS = 3;

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
  unselectedText?: string,
): string | undefined {
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
  allowClear,
  cameraText = DEFAULT_CAMERA_TEXT,
  defaultOpen,
  defaultValue,
  disabled,
  displayInputProps,
  doneText = DEFAULT_DONE_TEXT,
  emptyText = DEFAULT_EMPTY_TEXT,
  error,
  errorText,
  fileSystemText = DEFAULT_FILE_SYSTEM_TEXT,
  helper,
  helperText,
  label,
  labelText,
  maxCount = DEFAULT_MAX_COUNT,
  multipleHintText,
  multiple = false,
  onClear,
  photoText = DEFAULT_PHOTO_TEXT,
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
}: ImagePickerProps) {
  const [resolvedValue, setResolvedValue] = useControllableValue<
    ImagePickerSelectedValue | undefined
  >(
    defaultValue as ImagePickerSelectedValue | undefined,
    value as ImagePickerSelectedValue | undefined,
    onChange as
      | ((nextValue: ImagePickerSelectedValue | undefined) => void)
      | undefined,
  );
  const [resolvedOpen, setResolvedOpen] = useControllableValue(
    defaultOpen === true,
    open,
    undefined,
  );
  const { token } = useTheme();
  const isOpen = resolvedOpen === true;
  const isDisabled = disabled === true;
  const isReadonly = readonly === true;
  const isInteractive = !isDisabled && !isReadonly;
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
  const tokenStyles = useStyles();
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const removeButtonHitSlop = React.useMemo(() => {
    const hitSlop = (token.controlHeight - token.sizeLG) / 2;

    return {
      bottom: hitSlop,
      left: hitSlop,
      right: hitSlop,
      top: hitSlop,
    };
  }, [token.controlHeight, token.sizeLG]);
  const isAddTileVisible = !isMaxReached && (multiple || !hasSelectedValue);

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
    if (!isInteractive) {
      return;
    }

    const nextValues = selectedValues.filter((_, itemIndex) => itemIndex !== index);
    const nextValue = createSelectedValue(nextValues, multiple);

    setResolvedValue(nextValue);
  }

  function handleClearPress(): void {
    if (!isInteractive) {
      return;
    }

    setResolvedValue(undefined);
    onClear?.();
  }

  function handleImageError(uri: string): void {
    setFailedImages(previous => ({ ...previous, [uri]: true }));
  }

  function handleImageRetry(uri: string): void {
    setFailedImages(previous => {
      const nextFailedImages = { ...previous };

      delete nextFailedImages[uri];

      return nextFailedImages;
    });
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
    } catch (pickError: unknown) {
      onError?.(pickError);
    }
  }

  function renderPanelHeader(): React.ReactNode {
    return (
      <Row style={[tokenStyles.popupHeader, styles?.popupHeader]}>
        <Column style={[tokenStyles.popupTitleArea, styles?.popupTitleArea]}>
          <Text
            color="heading"
            size="xl"
            weight="strong"
            style={[tokenStyles.popupTitle, styles?.popupTitle]}
            testID="image-picker-panel-title"
          >
            {titleText}
          </Text>
          <Text
            color="secondary"
            style={[tokenStyles.popupSubtitle, styles?.popupSubtitle]}
            testID="image-picker-panel-subtitle"
          >
            {getSelectionHintText(multiple, maxCount, multipleHintText)}
          </Text>
        </Column>
        <Row style={[tokenStyles.popupActions, styles?.popupActions]}>
          {sources.map(source => (
            <Button
              disabled={isMaxReached}
              key={source}
              onPress={() => {
                handleSourcePress(source);
              }}
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
        </Row>
      </Row>
    );
  }

  function renderAddTile(): React.ReactNode {
    if (!isAddTileVisible) {
      return null;
    }

    return (
      <Grid.Item key="image-picker-add">
        <Pressable
          onPress={() => {
            const [firstSource] = sources;

            if (firstSource !== undefined) {
              handleSourcePress(firstSource);
            }
          }}
          style={tokenStyles.addTile}
          testID="image-picker-add-tile"
        >
          <Icon color="tertiary" icon="plus" size={24} />
          <Text color="tertiary" size="xs" style={tokenStyles.addTileText}>
            添加
          </Text>
        </Pressable>
      </Grid.Item>
    );
  }

  function renderImageTile(
    image: ImagePickerValue,
    index: number,
  ): React.ReactNode {
    if (failedImages[image.uri] === true) {
      return (
        <Grid.Item key={`${image.uri}-${index}`}>
          <Pressable
            onPress={() => handleImageRetry(image.uri)}
            style={tokenStyles.errorTile}
            testID="image-picker-failed-item"
          >
            <Icon color="error" icon="warning" size={20} />
            <Text color="error" size="xs" style={tokenStyles.errorText}>
              加载失败
            </Text>
          </Pressable>
        </Grid.Item>
      );
    }

    return (
      <Grid.Item key={`${image.uri}-${index}`}>
        <View
          style={[tokenStyles.imageItem, styles?.imageItem]}
          testID="image-picker-selected-item"
        >
          <Image
            onError={() => handleImageError(image.uri)}
            source={{ uri: image.uri }}
            style={[tokenStyles.image as ImageStyle, styles?.image]}
          />
          {multiple && isInteractive ? (
            <Pressable
              hitSlop={removeButtonHitSlop}
              onPress={() => removeSelectedValue(index)}
              style={[tokenStyles.removeButton, styles?.removeButton]}
              testID="image-picker-remove-image"
            >
              <Icon color="lightSolid" icon="close" size={12} />
            </Pressable>
          ) : null}
        </View>
      </Grid.Item>
    );
  }

  function renderSelectedImages(): React.ReactNode {
    return (
      <>
        {selectedValues.length === 0 ? (
          <Column style={[tokenStyles.empty, styles?.empty]}>
            <Icon color="tertiary" icon="image" size={28} />
            <Text color="tertiary" size="xs" style={[tokenStyles.emptyText, styles?.emptyText]}>
              {emptyText}
            </Text>
          </Column>
        ) : null}
        <Grid
          columns={IMAGE_GRID_COLUMNS}
          gap="small"
          style={[tokenStyles.imageGrid, styles?.imageGrid]}
        >
          {selectedValues.map((image, index) => renderImageTile(image, index))}
          {renderAddTile()}
        </Grid>
      </>
    );
  }

  return (
    <>
      <PickerTrigger
        active={isOpen && status !== 'error'}
        allowClear={allowClear}
        disabled={isDisabled}
        displayInputProps={displayInputProps}
        error={error}
        errorText={errorText}
        externalInputStyles={styles?.input}
        externalTriggerStyle={style}
        hasValue={hasSelectedValue}
        helper={helper}
        helperText={helperText}
        label={label ?? labelText}
        onClearPress={handleClearPress}
        onPress={handleTriggerPress}
        prefix={(
          <Icon
            color={hasSelectedValue ? 'primary' : 'tertiary'}
            icon="image"
            size="large"
            weight={hasSelectedValue ? 'fill' : undefined}
          />
        )}
        readonly={isReadonly}
        size={size}
        status={status}
        suffix={
          multiple && hasSelectedValue ? (
            <Text color="tertiary" size="xs" style={tokenStyles.countText}>
              {`${selectedCount} / ${maxCount}`}
            </Text>
          ) : undefined
        }
        valueText={statusText}
      />
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
