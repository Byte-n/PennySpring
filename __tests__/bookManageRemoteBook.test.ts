import type { BookRow } from '@pennyspring/api';
import type { ImagePickerValue } from '@pennyspring/ui';

import type { MediaStore } from '../src/media';
import {
  createRemoteBookWithCover,
  updateRemoteBookWithCover,
} from '../src/screens/bookManage/remoteBook';

const SERVER_URL = 'http://192.168.1.12:8787';
const COVER: ImagePickerValue = {
  uri: 'file:///tmp/cover.jpg',
  fileName: 'cover.jpg',
  mimeType: 'image/jpeg',
  base64: 'QUJD',
};

function createBook(overrides: Partial<BookRow> = {}): BookRow {
  return {
    id: 10,
    name: '测试账本',
    description: '',
    background: '',
    createdTime: 0,
    updatedTime: 0,
    ...overrides,
  };
}

function createMedia(save: jest.Mock, booksId = 10): MediaStore {
  return {
    scope: { kind: 'remote', booksId, serverUrl: SERVER_URL },
    save,
    resolveUri: (ref: string) => ref,
    toRef: (uri: string) => uri,
    toDataUrl: async (ref: string) => ref,
  };
}

function createApi() {
  const create = jest.fn(async (input: Record<string, unknown>) =>
    createBook({ ...input, id: 10 } as Partial<BookRow>),
  );
  const update = jest.fn(async (input: Record<string, unknown>) =>
    createBook({ ...input } as Partial<BookRow>),
  );
  return { create, update };
}

describe('remote book cover flow', () => {
  it('creates an empty-cover book, uploads the cover, then updates it', async () => {
    const events: string[] = [];
    const api = createApi();
    api.create.mockImplementation(async input => {
      events.push('create');
      return createBook({ ...input, id: 10 } as Partial<BookRow>);
    });
    api.update.mockImplementation(async input => {
      events.push('update');
      return createBook({ ...input } as Partial<BookRow>);
    });
    const save = jest.fn(async () => {
      events.push('save');
      return 'media:cover.png';
    });
    const mediaFactory = jest.fn(() => createMedia(save));

    const result = await createRemoteBookWithCover(
      api,
      SERVER_URL,
      { name: '测试账本', description: '描述', backgroundImage: COVER },
      mediaFactory,
    );

    expect(events).toEqual(['create', 'save', 'update']);
    expect(api.create).toHaveBeenCalledWith(
      expect.objectContaining({ background: '' }),
    );
    expect(mediaFactory).toHaveBeenCalledWith(10, SERVER_URL);
    expect(api.update).toHaveBeenCalledWith(
      expect.objectContaining({ id: 10, background: 'media:cover.png' }),
    );
    expect(result.book.background).toBe('media:cover.png');
    expect(result.coverError).toBeNull();
  });

  it('skips cover upload when the book is created without an image', async () => {
    const api = createApi();
    const mediaFactory = jest.fn();

    const result = await createRemoteBookWithCover(
      api,
      SERVER_URL,
      { name: '测试账本', description: '' },
      mediaFactory,
    );

    expect(mediaFactory).not.toHaveBeenCalled();
    expect(api.update).not.toHaveBeenCalled();
    expect(result.book.id).toBe(10);
  });

  it('keeps the created book when the cover upload fails', async () => {
    const api = createApi();
    const save = jest.fn(async () => {
      throw new Error('图片上传超时');
    });
    const mediaFactory = jest.fn(() => createMedia(save));

    const result = await createRemoteBookWithCover(
      api,
      SERVER_URL,
      { name: '测试账本', description: '', backgroundImage: COVER },
      mediaFactory,
    );

    expect(api.create).toHaveBeenCalled();
    expect(api.update).not.toHaveBeenCalled();
    expect(result.book.id).toBe(10);
    expect(result.coverError?.message).toBe('图片上传超时');
  });

  it('updates an existing book cover through the same media ref', async () => {
    const api = createApi();
    const save = jest.fn(async () => 'media:existing.png');
    const mediaFactory = jest.fn(() => createMedia(save));
    const book = createBook({ background: 'media:existing.png' });

    const updated = await updateRemoteBookWithCover(
      api,
      SERVER_URL,
      book,
      {
        name: '新名称',
        description: '新描述',
        backgroundImage: { uri: 'http://host/api/media/existing.png' },
      },
      mediaFactory,
    );

    expect(mediaFactory).toHaveBeenCalledWith(10, SERVER_URL);
    expect(api.update).toHaveBeenCalledWith({
      id: 10,
      name: '新名称',
      description: '新描述',
      background: 'media:existing.png',
    });
    expect(updated.name).toBe('新名称');
  });

  it('does not update the book when the cover upload fails on edit', async () => {
    const api = createApi();
    const save = jest.fn(async () => {
      throw new Error('图片上传超时');
    });
    const mediaFactory = jest.fn(() => createMedia(save));

    await expect(
      updateRemoteBookWithCover(
        api,
        SERVER_URL,
        createBook(),
        { name: '新名称', description: '', backgroundImage: COVER },
        mediaFactory,
      ),
    ).rejects.toThrow('图片上传超时');
    expect(api.update).not.toHaveBeenCalled();
  });
});
