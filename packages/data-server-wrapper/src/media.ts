import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { Api } from '@pennyspring/data';
import type { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';

const MAX_MEDIA_BYTES = 10 * 1024 * 1024;
const MAX_UPLOAD_BODY_BYTES = MAX_MEDIA_BYTES + 1024 * 1024;
const MEDIA_FILE_NAME_PATTERN = /^[0-9a-f-]+\.(?:jpg|png|webp)$/;

const EXTENSION_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

type ImageExtension = 'jpg' | 'png' | 'webp';

function detectImageExtension(bytes: Uint8Array): ImageExtension | null {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return 'jpg';
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'png';
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'webp';
  }
  return null;
}

export function registerMediaRoutes(
  app: Hono,
  api: Api,
  mediaDir: string | undefined,
): void {
  app.post(
    '/api/media/upload',
    bodyLimit({
      maxSize: MAX_UPLOAD_BODY_BYTES,
      onError: c => c.json({ error: '请求体过大' }, 413),
    }),
    async c => {
      if (!mediaDir) {
        return c.json({ error: '媒体目录未配置' }, 503);
      }

      let body: Record<string, string | File>;
      try {
        body = await c.req.parseBody();
      } catch {
        return c.json({ error: '请求体格式不正确' }, 400);
      }

      const booksIdRaw = body.booksId;
      if (typeof booksIdRaw !== 'string' || !/^\d+$/.test(booksIdRaw)) {
        return c.json({ error: 'booksId 不正确' }, 400);
      }
      const booksId = Number(booksIdRaw);
      if (!Number.isSafeInteger(booksId) || booksId <= 0) {
        return c.json({ error: 'booksId 不正确' }, 400);
      }

      const file = body.file;
      if (!file || typeof file === 'string') {
        return c.json({ error: '缺少图片文件' }, 400);
      }
      if (file.size <= 0) {
        return c.json({ error: '图片文件不能为空' }, 400);
      }
      if (file.size > MAX_MEDIA_BYTES) {
        return c.json({ error: '图片文件过大' }, 413);
      }

      const declaredMime = file.type.trim().toLowerCase();
      const declaredExtension = declaredMime
        ? EXTENSION_BY_MIME[declaredMime]
        : undefined;
      if (declaredMime && !declaredExtension) {
        return c.json({ error: '不支持的图片类型' }, 400);
      }

      const bytes = new Uint8Array(await file.arrayBuffer());
      const detectedExtension = detectImageExtension(bytes);
      if (!detectedExtension) {
        return c.json({ error: '不支持的图片类型' }, 400);
      }
      if (declaredExtension && declaredExtension !== detectedExtension) {
        return c.json({ error: '图片类型与内容不匹配' }, 400);
      }

      try {
        await api.book.getById(booksId);
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        if (message.includes('账本不存在')) {
          return c.json({ error: '账本不存在' }, 404);
        }
        return c.json({ error: '检查账本失败' }, 500);
      }

      const fileName = `${randomUUID()}.${detectedExtension}`;
      try {
        await mkdir(mediaDir, { recursive: true });
        await writeFile(path.join(mediaDir, fileName), Buffer.from(bytes));
      } catch {
        return c.json({ error: '保存图片失败' }, 500);
      }

      return c.json({ result: `media:${fileName}` });
    },
  );

  app.get('/api/media/:fileName', async c => {
    if (!mediaDir) {
      return c.json({ error: '媒体目录未配置' }, 503);
    }

    const fileName = c.req.param('fileName');
    if (!MEDIA_FILE_NAME_PATTERN.test(fileName)) {
      return c.json({ error: '媒体文件名不正确' }, 400);
    }

    const extension = fileName.slice(fileName.lastIndexOf('.') + 1);
    try {
      const data = await readFile(path.join(mediaDir, fileName));
      return c.newResponse(
        new Uint8Array(data.buffer, data.byteOffset, data.byteLength),
        200,
        {
          'Content-Type':
            MIME_BY_EXTENSION[extension] ?? 'application/octet-stream',
          'Cache-Control': 'private, max-age=31536000, immutable',
          'X-Content-Type-Options': 'nosniff',
        },
      );
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return c.json({ error: '媒体文件不存在' }, 404);
      }
      return c.json({ error: '读取媒体文件失败' }, 500);
    }
  });
}
