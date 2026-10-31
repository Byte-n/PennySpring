import { fromByteArray, toByteArray } from 'base64-js'
import { strFromU8, strToU8 } from 'fflate'

import { unzipFiles, zipFiles } from './zip'

import type {
  AgentMessageRow,
  BookSnapshot,
  LibrarySnapshot,
  SnapshotCounts,
  SnapshotIdMaps,
} from '@pennyspring/api'

import {
  collectAgentMessageMediaRefs,
  rewriteAgentMessageIds,
  rewriteAgentMessageMedia,
} from './agentMessages'
import { parseSnapshotManifest } from './manifest'
import {
  base64ByteLength,
  getMediaKey,
  inferExtensionFromMimeType,
  inferExtensionFromUri,
  inferMimeTypeFromUri,
  isDataUrl,
  isExternalHttpUrl,
  isLocalFileUri,
  isMediaRef,
  parseDataUrl,
  toMediaRef,
} from './media'
import {
  SNAPSHOT_FORMAT,
  SNAPSHOT_FORMAT_VERSION,
  type BuildSnapshotPackageOptions,
  type BuiltSnapshotPackage,
  type ParsedSnapshotPackage,
  type PreparedSnapshotImport,
  type SnapshotManifest,
  type SnapshotPackageFiles,
  type TransferFileSystem,
} from './types'

const DEFAULT_APP_VERSION = '0.0.1'

interface MediaEntry {
  key: string
  base64: string
  mimeType: string
  bytes: number
}

function cloneBook(book: BookSnapshot): BookSnapshot {
  return JSON.parse(JSON.stringify(book)) as BookSnapshot
}

function cloneLibrary(library: LibrarySnapshot): LibrarySnapshot {
  return { books: library.books.map(cloneBook) }
}

function countsOf(book: BookSnapshot): SnapshotCounts {
  return {
    types: book.types.length,
    assets: book.assets.length,
    tags: book.tags.length,
    records: book.records.length,
    recordRelations: book.recordRelations.length,
    tagRelations: book.tagRelations.length,
    images: book.images.length,
    quickTemplates: book.quickTemplates.length,
    agentThreads: book.agentThreads.length,
    agentMessages: book.agentMessages.length,
  }
}

function recordRangeOf(book: BookSnapshot): [number, number] | null {
  if (book.records.length === 0) return null
  let min = book.records[0]!.recordTime
  let max = book.records[0]!.recordTime
  for (const record of book.records) {
    if (record.recordTime < min) min = record.recordTime
    if (record.recordTime > max) max = record.recordTime
  }
  return [min, max]
}

function addMediaEntry(
  entries: Map<string, MediaEntry>,
  ref: string,
  base64: string,
  mimeType: string,
): MediaEntry {
  const existing = entries.get(ref)
  if (existing) return existing
  const extension = isDataUrl(ref)
    ? inferExtensionFromMimeType(mimeType)
    : inferExtensionFromUri(ref)
  const entry = {
    key: `m${entries.size + 1}.${extension}`,
    base64,
    mimeType,
    bytes: base64ByteLength(base64),
  }
  entries.set(ref, entry)
  return entry
}

async function collectMediaEntries(
  library: LibrarySnapshot,
  options: BuildSnapshotPackageOptions,
  fileSystem: TransferFileSystem,
): Promise<Map<string, MediaEntry>> {
  const refs = new Set<string>()
  for (const book of library.books) {
    if (options.includeImages) {
      if (book.book.background) refs.add(book.book.background)
      for (const image of book.images) refs.add(image.imagePath)
    }
    if (options.includeAgent) {
      for (const message of book.agentMessages) {
        for (const ref of collectAgentMessageMediaRefs(message.message)) {
          refs.add(ref)
        }
      }
    }
  }

  const entries = new Map<string, MediaEntry>()
  for (const ref of refs) {
    if (isExternalHttpUrl(ref)) {
      continue
    }
    if (isMediaRef(ref)) {
      throw new Error(`本地账本不支持远程媒体引用: ${ref}`)
    }
    if (isDataUrl(ref)) {
      const parsed = parseDataUrl(ref)
      if (!parsed) throw new Error('AI 消息中的图片格式不支持')
      addMediaEntry(entries, ref, parsed.base64, parsed.mimeType)
      continue
    }
    if (!isLocalFileUri(ref)) {
      continue
    }
    const base64 = await fileSystem.readBase64(ref)
    addMediaEntry(entries, ref, base64, inferMimeTypeFromUri(ref))
  }
  return entries
}

