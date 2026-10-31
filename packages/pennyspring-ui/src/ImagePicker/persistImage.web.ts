import type { ImagePickerSelectedValue } from './types';

export async function persistImage(
  value: ImagePickerSelectedValue | undefined,
): Promise<ImagePickerSelectedValue | undefined> {
  return value;
}
