import type { ImagePickerValue } from '@pennyspring/ui';

export type MediaScope =
  | { kind: 'local'; booksId: number }
  | { kind: 'remote'; booksId: number; serverUrl: string };

export interface MediaSaveInput {
  uri: string;
  base64?: string;
  mimeType?: string;
  fileName?: string;
  fileSize?: number;
}

export interface MediaStore {
  readonly scope: MediaScope;
  save(input: MediaSaveInput): Promise<string>;
  resolveUri(ref: string): string;
  toRef(uri: string): string;
  toDataUrl(ref: string): Promise<string>;
}

export function toMediaSaveInput(value: ImagePickerValue): MediaSaveInput {
  return {
    uri: value.uri,
    base64: value.base64,
    mimeType: value.mimeType,
    fileName: value.fileName ?? value.name,
    fileSize: value.fileSize,
  };
}
