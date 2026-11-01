import {
  buildMediaRef,
  buildMediaUploadUrl,
  getMediaKey,
  isMediaRef,
  resolveMediaRef,
  toMediaRef,
} from '../../src/media/refs';

const SERVER_URL = 'http://192.168.1.12:8787/';
const MEDIA_KEY = '123e4567-e89b-12d3-a456-426614174000.png';

describe('media refs', () => {
  it('builds and recognizes media references', () => {
    expect(buildMediaRef(MEDIA_KEY)).toBe(`media:${MEDIA_KEY}`);
    expect(isMediaRef(`media:${MEDIA_KEY}`)).toBe(true);
    expect(isMediaRef('file:///photo.jpg')).toBe(false);
    expect(getMediaKey(`media:${MEDIA_KEY}`)).toBe(MEDIA_KEY);
    expect(getMediaKey('media:../photo.jpg')).toBeNull();
  });

  it('resolves a media ref against the book server', () => {
    expect(resolveMediaRef(`media:${MEDIA_KEY}`, SERVER_URL)).toBe(
      `http://192.168.1.12:8787/api/media/${MEDIA_KEY}`,
    );
    expect(resolveMediaRef('file:///photo.jpg', SERVER_URL)).toBe(
      'file:///photo.jpg',
    );
  });

  it('turns a server media URL back into a ref', () => {
    expect(
      toMediaRef(`http://192.168.1.12:8787/api/media/${MEDIA_KEY}`, SERVER_URL),
    ).toBe(`media:${MEDIA_KEY}`);
    expect(
      toMediaRef(`http://other-host/api/media/${MEDIA_KEY}`, SERVER_URL),
    ).toBe(`http://other-host/api/media/${MEDIA_KEY}`);
    expect(toMediaRef(`media:${MEDIA_KEY}`, SERVER_URL)).toBe(
      `media:${MEDIA_KEY}`,
    );
  });

  it('builds the multipart upload URL without duplicate slashes', () => {
    expect(buildMediaUploadUrl('http://host:3000/')).toBe(
      'http://host:3000/api/media/upload',
    );
  });
});
