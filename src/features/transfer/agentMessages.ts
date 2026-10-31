import type { SnapshotIdMaps } from '@pennyspring/api'

import { collectMediaRefsFromJsonString, isMediaRef } from './media'
import type { MediaStringResolver } from './types'

type JsonRecord = Record<string, unknown>

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function collectAgentMessageMediaRefs(messageJson: string): Set<string> {
  return collectMediaRefsFromJsonString(messageJson)
}

export function rewriteAgentMessageMedia(
  messageJson: string,
  resolver: MediaStringResolver,
  mode: 'export' | 'import',
): string {
  let parsed: unknown
  try {
    parsed = JSON.parse(messageJson)
  } catch {
    throw new Error('AI 消息格式不正确')
  }

  const rewritten = rewriteValueWithAttachments(parsed, resolver, mode)
  return JSON.stringify(rewritten)
}

function rewriteValueWithAttachments(
  value: unknown,
  resolver: MediaStringResolver,
  mode: 'export' | 'import',
): unknown {
  if (typeof value === 'string') {
    return resolver(value) ?? value
  }
  if (Array.isArray(value)) {
    return value.map(item => rewriteValueWithAttachments(item, resolver, mode))
  }
  if (!isRecord(value)) {
    return value
  }

  const result: JsonRecord = {}
  for (const [key, item] of Object.entries(value)) {
    if (key === 'metadata' && isRecord(item) && Array.isArray(item.attachments)) {
      const metadata = rewriteValueWithAttachments(item, resolver, mode)
      if (!isRecord(metadata)) {
        result[key] = metadata
        continue
      }
      result[key] = {
        ...metadata,
        attachments: item.attachments.map(attachment => {
          if (!isRecord(attachment)) return attachment
          const originalRef = typeof attachment.ref === 'string' ? attachment.ref : null
          const resolvedRef = originalRef ? resolver(originalRef) : undefined
          const rewritten = rewriteValueWithAttachments(attachment, resolver, mode)
          if (!isRecord(rewritten)) return rewritten
          if (mode === 'export') {
            const rest = { ...rewritten }
            delete rest.localPath
            return rest
          }
          if (resolvedRef && originalRef && isMediaRef(originalRef)) {
            return { ...rewritten, ref: resolvedRef, localPath: resolvedRef }
          }
          return rewritten
        }),
      }
      continue
    }
    result[key] = rewriteValueWithAttachments(item, resolver, mode)
  }
  return result
}

const SINGLE_ID_KEYS: Record<string, keyof SnapshotIdMaps> = {
  recordId: 'records',
  typeId: 'types',
  assetId: 'assets',
  intoAssetId: 'assets',
  threadId: 'threads',
}

const ARRAY_ID_KEYS: Record<string, keyof SnapshotIdMaps> = {
  tagIds: 'tags',
  relatedRecordIds: 'records',
}

function mapId(value: unknown, maps: SnapshotIdMaps, key: keyof SnapshotIdMaps): unknown {
  if (typeof value !== 'number') return value
  return maps[key].get(value) ?? value
}

function rewriteIds(value: unknown, maps: SnapshotIdMaps): unknown {
  if (Array.isArray(value)) {
    return value.map(item => rewriteIds(item, maps))
  }
  if (!isRecord(value)) {
    return value
  }

  const result: JsonRecord = {}
  for (const [key, item] of Object.entries(value)) {
    const singleKey = SINGLE_ID_KEYS[key]
    if (singleKey && typeof item === 'number') {
      result[key] = mapId(item, maps, singleKey)
      continue
    }
    const arrayKey = ARRAY_ID_KEYS[key]
    if (arrayKey && Array.isArray(item)) {
      result[key] = item.map(entry => mapId(entry, maps, arrayKey))
      continue
    }
    result[key] = rewriteIds(item, maps)
  }
  return result
}

export function rewriteAgentMessageIds(
  messageJson: string,
  maps: SnapshotIdMaps,
): string {
  let parsed: unknown
  try {
    parsed = JSON.parse(messageJson)
  } catch {
    throw new Error('AI 消息格式不正确')
  }
  return JSON.stringify(rewriteIds(parsed, maps))
}