function createMediaResolver(entries: Map<string, MediaEntry>) {
  return (value: string): string | undefined => {
    const entry = entries.get(value)
    if (entry) return toMediaRef(entry.key)
    if (isExternalHttpUrl(value)) return value
    return undefined
  }
}

function writeJson(files: SnapshotPackageFiles, path: string, value: unknown): void {
  files[path] = strToU8(JSON.stringify(value))
}

export async function buildSnapshotPackage(
  library: LibrarySnapshot,
  options: BuildSnapshotPackageOptions,
  fileSystem: TransferFileSystem,
): Promise<BuiltSnapshotPackage> {
  if (library.books.length === 0) {
    throw new Error('至少选择一个账本')
  }

  const books = cloneLibrary(library).books
  const mediaEntries = await collectMediaEntries({ books }, options, fileSystem)
  const resolveMedia = createMediaResolver(mediaEntries)
  const files: SnapshotPackageFiles = {}
  const manifestBooks = []

  for (const [index, book] of books.entries()) {
    const key = `b${index + 1}`

    if (options.includeImages) {
      if (book.book.background) {
        book.book.background = resolveMedia(book.book.background) ?? book.book.background
      }
      book.images = book.images.map(image => ({
        ...image,
        imagePath: resolveMedia(image.imagePath) ?? image.imagePath,
      }))
    } else {
      book.book.background = ''
      book.images = []
    }

    if (options.includeAgent) {
      book.agentMessages = book.agentMessages.map(message => ({
        ...message,
        message: rewriteAgentMessageMedia(message.message, resolveMedia, 'export'),
      }))
    } else {
      book.agentThreads = []
      book.agentMessages = []
    }

    writeJson(files, `books/${key}/book.json`, book.book)
    writeJson(files, `books/${key}/types.json`, book.types)
    writeJson(files, `books/${key}/assets.json`, book.assets)
    writeJson(files, `books/${key}/tags.json`, book.tags)
    writeJson(files, `books/${key}/records.json`, book.records)
    writeJson(files, `books/${key}/record-relations.json`, book.recordRelations)
    writeJson(files, `books/${key}/tag-relations.json`, book.tagRelations)
    writeJson(files, `books/${key}/images.json`, book.images)
    writeJson(files, `books/${key}/quick-templates.json`, book.quickTemplates)
    writeJson(files, `books/${key}/agent-threads.json`, book.agentThreads)
    writeJson(files, `books/${key}/agent-messages.json`, book.agentMessages)

    manifestBooks.push({
      key,
      name: book.book.name,
      counts: countsOf(book),
      recordRange: recordRangeOf(book),
    })
  }

  for (const entry of mediaEntries.values()) {
    files[`media/${entry.key}`] = toByteArray(entry.base64)
  }

  const manifest: SnapshotManifest = {
    format: SNAPSHOT_FORMAT,
    formatVersion: SNAPSHOT_FORMAT_VERSION,
    appVersion: options.appVersion ?? DEFAULT_APP_VERSION,
    createdAt: options.createdAt ?? Date.now(),
    scope: books.length === 1 ? 'book' as const : 'library' as const,
    books: manifestBooks,
    media: {
      count: mediaEntries.size,
      totalBytes: Array.from(mediaEntries.values()).reduce((sum, entry) => sum + entry.bytes, 0),
    },
    options: {
      includeImages: options.includeImages,
      includeAgent: options.includeAgent,
    },
  }

  writeJson(files, 'manifest.json', manifest)
  return { manifest, files }
}

export function zipSnapshotPackage(files: SnapshotPackageFiles): Promise<Uint8Array> {
  return zipFiles(files)
}

export function unzipSnapshotPackage(data: Uint8Array): Promise<SnapshotPackageFiles> {
  return unzipFiles(data)
}

function readJson(files: SnapshotPackageFiles, path: string): unknown {
  const file = files[path]
  if (!file) throw new Error(`备份缺少文件: ${path}`)
  try {
    return JSON.parse(strFromU8(file))
  } catch {
    throw new Error(`备份文件格式不正确: ${path}`)
  }
}

function readArray<T>(files: SnapshotPackageFiles, path: string): T[] {
  const value = readJson(files, path)
  if (!Array.isArray(value)) {
    throw new Error(`备份文件格式不正确: ${path}`)
  }
  return value as T[]
}

