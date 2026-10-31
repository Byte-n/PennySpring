import type { ImagePickerValue } from '@pennyspring/ui';

import type { MediaSaveInput, MediaStore } from '../src/media';
import { persistRecordImages } from '../src/screens/addRecord/persistRecordImages';

function createMediaStore(overrides: Partial<MediaStore> = {}): MediaStore {
  return {
    scope: { kind: 'local', booksId: 1 },
    save: jest.fn(async (input: MediaSaveInput) => `media:${input.fileName}`),
    resolveUri: jest.fn((ref: string) => `resolved:${ref}`),
    toRef: jest.fn((uri: string) => uri),
    toDataUrl: jest.fn(async (ref: string) => ref),
    ...overrides,
  } as MediaStore;
}

describe('persistRecordImages', () => {
  it('returns empty results without saving when there are no images', async () => {
    const media = createMediaStore();

    await expect(persistRecordImages([], media)).resolves.toEqual({
      images: [],
      imagePaths: [],
    });
    expect(media.save).not.toHaveBeenCalled();
  });

  it('saves images in order and resolves their display uris', async () => {
    const picked: ImagePickerValue[] = [
      { uri: 'file:///tmp/a.jpg', fileName: 'a.jpg' },
      { uri: 'file:///tmp/b.jpg', fileName: 'b.jpg' },
    ];
    const media = createMediaStore();

    const result = await persistRecordImages(picked, media);

    expect(media.save).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ uri: 'file:///tmp/a.jpg', fileName: 'a.jpg' }),
    );
    expect(media.save).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ uri: 'file:///tmp/b.jpg', fileName: 'b.jpg' }),
    );
    expect(result.imagePaths).toEqual(['media:a.jpg', 'media:b.jpg']);
    expect(result.images.map(image => image.uri)).toEqual([
      'resolved:media:a.jpg',
      'resolved:media:b.jpg',
    ]);
  });

  it('propagates media save errors', async () => {
    const media = createMediaStore({
      save: jest.fn(async () => {
        throw new Error('图片上传超时');
      }),
    });

    await expect(
      persistRecordImages([{ uri: 'file:///tmp/a.jpg' }], media),
    ).rejects.toThrow('图片上传超时');
  });
});
