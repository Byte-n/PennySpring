import { keepLocalCopy } from '@react-native-documents/picker';
import { ImagePicker } from '../src/ImagePicker';
import type { ImagePickerValue } from '../src/ImagePicker';

jest.mock('@react-native-documents/picker', () => ({
  __esModule: true,
  keepLocalCopy: jest.fn(),
}));

const mockKeepLocalCopy = jest.mocked(keepLocalCopy);

function success(
  sourceUri: string,
  localUri: string,
): { status: 'success'; sourceUri: string; localUri: string } {
  return { localUri, sourceUri, status: 'success' };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ImagePicker.persistImage', () => {
  it('returns undefined without copying when the value is undefined', async () => {
    await expect(ImagePicker.persistImage(undefined)).resolves.toBeUndefined();
    expect(mockKeepLocalCopy).not.toHaveBeenCalled();
  });

  it('returns an empty array without copying when no images are selected', async () => {
    await expect(ImagePicker.persistImage([])).resolves.toEqual([]);
    expect(mockKeepLocalCopy).not.toHaveBeenCalled();
  });

  it('replaces the picked uri with the permanent copy and keeps metadata', async () => {
    const value: ImagePickerValue = {
      uri: 'file:///tmp/photo.jpg',
      fileName: 'photo.jpg',
      mimeType: 'image/jpeg',
    };
    mockKeepLocalCopy.mockResolvedValue([
      success(value.uri, 'file:///Documents/uuid/photo.jpg'),
    ]);

    await expect(ImagePicker.persistImage(value)).resolves.toEqual({
      ...value,
      uri: 'file:///Documents/uuid/photo.jpg',
    });
    expect(mockKeepLocalCopy).toHaveBeenCalledWith({
      files: [{ uri: 'file:///tmp/photo.jpg', fileName: 'photo.jpg' }],
      destination: 'documentDirectory',
    });
  });

  it('derives a jpg file name when the picked value has no extension', async () => {
    const value: ImagePickerValue = { uri: 'file:///tmp/photo' };
    mockKeepLocalCopy.mockResolvedValue([
      success(value.uri, 'file:///Documents/uuid/photo.jpg'),
    ]);

    await ImagePicker.persistImage(value);

    expect(mockKeepLocalCopy).toHaveBeenCalledWith({
      files: [{ uri: 'file:///tmp/photo', fileName: 'photo.jpg' }],
      destination: 'documentDirectory',
    });
  });

  it('skips uris that already live in permanent storage', async () => {
    const iosValue: ImagePickerValue = {
      uri: 'file:///Documents/existing/cover.jpg',
      fileName: 'cover.jpg',
    };
    const androidValue: ImagePickerValue = {
      uri: 'file:///data/user/0/com.pennyspring/files/existing/cover.jpg',
      fileName: 'cover.jpg',
    };

    await expect(ImagePicker.persistImage(iosValue)).resolves.toBe(iosValue);
    await expect(ImagePicker.persistImage(androidValue)).resolves.toBe(
      androidValue,
    );
    expect(mockKeepLocalCopy).not.toHaveBeenCalled();
  });

  it('copies only pending images and keeps array order and shape', async () => {
    const pendingFirst: ImagePickerValue = {
      uri: 'file:///tmp/first.jpg',
      fileName: 'first.jpg',
    };
    const persisted: ImagePickerValue = {
      uri: 'file:///Documents/existing/second.jpg',
      fileName: 'second.jpg',
    };
    const pendingThird: ImagePickerValue = { uri: 'file:///tmp/third.png' };
    mockKeepLocalCopy.mockResolvedValue([
      success(pendingFirst.uri, 'file:///Documents/new/first.jpg'),
      success(pendingThird.uri, 'file:///Documents/new/third.png'),
    ]);

    await expect(
      ImagePicker.persistImage([pendingFirst, persisted, pendingThird]),
    ).resolves.toEqual([
      { ...pendingFirst, uri: 'file:///Documents/new/first.jpg' },
      persisted,
      { ...pendingThird, uri: 'file:///Documents/new/third.png' },
    ]);
    expect(mockKeepLocalCopy).toHaveBeenCalledWith({
      files: [
        { uri: 'file:///tmp/first.jpg', fileName: 'first.jpg' },
        { uri: 'file:///tmp/third.png', fileName: 'third.png' },
      ],
      destination: 'documentDirectory',
    });
  });

  it('rejects with the native copy error when persistence fails', async () => {
    mockKeepLocalCopy.mockResolvedValue([
      {
        status: 'error',
        sourceUri: 'file:///tmp/photo.jpg',
        copyError: '磁盘已满',
      },
    ]);

    await expect(
      ImagePicker.persistImage({
        uri: 'file:///tmp/photo.jpg',
        fileName: 'photo.jpg',
      }),
    ).rejects.toThrow('磁盘已满');
  });
});
