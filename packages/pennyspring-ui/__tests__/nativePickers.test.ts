const mockLaunchCamera = jest.fn();
const mockLaunchImageLibrary = jest.fn();

jest.mock('react-native-image-picker', () => ({
  __esModule: true,
  launchCamera: (...args: unknown[]) => mockLaunchCamera(...args),
  launchImageLibrary: (...args: unknown[]) => mockLaunchImageLibrary(...args),
}));

jest.mock('@react-native-documents/picker', () => ({
  __esModule: true,
  errorCodes: {
    OPERATION_CANCELED: 'OPERATION_CANCELED',
  },
  isErrorWithCode: (error: unknown) =>
    typeof error === 'object' && error !== null && 'code' in error,
  pick: jest.fn(),
  types: {
    images: 'image/*',
  },
}));

import {
  pickImageFromCamera,
  pickImageFromLibrary,
} from '../src/ImagePicker/nativePickers';

const IMAGE_RESPONSE = {
  assets: [
    {
      base64: 'QUJD',
      fileName: 'photo.jpg',
      fileSize: 1024,
      height: 800,
      type: 'image/jpeg',
      uri: 'file:///photo.jpg',
      width: 1200,
    },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ImagePicker native pickers', () => {
  it('requests base64 from the photo library when enabled', async () => {
    mockLaunchImageLibrary.mockResolvedValue(IMAGE_RESPONSE);

    const value = await pickImageFromLibrary({
      maxCount: 2,
      multiple: true,
      includeBase64: true,
      maxWidth: 1_600,
      maxHeight: 1_600,
      quality: 0.8,
    });

    expect(mockLaunchImageLibrary).toHaveBeenCalledWith({
      mediaType: 'photo',
      selectionLimit: 2,
      includeBase64: true,
      maxWidth: 1_600,
      maxHeight: 1_600,
      quality: 0.8,
    });
    expect(value).toEqual([
      {
        uri: 'file:///photo.jpg',
        fileName: 'photo.jpg',
        fileSize: 1024,
        height: 800,
        mimeType: 'image/jpeg',
        width: 1200,
        base64: 'QUJD',
      },
    ]);
  });

  it('requests base64 from the camera when enabled', async () => {
    mockLaunchCamera.mockResolvedValue(IMAGE_RESPONSE);

    const value = await pickImageFromCamera({
      maxCount: 1,
      multiple: false,
      includeBase64: true,
    });

    expect(mockLaunchCamera).toHaveBeenCalledWith({
      mediaType: 'photo',
      includeBase64: true,
    });
    expect(value).toEqual(
      expect.objectContaining({
        uri: 'file:///photo.jpg',
        mimeType: 'image/jpeg',
        base64: 'QUJD',
      }),
    );
  });

  it('leaves base64 disabled by default', async () => {
    mockLaunchImageLibrary.mockResolvedValue(IMAGE_RESPONSE);

    await pickImageFromLibrary({ maxCount: 1, multiple: false });

    expect(mockLaunchImageLibrary).toHaveBeenCalledWith({
      mediaType: 'photo',
      selectionLimit: 1,
    });
  });
});