export async function parseSnapshotPackage(
  data: Uint8Array,
): Promise<ParsedSnapshotPackage> {
  const files = await unzipSnapshotPackage(data)
  const manifest = parseSnapshotManifest(readJson(files, 'manifest.json'))
  const mediaFiles: Record<string, Uint8Array> = {}

  for (const path of Object.keys(files)) {
    if (!path.startsWith('media/')) continue
    const key = path.slice('media/'.length)
    if (!key || key.includes('/') || key.includes('..')) {
      throw new Error('备份媒体路径不正确')
    }
    mediaFiles[key] = files[path]!
  }

  const books: BookSnapshot[] = manifest.books.map(book => {
    const base = `books/${book.key}`
    const bookRow = readJson(files, `${base}/book.json`)
    if (typeof bookRow !== 'object' || bookRow === null) {
      throw new Error(`备份账本格式不正确: ${book.key}`)
    }
    return {
      book: bookRow as BookSnapshot['book'],
      types: readArray(files, `${base}/types.json`),
      assets: readArray(files, `${base}/assets.json`),
      tags: readArray(files, `${base}/tags.json`),
      records: readArray(files, `${base}/records.json`),
      recordRelations: readArray(files, `${base}/record-relations.json`),
      tagRelations: readArray(files, `${base}/tag-relations.json`),
      images: readArray(files, `${base}/images.json`),
      quickTemplates: readArray(files, `${base}/quick-templates.json`),
      agentThreads: readArray(files, `${base}/agent-threads.json`),
      agentMessages: readArray(files, `${base}/agent-messages.json`),
    }
  })

  for (const book of books) {
    const refs = new Set<string>()
    if (book.book.background) refs.add(book.book.background)
    for (const image of book.images) refs.add(image.imagePath)
    for (const message of book.agentMessages) {
      for (const ref of collectAgentMessageMediaRefs(message.message)) refs.add(ref)
    }
    for (const ref of refs) {
      const key = getMediaKey(ref)
      if (key && !mediaFiles[key]) {
        throw new Error(`备份缺少媒体文件: ${key}`)
      }
    }
  }

  return { manifest, library: { books }, mediaFiles }
}

function createImportMediaResolver(mediaUris: Map<string, string>) {
  return (value: string): string | undefined => {
    const key = getMediaKey(value)
    return key ? mediaUris.get(key) : undefined
  }
}

export async function prepareImportedLibrary(
  parsed: ParsedSnapshotPackage,
  fileSystem: TransferFileSystem,
): Promise<PreparedSnapshotImport> {
  const mediaUris: string[] = []
  const mediaMap = new Map<string, string>()
  const importId = Date.now()

  try {
    for (const [index, [key, bytes]] of Object.entries(parsed.mediaFiles).entries()) {
      const extension = key.split('.').pop() || 'bin'
      const uri = await fileSystem.writeBase64ToDocuments(
        `ps-import-${importId}-${index}.${extension}`,
        fromByteArray(bytes),
      )
      mediaUris.push(uri)
      mediaMap.set(key, uri)
    }

    const library = cloneLibrary(parsed.library)
    const resolveMedia = createImportMediaResolver(mediaMap)
    for (const book of library.books) {
      if (book.book.background) {
        book.book.background = resolveMedia(book.book.background) ?? book.book.background
      }
      book.images = book.images.map(image => {
        const next = resolveMedia(image.imagePath)
        if (!next) throw new Error(`备份缺少媒体文件: ${image.imagePath}`)
        return { ...image, imagePath: next }
      })
      book.agentMessages = book.agentMessages.map(message => ({
        ...message,
        message: rewriteAgentMessageMedia(message.message, resolveMedia, 'import'),
      }))
    }
    return { library, mediaUris }
  } catch (error) {
    await cleanupImportedMedia(mediaUris, fileSystem)
    throw error
  }
}

export async function cleanupImportedMedia(
  mediaUris: string[],
  fileSystem: TransferFileSystem,
): Promise<void> {
  for (const uri of mediaUris) {
    try {
      await fileSystem.delete(uri)
    } catch {
      // Best-effort cleanup; a failed delete must not mask the import error.
    }
  }
}

export function createAgentMessageIdMapper() {
  return (message: AgentMessageRow, maps: SnapshotIdMaps): AgentMessageRow => ({
    ...message,
    message: rewriteAgentMessageIds(message.message, maps),
  })
}
