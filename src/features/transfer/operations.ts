import type {
  AiConfigSnapshot,
  ApplyLibrarySnapshotResult,
  LibrarySnapshot,
} from '@pennyspring/api';
import { localApi } from '@pennyspring/api';

import { useSyncVersionStore } from '../../stores/syncVersionStore';
import {
  buildSettingsSnapshot,
  applySettingsPackage,
} from './settingsOperations';
import {
  applyNetworkBooksSnapshot,
  getNetworkBooksSnapshot,
} from './networkBooksOperations';
import {
  buildSnapshotPackage,
  cleanupImportedMedia,
  createAgentMessageIdMapper,
  parseSnapshotPackage,
  prepareImportedLibrary,
  zipSnapshotPackage,
} from './package';
import { nativeTransferFileSystem } from './nativeFileSystem';
import { pickPackageFile, savePackageFile } from './packageFiles';
import { createPackageFileName } from './summary';
import type {
  BookContentOptions,
  ParsedSnapshotPackage,
  SnapshotManifest,
} from './types';
import type { NetworkBookMergeResult } from './networkBooks';

export interface ExportBooksRequest {
  bookIds: number[];
  bookOptions: Record<number, BookContentOptions>;
  includeSettings: boolean;
  includeNetworkBooks: boolean;
}

export interface ExportPackageResult {
  fileName: string;
  manifest: SnapshotManifest;
  sizeBytes: number;
  zip: Uint8Array;
}

export interface SavedExportResult extends ExportPackageResult {
  savedUri: string;
}

export interface PickedPackagePreview {
  sourceName: string;
  sizeBytes: number;
  parsed: ParsedSnapshotPackage;
}

export interface ImportPackageResult {
  mediaUris: string[];
  result: ApplyLibrarySnapshotResult;
}

export interface AppliedImportedContent {
  aiConfigsApplied: number;
  settingsApplied: boolean;
  networkBooks: NetworkBookMergeResult | null;
}

async function buildAiConfigs(
  bookIds: number[],
  bookOptions: Record<number, BookContentOptions>,
): Promise<Record<number, AiConfigSnapshot>> {
  const aiConfigs: Record<number, AiConfigSnapshot> = {};
  await Promise.all(
    bookIds.map(async bookId => {
      const options = bookOptions[bookId];
      if (!options) {
        throw new Error(`缺少账本内容选项: ${bookId}`);
      }
      if (!options.includeAiConfig) return;
      aiConfigs[bookId] = await localApi.agentConfig.exportConfig(bookId);
    }),
  );
  return aiConfigs;
}

export async function buildExportPackage(
  request: ExportBooksRequest,
): Promise<ExportPackageResult> {
  if (
    request.bookIds.length === 0 &&
    !request.includeSettings &&
    !request.includeNetworkBooks
  ) {
    throw new Error('至少选择一项内容');
  }

  const includeAgent = request.bookIds.some(
    bookId => request.bookOptions[bookId]?.includeAgent ?? false,
  );
  const library: LibrarySnapshot =
    request.bookIds.length > 0
      ? await localApi.transfer.exportLibrary(request.bookIds, {
          includeAgent,
        })
      : { books: [] };
  const aiConfigs = await buildAiConfigs(request.bookIds, request.bookOptions);
  const settings = request.includeSettings
    ? buildSettingsSnapshot()
    : undefined;
  const networkBooks = request.includeNetworkBooks
    ? getNetworkBooksSnapshot()
    : undefined;
  const built = await buildSnapshotPackage(
    library,
    {
      bookOptions: request.bookOptions,
      aiConfigs,
      settings,
      networkBooks,
    },
    nativeTransferFileSystem,
  );
  const zip = await zipSnapshotPackage(built.files);
  return {
    fileName: createPackageFileName(built.manifest),
    manifest: built.manifest,
    sizeBytes: zip.byteLength,
    zip,
  };
}

export async function exportBooksToFile(
  request: ExportBooksRequest,
): Promise<SavedExportResult> {
  const pkg = await buildExportPackage(request);
  const savedUri = await savePackageFile(pkg.zip, pkg.fileName);
  return { ...pkg, savedUri };
}

export async function pickPackagePreview(): Promise<PickedPackagePreview | null> {
  const picked = await pickPackageFile();
  if (!picked) return null;
  const parsed = await parseSnapshotPackage(picked.bytes);
  return {
    sourceName: picked.name,
    sizeBytes: picked.bytes.byteLength,
    parsed,
  };
}

export async function importPackage(
  parsed: ParsedSnapshotPackage,
  options: { bookName?: string } = {},
): Promise<ImportPackageResult> {
  const prepared = await prepareImportedLibrary(
    parsed,
    nativeTransferFileSystem,
  );
  try {
    if (prepared.library.books.length === 0) {
      return { mediaUris: prepared.mediaUris, result: { books: [] } };
    }
    const result = await localApi.transfer.importLibrary(prepared.library, {
      bookName: options.bookName,
      mapAgentMessage: createAgentMessageIdMapper(),
    });
    return { mediaUris: prepared.mediaUris, result };
  } catch (error) {
    await cleanupImportedMedia(prepared.mediaUris, nativeTransferFileSystem);
    throw error;
  }
}

export async function applyImportedPackageContent(
  parsed: ParsedSnapshotPackage,
  result: ApplyLibrarySnapshotResult,
): Promise<AppliedImportedContent> {
  let aiConfigsApplied = 0;
  for (const [index, book] of parsed.manifest.books.entries()) {
    const aiConfig = parsed.bookAiConfigs[book.key];
    const bookId = result.books[index]?.bookId;
    if (!aiConfig || !bookId) continue;
    await localApi.agentConfig.importConfig(aiConfig, bookId);
    aiConfigsApplied += 1;
  }
  if (aiConfigsApplied > 0) {
    useSyncVersionStore.getState().bumpProviderVersion();
  }

  const settingsApplied = parsed.settings !== null;
  if (parsed.settings) {
    applySettingsPackage(parsed.settings);
  }

  const networkBooks = parsed.networkBooks
    ? applyNetworkBooksSnapshot(parsed.networkBooks)
    : null;

  return { aiConfigsApplied, settingsApplied, networkBooks };
}
