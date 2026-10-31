import type { BookRow } from '@pennyspring/api';
import type { ImagePickerValue } from '@pennyspring/ui';

import { createMediaStore, type MediaStore } from '../../media';

interface RemoteBookApi {
  create(input: {
    name: string;
    description: string;
    background: string;
  }): Promise<BookRow>;
  update(input: {
    id: number;
    name: string;
    description: string;
    background: string;
  }): Promise<BookRow>;
}

export interface RemoteBookCoverInput {
  name: string;
  description: string;
  backgroundImage?: ImagePickerValue;
}

export interface RemoteBookCreateResult {
  book: BookRow;
  coverError: Error | null;
}

type MediaFactory = (
  booksId: number,
  serverUrl: string,
  token: string,
) => MediaStore;

const defaultMediaFactory: MediaFactory = (booksId, serverUrl, token) =>
  createMediaStore({ kind: 'remote', booksId, serverUrl, token });

async function saveRemoteCover(
  media: MediaStore,
  image: ImagePickerValue | undefined,
): Promise<string> {
  if (!image) {
    return '';
  }
  return media.save({
    uri: image.uri,
    base64: image.base64,
    mimeType: image.mimeType,
    fileName: image.fileName ?? image.name,
    fileSize: image.fileSize,
  });
}

function toError(value: unknown): Error {
  return value instanceof Error ? value : new Error('封面上传失败');
}

export async function createRemoteBookWithCover(
  api: RemoteBookApi,
  serverUrl: string,
  token: string,
  input: RemoteBookCoverInput,
  mediaFactory: MediaFactory = defaultMediaFactory,
): Promise<RemoteBookCreateResult> {
  const created = await api.create({
    name: input.name,
    description: input.description,
    background: '',
  });
  if (!input.backgroundImage) {
    return { book: created, coverError: null };
  }

  const media = mediaFactory(created.id, serverUrl, token);
  try {
    const background = await saveRemoteCover(media, input.backgroundImage);
    if (!background) {
      return { book: created, coverError: null };
    }
    const updated = await api.update({
      id: created.id,
      name: input.name,
      description: input.description,
      background,
    });
    return { book: updated, coverError: null };
  } catch (error: unknown) {
    return { book: created, coverError: toError(error) };
  }
}

export async function updateRemoteBookWithCover(
  api: RemoteBookApi,
  serverUrl: string,
  token: string,
  book: BookRow,
  input: RemoteBookCoverInput,
  mediaFactory: MediaFactory = defaultMediaFactory,
): Promise<BookRow> {
  const media = mediaFactory(book.id, serverUrl, token);
  const background = await saveRemoteCover(media, input.backgroundImage);
  return api.update({
    id: book.id,
    name: input.name,
    description: input.description,
    background,
  });
}
