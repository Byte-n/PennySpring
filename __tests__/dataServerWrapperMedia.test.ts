import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import type { Api } from '@pennyspring/data'

import { createServer } from '../packages/data-server-wrapper/src/server'

const PNG_BYTES = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
])
const WEBP_BYTES = Buffer.from([
  0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
])
const MAX_MEDIA_BYTES = 10 * 1024 * 1024

type App = ReturnType<typeof createServer>

function createApi(bookExists = true): Api {
  return {
    book: {
      getById: jest.fn(async (id: number) => {
        if (!bookExists) {
          throw new Error(`账本不存在: ${id}`)
        }
        return { id, name: '账本', description: '', background: '' }
      }),
    },
  } as unknown as Api
}

function createUploadForm(
  options: {
    booksId?: string
    bytes?: Buffer
    type?: string
    name?: string
  } = {},
): FormData {
  const form = new FormData()
  form.append('booksId', options.booksId ?? '1')
  form.append(
    'file',
    new File(
      [new Uint8Array(options.bytes ?? PNG_BYTES)],
      options.name ?? 'photo.png',
      {
        type: options.type ?? 'image/png',
      },
    ),
  )
  return form
}

async function upload(app: App, form: FormData): Promise<Response> {
  return app.request('/api/media/upload', { method: 'POST', body: form })
}

describe('data-server media routes', () => {
  let mediaDir: string

  beforeEach(() => {
    mediaDir = mkdtempSync(path.join(os.tmpdir(), 'pennyspring-media-'))
  })

  afterEach(() => {
    rmSync(mediaDir, { recursive: true, force: true })
  })

  it('stores uploaded files with an opaque ref and serves them back', async () => {
    const app = createServer(createApi(), { mediaDir })

    const response = await upload(app, createUploadForm())

    expect(response.status).toBe(200)
    const body = (await response.json()) as { result: string }
    expect(body.result).toMatch(/^media:[0-9a-f-]+\.png$/)

    const fileName = body.result.slice('media:'.length)
    expect(readFileSync(path.join(mediaDir, fileName))).toEqual(PNG_BYTES)

    const fetched = await app.request(`/api/media/${fileName}`)
    expect(fetched.status).toBe(200)
    expect(fetched.headers.get('content-type')).toBe('image/png')
    expect(fetched.headers.get('cache-control')).toContain('immutable')
    expect(fetched.headers.get('x-content-type-options')).toBe('nosniff')
    expect(Buffer.from(await fetched.arrayBuffer())).toEqual(PNG_BYTES)
  })

  it('accepts webp images', async () => {
    const app = createServer(createApi(), { mediaDir })

    const response = await upload(
      app,
      createUploadForm({
        bytes: WEBP_BYTES,
        name: 'photo.webp',
        type: 'image/webp',
      }),
    )

    expect(response.status).toBe(200)
    const body = (await response.json()) as { result: string }
    expect(body.result).toMatch(/^media:[0-9a-f-]+\.webp$/)
    const fileName = body.result.slice('media:'.length)
    const fetched = await app.request(`/api/media/${fileName}`)
    expect(fetched.headers.get('content-type')).toBe('image/webp')
  })

  it('returns 404 for a media file that does not exist', async () => {
    const app = createServer(createApi(), { mediaDir })

    const response = await app.request(
      '/api/media/123e4567-e89b-12d3-a456-426614174000.png',
    )

    expect(response.status).toBe(404)
  })

  it('rejects path traversal and malformed media names', async () => {
    const app = createServer(createApi(), { mediaDir })

    const traversal = await app.request('/api/media/..%2Fsecret.png')
    expect(traversal.status).toBe(400)

    const malformed = await app.request('/api/media/not-a-media-name.txt')
    expect(malformed.status).toBe(400)
  })

  it('rejects unsupported image types', async () => {
    const app = createServer(createApi(), { mediaDir })

    const response = await upload(
      app,
      createUploadForm({ name: 'note.txt', type: 'text/plain' }),
    )

    expect(response.status).toBe(400)
  })

  it('rejects bytes that do not match the declared image type', async () => {
    const app = createServer(createApi(), { mediaDir })

    const notAnImage = await upload(
      app,
      createUploadForm({
        bytes: Buffer.from('not an image'),
        type: 'image/png',
      }),
    )
    expect(notAnImage.status).toBe(400)

    const mismatched = await upload(
      app,
      createUploadForm({ bytes: PNG_BYTES, type: 'image/jpeg' }),
    )
    expect(mismatched.status).toBe(400)
  })

  it('rejects an empty image file', async () => {
    const app = createServer(createApi(), { mediaDir })

    const response = await upload(
      app,
      createUploadForm({ bytes: Buffer.alloc(0) }),
    )

    expect(response.status).toBe(400)
  })

  it('rejects an invalid or missing book', async () => {
    const app = createServer(createApi(false), { mediaDir })

    const invalidId = await upload(app, createUploadForm({ booksId: 'abc' }))
    expect(invalidId.status).toBe(400)

    const missingBook = await upload(app, createUploadForm({ booksId: '999' }))
    expect(missingBook.status).toBe(404)
  })

  it('does not turn an unexpected book lookup failure into 404', async () => {
    const api = {
      book: {
        getById: jest.fn(async () => {
          throw new Error('database down')
        }),
      },
    } as unknown as Api
    const app = createServer(api, { mediaDir })

    const response = await upload(app, createUploadForm())

    expect(response.status).toBe(500)
  })

  it('rejects files above the size limit', async () => {
    const app = createServer(createApi(), { mediaDir })

    const response = await upload(
      app,
      createUploadForm({ bytes: Buffer.alloc(MAX_MEDIA_BYTES + 1) }),
    )

    expect(response.status).toBe(413)
  })

  it('rejects an oversized multipart body before parsing it', async () => {
    const app = createServer(createApi(), { mediaDir })

    const response = await upload(
      app,
      createUploadForm({ bytes: Buffer.alloc(MAX_MEDIA_BYTES + 2 * 1024 * 1024) }),
    )

    expect(response.status).toBe(413)
    expect(await response.json()).toEqual({ error: '请求体过大' })
  })

  it('returns 503 when no media directory is configured', async () => {
    const app = createServer(createApi())

    const response = await upload(app, createUploadForm())
    expect(response.status).toBe(503)

    const fetched = await app.request('/api/media/anything.png')
    expect(fetched.status).toBe(503)
  })
})
