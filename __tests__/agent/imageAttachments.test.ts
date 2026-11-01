import type { ImagePickerValue } from '@pennyspring/ui';

import type { MediaStore } from '../../src/media';
import {
  AGENT_IMAGE_MAX_BYTES,
  isSendableImageValue,
  prepareImageMessage,
  toAgentAttachment,
  toImageFilePart,
  toRefFilePart,
} from '../../src/agent/ui/imageAttachments';
import { AGENT_IMAGE_UNREADABLE_MESSAGE } from '../../src/agent/ui/copy';

const IMAGE: ImagePickerValue = {
  uri: 'file:///receipt.jpg',
  fileName: 'receipt.jpg',
  mimeType: 'image/jpeg',
  base64: 'QUJD',
  fileSize: 1024,
};

function createStore(kind: 'local' | 'remote', savedRef: string): MediaStore {
  return {
    scope:
      kind === 'local'
        ? { kind: 'local', booksId: 1 }
        : {
            kind: 'remote',
            booksId: 1,
            serverUrl: 'http://host:3000',
            token: 'test-token-0123456789',
          },
    save: jest.fn(async () => savedRef),
    resolveSource: (ref: string) => ({ uri: ref }),
    toRef: (uri: string) => uri,
    toDataUrl: async (ref: string) => ref,
  };
}

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

  it('validates the image uri and size independently of base64', () => {
    expect(isSendableImageValue({ uri: 'file:///photo' })).toBe(true);
    expect(isSendableImageValue({ uri: '' })).toBe(false);
    expect(
      isSendableImageValue({
        uri: 'file:///photo',
        base64: 'QUJD',
        fileSize: AGENT_IMAGE_MAX_BYTES + 1,
      }),
    ).toBe(false);
    expect(toImageFilePart({ uri: 'file:///photo' })).toBeNull();
  });

  it('builds a ref file part without base64', () => {
    expect(toRefFilePart('media:shot.png', { uri: 'file:///photo' })).toEqual({
      type: 'file',
      mediaType: 'image/jpeg',
      filename: 'image.jpg',
      url: 'media:shot.png',
    });
  });

  it('builds model-selectable attachments with the media ref', () => {
    expect(
      toAgentAttachment('media:shot.png', IMAGE, {
        localPath: 'file:///receipt.jpg',
      }),
    ).toEqual(
      expect.objectContaining({
        ref: 'media:shot.png',
        localPath: 'file:///receipt.jpg',
        mediaType: 'image/jpeg',
        filename: 'receipt.jpg',
      }),
    );
  });

  it('uses a data URL and local ref for local books', async () => {
    const media = createStore('local', 'file:///Documents/id/receipt.jpg');

    const prepared = await prepareImageMessage([IMAGE], media);

    expect(media.save).toHaveBeenCalledWith(
      expect.objectContaining({ uri: 'file:///receipt.jpg' }),
    );
    expect(prepared.files[0]?.url).toBe('data:image/jpeg;base64,QUJD');
    expect(prepared.attachments[0]).toEqual(
      expect.objectContaining({
        ref: 'file:///Documents/id/receipt.jpg',
        localPath: 'file:///Documents/id/receipt.jpg',
      }),
    );
  });

  it('uses a media ref without local path for remote books', async () => {
    const media = createStore('remote', 'media:receipt.png');
    const remoteImage = { ...IMAGE, base64: undefined };

    const prepared = await prepareImageMessage([remoteImage], media);

    expect(prepared.files[0]?.url).toBe('media:receipt.png');
    expect(prepared.attachments[0]).toEqual(
      expect.objectContaining({ ref: 'media:receipt.png' }),
    );
    expect(prepared.attachments[0]).not.toHaveProperty('localPath');
  });

  it('rejects local images without base64 before saving them', async () => {
    const media = createStore('local', 'file:///Documents/id/photo.jpg');

    await expect(
      prepareImageMessage([{ uri: 'file:///photo' }], media),
    ).rejects.toThrow(AGENT_IMAGE_UNREADABLE_MESSAGE);
    expect(media.save).not.toHaveBeenCalled();
  });

  it('propagates media save failures', async () => {
    const media = createStore('remote', 'media:receipt.png');
    (media.save as jest.Mock).mockRejectedValue(new Error('图片上传超时'));

    await expect(prepareImageMessage([IMAGE], media)).rejects.toThrow(
      '图片上传超时',
    );
  });
});
