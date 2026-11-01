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

const bookSchema = z.object({
  key: z.string().min(1),
  name: z.string(),
  counts: countsSchema,
  recordRange: z.tuple([z.number(), z.number()]).nullable(),
});

const manifestSchema = z.object({
  format: z.literal(SNAPSHOT_FORMAT),
  formatVersion: z.number().int().positive(),
  appVersion: z.string(),
  createdAt: z.number().int().nonnegative(),
  scope: z.enum(['book', 'library']),
  books: z.array(bookSchema).min(1),
  media: z.object({
    count: z.number().int().nonnegative(),
    totalBytes: z.number().int().nonnegative(),
  }),
  options: z.object({
    includeImages: z.boolean(),
    includeAgent: z.boolean(),
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
  const keys = new Set<string>();
  for (const book of result.data.books) {
    if (keys.has(book.key)) {
      throw new Error(`备份清单存在重复账本: ${book.key}`);
    }
    keys.add(book.key);
  }
  return result.data;
}
