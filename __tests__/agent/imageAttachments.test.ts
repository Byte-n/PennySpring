import type { ImagePickerValue } from '@pennyspring/ui';

import {
  AGENT_IMAGE_MAX_BYTES,
  isSendableImageValue,
  toImageFilePart,
  toImageFileParts,
} from '../../src/agent/ui/imageAttachments';

const IMAGE: ImagePickerValue = {
  uri: 'file:///receipt.jpg',
  fileName: 'receipt.jpg',
  mimeType: 'image/jpeg',
  base64: 'QUJD',
  fileSize: 1024,
};

describe('agent image attachments', () => {
  it('builds a data URL file part from a picked image', () => {
    expect(toImageFilePart(IMAGE)).toEqual({
      type: 'file',
      mediaType: 'image/jpeg',
      filename: 'receipt.jpg',
      url: 'data:image/jpeg;base64,QUJD',
    });
  });

  it('falls back to jpeg metadata when the picker omits it', () => {
    expect(
      toImageFilePart({
        uri: 'file:///photo',
        base64: 'REVG',
      }),
    ).toEqual({
      type: 'file',
      mediaType: 'image/jpeg',
      filename: 'image.jpg',
      url: 'data:image/jpeg;base64,REVG',
    });
  });

  it('rejects values without base64 or above the size limit', () => {
    expect(isSendableImageValue({ uri: 'file:///photo' })).toBe(false);
    expect(
      isSendableImageValue({
        uri: 'file:///photo',
        base64: 'QUJD',
        fileSize: AGENT_IMAGE_MAX_BYTES + 1,
      }),
    ).toBe(false);
    expect(
      toImageFilePart({ uri: 'file:///photo', base64: 'QUJD' }),
    ).not.toBeNull();
  });

  it('filters unsendable images when building the request payload', () => {
    const parts = toImageFileParts([
      IMAGE,
      { uri: 'file:///missing-base64' },
      {
        uri: 'file:///too-large',
        base64: 'QUJD',
        fileSize: AGENT_IMAGE_MAX_BYTES + 1,
      },
    ]);

    expect(parts).toHaveLength(1);
    expect(parts[0]?.filename).toBe('receipt.jpg');
  });
});
