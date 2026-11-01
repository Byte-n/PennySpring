jest.mock('@pennyspring/ui', () => {
  const persistImage = jest.fn();
  return {
    ImagePicker: { persistImage },
    __persistImage: persistImage,
  };
});

import { createMediaStore } from '../../src/media/store';

const pickerMock = jest.requireMock('@pennyspring/ui') as {
  __persistImage: jest.Mock;
};

const SERVER_URL = 'http://host:3000/';
const SERVER_TOKEN = 'test-token-0123456789';
const MEDIA_KEY = '123e4567-e89b-12d3-a456-426614174000.png';
const MEDIA_REF = `media:${MEDIA_KEY}`;

const fetchMock = jest.fn();
const originalFetch = globalThis.fetch;
const originalFileReader = globalThis.FileReader;

class MockFileReader {
  result: string | ArrayBuffer | null = null;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  error: Error | null = null;

  readAsDataURL(_blob: Blob): void {
    this.result = 'data:image/png;base64,QUJD';
    this.onload?.();
  }
}

function restoreGlobals(): void {
  (globalThis as { fetch: typeof fetch }).fetch = originalFetch;
  (globalThis as { FileReader: typeof FileReader }).FileReader =
    originalFileReader;
}

describe('createMediaStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (globalThis as { fetch: typeof fetch }).fetch =
      fetchMock as unknown as typeof fetch;
    (globalThis as { FileReader: typeof FileReader }).FileReader =
      MockFileReader as unknown as typeof FileReader;
  });

  afterAll(restoreGlobals);

  it('uploads a remote image as multipart and returns a media ref', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ result: MEDIA_REF }),
    });
    const store = createMediaStore({
      kind: 'remote',
      booksId: 7,
      serverUrl: SERVER_URL,
      token: SERVER_TOKEN,
    });

    const ref = await store.save({
      uri: 'file:///tmp/photo.png',
      mimeType: 'image/png',
      fileName: 'photo.png',
    });

    expect(ref).toBe(MEDIA_REF);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://host:3000/api/media/upload',
      expect.objectContaining({
        method: 'POST',
        headers: { Authorization: `Bearer ${SERVER_TOKEN}` },
      }),
    );
    const body = fetchMock.mock.calls[0]?.[1]?.body as FormData;
    expect(body.get('booksId')).toBe('7');
    expect(body.has('file')).toBe(true);
  });

  it('reuses the uploaded ref for the same local file', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ result: MEDIA_REF }),
    });
    const store = createMediaStore({
      kind: 'remote',
      booksId: 7,
      serverUrl: SERVER_URL,
      token: SERVER_TOKEN,
    });

    const first = await store.save({ uri: 'file:///tmp/photo.png' });
    const second = await store.save({ uri: 'file:///tmp/photo.png' });

    expect(first).toBe(MEDIA_REF);
    expect(second).toBe(MEDIA_REF);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('rejects unsupported remote image types before uploading', async () => {
    const store = createMediaStore({
      kind: 'remote',
      booksId: 7,
      serverUrl: SERVER_URL,
      token: SERVER_TOKEN,
    });

    await expect(
      store.save({
        uri: 'file:///tmp/animation.gif',
        mimeType: 'image/gif',
      }),
    ).rejects.toThrow('仅支持 JPG、PNG、WebP 图片');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not upload an existing server media URL again', async () => {
    const store = createMediaStore({
      kind: 'remote',
      booksId: 7,
      serverUrl: SERVER_URL,
      token: SERVER_TOKEN,
    });

    const ref = await store.save({
      uri: `http://host:3000/api/media/${MEDIA_KEY}`,
    });

    expect(ref).toBe(MEDIA_REF);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('persists local images and returns their file uri', async () => {
    pickerMock.__persistImage.mockResolvedValue({
      uri: 'file:///Documents/id/photo.jpg',
    });
    const store = createMediaStore({ kind: 'local', booksId: 1 });

    const ref = await store.save({
      uri: 'file:///tmp/photo.jpg',
      mimeType: 'image/jpeg',
      fileName: 'photo.jpg',
    });

    expect(ref).toBe('file:///Documents/id/photo.jpg');
    expect(pickerMock.__persistImage).toHaveBeenCalledWith(
      expect.objectContaining({
        uri: 'file:///tmp/photo.jpg',
        mimeType: 'image/jpeg',
        fileName: 'photo.jpg',
      }),
    );
  });

  it('resolves remote refs and keeps local refs unchanged', () => {
    const remote = createMediaStore({
      kind: 'remote',
      booksId: 7,
      serverUrl: SERVER_URL,
      token: SERVER_TOKEN,
    });
    const local = createMediaStore({ kind: 'local', booksId: 1 });

    expect(remote.resolveSource(MEDIA_REF)).toEqual({
      uri: `http://host:3000/api/media/${MEDIA_KEY}`,
      headers: { Authorization: `Bearer ${SERVER_TOKEN}` },
    });
    expect(
      remote.resolveSource(`http://host:3000/api/media/${MEDIA_KEY}`),
    ).toEqual({
      uri: `http://host:3000/api/media/${MEDIA_KEY}`,
      headers: { Authorization: `Bearer ${SERVER_TOKEN}` },
    });
    expect(remote.resolveSource('https://other-host/cover.png')).toEqual({
      uri: 'https://other-host/cover.png',
    });
    expect(remote.toRef(`http://host:3000/api/media/${MEDIA_KEY}`)).toBe(
      MEDIA_REF,
    );
    expect(local.resolveSource('file:///Documents/id/photo.jpg')).toEqual({
      uri: 'file:///Documents/id/photo.jpg',
    });
  });

  it('reads a remote media ref into a cached data url', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      blob: async () => ({}) as Blob,
    });
    const store = createMediaStore({
      kind: 'remote',
      booksId: 7,
      serverUrl: SERVER_URL,
      token: SERVER_TOKEN,
    });

    const first = await store.toDataUrl(MEDIA_REF);
    const second = await store.toDataUrl(MEDIA_REF);

    expect(first).toBe('data:image/png;base64,QUJD');
    expect(second).toBe(first);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      `http://host:3000/api/media/${MEDIA_KEY}`,
      expect.objectContaining({
        headers: { Authorization: `Bearer ${SERVER_TOKEN}` },
      }),
    );
  });

  it('reports a read failure when the media response is not ok', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: '媒体文件不存在' }),
    });
    const store = createMediaStore({
      kind: 'remote',
      booksId: 7,
      serverUrl: SERVER_URL,
      token: SERVER_TOKEN,
    });

    await expect(store.toDataUrl(MEDIA_REF)).rejects.toThrow(
      '图片读取失败（404）',
    );
  });

  it('passes data urls through without fetching', async () => {
    const store = createMediaStore({ kind: 'local', booksId: 1 });

    await expect(store.toDataUrl('data:image/png;base64,QUJD')).resolves.toBe(
      'data:image/png;base64,QUJD',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('surfaces upload errors from the server', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 413,
      json: async () => ({ error: '图片文件过大' }),
    });
    const store = createMediaStore({
      kind: 'remote',
      booksId: 7,
      serverUrl: SERVER_URL,
      token: SERVER_TOKEN,
    });

    await expect(
      store.save({ uri: 'file:///tmp/photo.png', mimeType: 'image/png' }),
    ).rejects.toThrow('图片文件过大');
  });
});
