import React, { useMemo } from 'react';
import { CameraIcon, FolderIcon, ImagesIcon } from 'phosphor-react-native';
import { ActionSheet } from '../ActionSheet';
import type {
  ActionSheetAction,
  ActionSheetOpenChangeParams,
} from '../ActionSheet';
import type { IconComponent } from '../Icon';
import { useControllableValue } from '../_hooks';
import {
  pickImageFromCamera,
  pickImageFromFiles,
  pickImageFromLibrary,
} from './nativePickers';
import {
  DEFAULT_ACTION_SHEET_TITLE_TEXT,
  DEFAULT_CAMERA_TEXT,
  DEFAULT_FILE_SYSTEM_TEXT,
  DEFAULT_MAX_COUNT,
  DEFAULT_PHOTO_TEXT,
  DEFAULT_SOURCES,
  createSelectedValue,
  getActionText,
  getSelectedCount,
  getSelectedValues,
} from './utils';
import type {
  ImagePickerActionSheetProps,
  ImagePickerOpenChangeParams,
  ImagePickerSelectedValue,
  ImagePickerSource,
  ImagePickerValue,
} from './types';

const SOURCE_ICONS: Record<ImagePickerSource, IconComponent> = {
  camera: CameraIcon,
  photo: ImagesIcon,
  fileSystem: FolderIcon,
};

function ImagePickerActionSheetRoot({
  cameraText = DEFAULT_CAMERA_TEXT,
  cancelText,
  defaultOpen,
  defaultValue,
  fileSystemText = DEFAULT_FILE_SYSTEM_TEXT,
  includeBase64 = false,
  maxCount = DEFAULT_MAX_COUNT,
  maxHeight,
  maxWidth,
  multiple = false,
  onChange,
  onError,
  onOpenChange,
  open,
  photoText = DEFAULT_PHOTO_TEXT,
  quality,
  sources = DEFAULT_SOURCES,
  titleText = DEFAULT_ACTION_SHEET_TITLE_TEXT,
  value,
}: ImagePickerActionSheetProps): React.ReactElement {
  const [resolvedValue, setResolvedValue] = useControllableValue<
    ImagePickerSelectedValue | undefined
  >(
    defaultValue as ImagePickerSelectedValue | undefined,
    value as ImagePickerSelectedValue | undefined,
    onChange as
      ((nextValue: ImagePickerSelectedValue | undefined) => void) | undefined,
  );
  const selectedValues = getSelectedValues(resolvedValue);
  const selectedCount = getSelectedCount(resolvedValue);
  const isMaxReached = multiple && selectedCount >= maxCount;

  const actions = useMemo<ActionSheetAction[]>(
    () =>
      sources.map(source => ({
        key: source,
        icon: SOURCE_ICONS[source],
        text: getActionText(source, cameraText, photoText, fileSystemText),
        disabled: isMaxReached,
      })),
    [cameraText, fileSystemText, isMaxReached, photoText, sources],
  );

  function updateSelectedValue(nextValues: ImagePickerValue[]): void {
    const nextValue = createSelectedValue(nextValues, multiple);

    if (nextValue !== undefined) {
      setResolvedValue(nextValue);
    }
  }

  async function handleSourcePress(source: ImagePickerSource): Promise<void> {
    if (isMaxReached) {
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

  function handleOpenChange(
    nextOpen: boolean,
    params: ActionSheetOpenChangeParams,
  ): void {
    const openChangeParams: ImagePickerOpenChangeParams = {
      reason: params.reason === 'action' ? 'action' : 'cancel',
    };

    onOpenChange?.(nextOpen, openChangeParams);
  }

  return (
    <ActionSheet
      actions={actions}
      cancelText={cancelText}
      defaultOpen={defaultOpen === true}
      onAction={(_action, index) => {
        const source = sources[index];

        if (source !== undefined) {
          handleSourcePress(source);
        }
      }}
      onOpenChange={handleOpenChange}
      open={open}
      titleText={titleText}
    />
  );
}

export const ImagePickerActionSheet = ImagePickerActionSheetRoot;
