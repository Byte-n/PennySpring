/// <reference lib="dom" />
import type { ImagePickerValue } from './types';

function pickImageViaInput(): Promise<ImagePickerValue | undefined> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.addEventListener('change', () => {
      const file = input.files?.[0];

      if (file === undefined) {
        resolve(undefined);
        return;
      }

      resolve({
        uri: URL.createObjectURL(file),
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      });
    });

    input.addEventListener('cancel', () => {
      resolve(undefined);
    });

    input.click();
  });
}

export function pickImageFromLibrary(): Promise<ImagePickerValue | undefined> {
  return pickImageViaInput();
}

export function pickImageFromFiles(): Promise<ImagePickerValue | undefined> {
  return pickImageViaInput();
}
