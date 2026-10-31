import type { ImagePickerValue } from '@pennyspring/ui';

export type MediaScope =
  | { kind: 'local'; booksId: number }
  | { kind: 'remote'; booksId: number; serverUrl: string; token: string };

/** 可直接交给 React Native Image 的展示源；远程服务器媒体附带访问令牌。 */
export interface MediaImageSource {
  uri: string;
  headers?: Record<string, string>;
}

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
  resolveSource(ref: string): MediaImageSource;
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
