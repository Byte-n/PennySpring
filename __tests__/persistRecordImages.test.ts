import type { ImagePickerValue } from '@pennyspring/ui';

jest.mock('@pennyspring/ui', () => ({
  ImagePicker: {
    persistImage: jest.fn(),
  },
}));

import { ImagePicker } from '@pennyspring/ui';
import { persistRecordImages } from '../src/screens/addRecord/persistRecordImages';

const mockPersistImage = ImagePicker.persistImage as unknown as jest.MockedFunction<
  (value: ImagePickerValue[]) => Promise<ImagePickerValue[]>
>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('persistRecordImages', () => {
  it('returns empty results without persisting when there are no images', async () => {
    await expect(persistRecordImages([])).resolves.toEqual({
      images: [],
      imagePaths: [],
    });
    expect(mockPersistImage).not.toHaveBeenCalled();
  });

  it('persists picked images and returns their permanent paths', async () => {
    const picked: ImagePickerValue[] = [
      { uri: 'file:///tmp/a.jpg', fileName: 'a.jpg' },
      { uri: 'file:///tmp/b.jpg', fileName: 'b.jpg' },
    ];
    const persisted: ImagePickerValue[] = [
      { ...picked[0], uri: 'file:///Documents/x/a.jpg' },
      { ...picked[1], uri: 'file:///Documents/x/b.jpg' },
    ];
    mockPersistImage.mockResolvedValue(persisted);

    await expect(persistRecordImages(picked)).resolves.toEqual({
      images: persisted,
      imagePaths: ['file:///Documents/x/a.jpg', 'file:///Documents/x/b.jpg'],
    });
    expect(mockPersistImage).toHaveBeenCalledWith(picked);
  });

  it('propagates persistence errors', async () => {
    mockPersistImage.mockRejectedValue(new Error('图片转存失败：磁盘已满'));

    await expect(
      persistRecordImages([{ uri: 'file:///tmp/a.jpg' }]),
    ).rejects.toThrow('磁盘已满');
  });
});
