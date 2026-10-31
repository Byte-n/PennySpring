import type { SnapshotCounts } from '@pennyspring/api'

import type { SnapshotManifest } from './types'

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`
  }
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function totalRecords(manifest: SnapshotManifest): number {
  return manifest.books.reduce((sum, book) => sum + book.counts.records, 0)
}

export function totalCounts(manifest: SnapshotManifest): SnapshotCounts {
  return manifest.books.reduce<SnapshotCounts>(
    (sum, book) => ({
      types: sum.types + book.counts.types,
      assets: sum.assets + book.counts.assets,
      tags: sum.tags + book.counts.tags,
      records: sum.records + book.counts.records,
      recordRelations: sum.recordRelations + book.counts.recordRelations,
      tagRelations: sum.tagRelations + book.counts.tagRelations,
      images: sum.images + book.counts.images,
      quickTemplates: sum.quickTemplates + book.counts.quickTemplates,
      agentThreads: sum.agentThreads + book.counts.agentThreads,
      agentMessages: sum.agentMessages + book.counts.agentMessages,
    }),
    {
      types: 0,
      assets: 0,
      tags: 0,
      records: 0,
      recordRelations: 0,
      tagRelations: 0,
      images: 0,
      quickTemplates: 0,
      agentThreads: 0,
      agentMessages: 0,
    },
  )
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function sanitizeFileNamePart(value: string): string {
  return value.replace(/[\\/:*?"<>|]/g, '_').trim() || '账本'
}

export function createPackageFileName(manifest: SnapshotManifest): string {
  const base = manifest.books.length === 1
    ? sanitizeFileNamePart(manifest.books[0]?.name ?? '账本')
    : 'PennySpring_备份'
  return `${base}_${formatDate(new Date(manifest.createdAt))}.psb`
}
