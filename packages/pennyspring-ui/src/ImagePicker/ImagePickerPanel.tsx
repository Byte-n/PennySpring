import React, { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@pennyspring/theme';
import { Button } from '../Button';
import { Column } from '../Column';
import { Grid } from '../Grid';
import { Icon } from '../Icon';
import { Image } from '../Image';
import { Popup } from '../Popup';
import { Row } from '../Row';
import { Text } from '../Text';
import {
  pickImageFromCamera,
  pickImageFromFiles,
  pickImageFromLibrary,
} from './nativePickers';
import { useStyles } from './style';
import {
  DEFAULT_CAMERA_TEXT,
  DEFAULT_OK_TEXT,
  DEFAULT_EMPTY_TEXT,
  DEFAULT_FILE_SYSTEM_TEXT,
  DEFAULT_PANEL_HEIGHT,
  DEFAULT_PHOTO_TEXT,
  DEFAULT_SOURCES,
  DEFAULT_TITLE_TEXT,
  IMAGE_GRID_COLUMNS,
  createOpenChangeParams,
  createSelectedValue,
  getActionTestID,
  getActionText,
  getSelectedCount,
  getSelectedValues,
  getSelectionHintText,
} from './utils';
import type {
  ImagePickerOpenChangeParams,
  ImagePickerPickOptions,
  ImagePickerSelectedValue,
  ImagePickerSource,
  ImagePickerStyles,
  ImagePickerValue,
} from './types';

export interface ImagePickerPanelProps {
  open: boolean;
  onOpenChange: (open: boolean, params: ImagePickerOpenChangeParams) => void;
  value?: ImagePickerSelectedValue;
  onChange: (value: ImagePickerSelectedValue | undefined) => void;
  multiple: boolean;
  maxCount: number;
  sources: readonly ImagePickerSource[];
  includeBase64?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  quality?: ImagePickerPickOptions['quality'];
  disabled?: boolean;
  readonly?: boolean;
  cameraText?: string;
  photoText?: string;
  fileSystemText?: string;
  doneText?: string;
  titleText?: string;
  multipleHintText?: string;
  emptyText?: string;
  onError?: (error: unknown) => void;
  style?: StyleProp<ViewStyle>;
  styles?: ImagePickerStyles;
}

export function ImagePickerPanel({
  cameraText = DEFAULT_CAMERA_TEXT,
  disabled = false,
  doneText = DEFAULT_OK_TEXT,
  emptyText = DEFAULT_EMPTY_TEXT,
  fileSystemText = DEFAULT_FILE_SYSTEM_TEXT,
  includeBase64 = false,
  maxCount,
  maxHeight,
  maxWidth,
  multiple,
  multipleHintText,
  onChange,
  onError,
  onOpenChange,
  open,
  photoText = DEFAULT_PHOTO_TEXT,
  quality,
  readonly = false,
  sources = DEFAULT_SOURCES,
  style,
  styles,
  titleText = DEFAULT_TITLE_TEXT,
  value,
}: ImagePickerPanelProps): React.ReactElement {
  const { token } = useTheme();
  const tokenStyles = useStyles();
  const selectedValues = getSelectedValues(value);
  const selectedCount = getSelectedCount(value);
  const isMaxReached = multiple && selectedCount >= maxCount;
  const isInteractive = !disabled && !readonly;
  const removeButtonHitSlop = useMemo(() => {
    const hitSlop = (token.controlHeight - token.sizeLG) / 2;

    return {
      bottom: hitSlop,
      left: hitSlop,
      right: hitSlop,
      top: hitSlop,
    };
  }, [token.controlHeight, token.sizeLG]);

  function updateOpen(
    nextOpen: boolean,
    reason: ImagePickerOpenChangeParams['reason'],
  ): void {
    onOpenChange(nextOpen, createOpenChangeParams(reason));
  }

  function handleDonePress(): void {
    updateOpen(false, 'action');
  }

  function updateSelectedValue(nextValues: ImagePickerValue[]): void {
    const nextValue = createSelectedValue(nextValues, multiple);

    if (nextValue !== undefined) {
      onChange(nextValue);
    }
  }

  function removeSelectedValue(index: number): void {
    if (!isInteractive) {
      return;
    }

    const nextValues = selectedValues.filter(
      (_, itemIndex) => itemIndex !== index,
    );

    onChange(createSelectedValue(nextValues, multiple));
  }

  async function handleSourcePress(source: ImagePickerSource): Promise<void> {
    if (isMaxReached || !isInteractive) {
      return;
    }

    const remainingCount = multiple ? Math.max(maxCount - selectedCount, 0) : 1;

    try {
      const pickOptions = {
        maxCount: remainingCount,
        multiple: multiple && source !== 'camera',
        includeBase64,
        ...(maxWidth !== undefined ? { maxWidth } : null),
        ...(maxHeight !== undefined ? { maxHeight } : null),
        ...(quality !== undefined ? { quality } : null),
      };
      const nextValue =
        source === 'camera'
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
              size="small"
              color="primary"
            >
              {getActionText(source, cameraText, photoText, fileSystemText)}
            </Button>
          ))}
          <Button
            onPress={handleDonePress}
            size="small"
            testID="image-picker-action-done"
          >
            {doneText}
          </Button>
        </Row>
      </Row>
    );
  }

  function renderAddTile(): React.ReactNode {
    if (isMaxReached || (!multiple && selectedCount > 0)) {
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
    return (
      <Grid.Item key={`${image.uri}-${index}`}>
        <View
          style={[tokenStyles.imageItem, styles?.imageItem]}
          testID="image-picker-selected-item"
        >
          <Image
            error={
              <>
                <Icon color="error" icon="warning" size={20} />
                <Text
                  color="error"
                  size="xs"
                  style={tokenStyles.errorText}
                >
                  加载失败
                </Text>
              </>
            }
            src={{ uri: image.uri, headers: image.headers }}
            style={tokenStyles.image}
            styles={{
              error: [tokenStyles.errorTile, styles?.imageError],
              image: styles?.image,
            }}
            testID="image-picker-selected-image"
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
            <Text
              color="tertiary"
              size="xs"
              style={[tokenStyles.emptyText, styles?.emptyText]}
            >
              {emptyText}
            </Text>
          </Column>
        ) : null}
        <Image.PreviewGroup>
          <Grid
            columns={IMAGE_GRID_COLUMNS}
            gap="small"
            style={[tokenStyles.imageGrid, styles?.imageGrid]}
          >
            {selectedValues.map((image, index) =>
              renderImageTile(image, index),
            )}
            {renderAddTile()}
          </Grid>
        </Image.PreviewGroup>
      </>
    );
  }

  return (
    <Popup.FloatingPanel
      bodyScrollable={false}
      cancel={null}
      closeOnMaskClick
      footer={null}
      header={renderPanelHeader()}
      height={DEFAULT_PANEL_HEIGHT}
      onCancel={() => updateOpen(false, 'cancel')}
      onOpenChange={nextOpen => {
        if (!nextOpen) {
          updateOpen(false, 'cancel');
        }
      }}
      open={open}
      position="bottom"
      style={[tokenStyles.popup, styles?.popup, style]}
      styles={{ panelBody: [tokenStyles.popupBody, styles?.popupBody] }}
    >
      <ScrollView scrollEnabled>{renderSelectedImages()}</ScrollView>
    </Popup.FloatingPanel>
  );
}
