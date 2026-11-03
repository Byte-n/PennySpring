import { z } from 'zod';

import {
  SNAPSHOT_FORMAT,
  SNAPSHOT_FORMAT_VERSION,
  type SnapshotManifest,
} from './types';

const countsSchema = z.object({
  types: z.number().int().nonnegative(),
  assets: z.number().int().nonnegative(),
  tags: z.number().int().nonnegative(),
  records: z.number().int().nonnegative(),
  recordRelations: z.number().int().nonnegative(),
  tagRelations: z.number().int().nonnegative(),
  images: z.number().int().nonnegative(),
  quickTemplates: z.number().int().nonnegative(),
  agentThreads: z.number().int().nonnegative(),
  agentMessages: z.number().int().nonnegative(),
});

const bookOptionsSchema = z.object({
  includeImages: z.boolean(),
  includeAgent: z.boolean(),
  includeAiConfig: z.boolean(),
});

const bookSchema = z.object({
  key: z.string().min(1),
  name: z.string(),
  counts: countsSchema,
  recordRange: z.tuple([z.number(), z.number()]).nullable(),
  options: bookOptionsSchema.optional(),
});

const manifestSchema = z.object({
  format: z.literal(SNAPSHOT_FORMAT),
  formatVersion: z.number().int().positive(),
  appVersion: z.string(),
  createdAt: z.number().int().nonnegative(),
  scope: z.enum(['book', 'library']),
  books: z.array(bookSchema),
  media: z.object({
    count: z.number().int().nonnegative(),
    totalBytes: z.number().int().nonnegative(),
  }),
  options: z.object({
    // v1 把图片与 AI 会话放在全局；读取后下放到每本账本
    includeImages: z.boolean().optional(),
    includeAgent: z.boolean().optional(),
    includeSettings: z.boolean().default(false),
    includeNetworkBooks: z.boolean().default(false),
  }),
});

export function parseSnapshotManifest(value: unknown): SnapshotManifest {
  const result = manifestSchema.safeParse(value);
  if (!result.success) {
    throw new Error(
      `备份清单格式不正确: ${result.error.issues[0]?.message ?? '未知错误'}`,
    );
  }
  if (result.data.formatVersion > SNAPSHOT_FORMAT_VERSION) {
    throw new Error('备份版本过高，请升级 PennySpring 后再导入');
  }

  const books = result.data.books.map(book => ({
    ...book,
    options: book.options ?? {
      includeImages: result.data.options.includeImages ?? true,
      includeAgent: result.data.options.includeAgent ?? false,
      includeAiConfig: false,
    },
  }));
  const options = {
    includeSettings: result.data.options.includeSettings,
    includeNetworkBooks: result.data.options.includeNetworkBooks,
  };
  if (
    books.length === 0 &&
    !options.includeSettings &&
    !options.includeNetworkBooks
  ) {
    throw new Error('备份清单格式不正确: 至少包含一项内容');
  }

  const keys = new Set<string>();
  for (const book of books) {
    if (keys.has(book.key)) {
      throw new Error(`备份清单存在重复账本: ${book.key}`);
    }
    keys.add(book.key);
  }

  return {
    format: result.data.format,
    formatVersion: result.data.formatVersion,
    appVersion: result.data.appVersion,
    createdAt: result.data.createdAt,
    scope: result.data.scope,
    books,
    media: result.data.media,
    options,
  };
}
