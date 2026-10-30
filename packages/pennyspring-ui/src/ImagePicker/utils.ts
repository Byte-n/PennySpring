import type {
  ImagePickerOpenChangeParams,
  ImagePickerSelectedValue,
  ImagePickerSource,
  ImagePickerValue,
} from './types';

export const DEFAULT_CAMERA_TEXT = '拍照';
export const DEFAULT_PHOTO_TEXT = '相册';
export const DEFAULT_FILE_SYSTEM_TEXT = '文件';
export const DEFAULT_OK_TEXT = '完成';
export const DEFAULT_TITLE_TEXT = '请选择图片';
export const DEFAULT_EMPTY_TEXT = '暂无已选图片';
export const DEFAULT_SINGLE_HINT_TEXT = '最多1张';
export const DEFAULT_SELECTED_TEXT = '已选择';
export const DEFAULT_MAX_COUNT = 1;
export const DEFAULT_PANEL_HEIGHT = '50%';
export const DEFAULT_SOURCES: ImagePickerSource[] = ['camera', 'photo'];
export const IMAGE_GRID_COLUMNS = 3;

export function getSelectedCount(
  value: ImagePickerSelectedValue | undefined,
): number {
  if (Array.isArray(value)) {
    return value.length;
  }

  return value === undefined ? 0 : 1;
}

export function getStatusText(
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

export function getSelectedValues(
  value: ImagePickerSelectedValue | undefined,
): ImagePickerValue[] {
  if (value === undefined) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

export function createSelectedValue(
  values: ImagePickerValue[],
  multiple: boolean,
): ImagePickerSelectedValue | undefined {
  if (multiple) {
    return values;
  }

  return values[0];
}

export function createOpenChangeParams(
  reason: ImagePickerOpenChangeParams['reason'],
): ImagePickerOpenChangeParams {
  return { reason };
}

export function getActionText(
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

export function getActionTestID(source: ImagePickerSource): string {
  return `image-picker-action-${source}`;
}

export function getMultipleHintText(maxCount: number): string {
  return `允许多选，最多${maxCount}张`;
}

export function getSelectionHintText(
  multiple: boolean,
  maxCount: number,
  multipleHintText: string | undefined,
): string {
  if (multiple) {
    return multipleHintText ?? getMultipleHintText(maxCount);
  }

  return DEFAULT_SINGLE_HINT_TEXT;
}
