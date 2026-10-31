import {
  toQuickBookFilePart,
  toQuickBookImagePickerValue,
} from '../../src/features/quickBook/imagePayload';
import type { QuickBookImage } from '../../src/features/quickBook/types';

const image: QuickBookImage = {
  localPath: 'file:///tmp/quick-book/shot.jpg',
  base64: 'QUJD',
  mimeType: 'image/jpeg',
  fileName: 'shot.jpg',
  fileSize: 3,
  width: 1080,
  height: 2400,
};

describe('quick book image payload', () => {
  it('maps a screenshot to a sendable image picker value', () => {
    expect(toQuickBookImagePickerValue(image)).toEqual({
      uri: 'file:///tmp/quick-book/shot.jpg',
      name: 'shot.jpg',
      fileName: 'shot.jpg',
      fileSize: 3,
      mimeType: 'image/jpeg',
      width: 1080,
      height: 2400,
      base64: 'QUJD',
    });
  });

  it('builds a file part with a data url', () => {
    expect(toQuickBookFilePart(image)).toEqual({
      type: 'file',
      mediaType: 'image/jpeg',
      filename: 'shot.jpg',
      url: 'data:image/jpeg;base64,QUJD',
    });
  });

  it('returns null when the base64 payload is missing', () => {
    expect(toQuickBookFilePart({ ...image, base64: '' })).toBeNull();
  });
});
