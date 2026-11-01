import type {
  ApplyLibrarySnapshotResult,
  LibrarySnapshot,
} from '@pennyspring/api';
import { localApi } from '@pennyspring/api';

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
import type { ParsedSnapshotPackage, SnapshotManifest } from './types';

export interface ExportBooksRequest {
  bookIds: number[];
  includeImages: boolean;
  includeAgent: boolean;
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

export async function buildExportPackage(
  request: ExportBooksRequest,
): Promise<ExportPackageResult> {
  if (request.bookIds.length === 0) {
    throw new Error('至少选择一个账本');
  }
  const library: LibrarySnapshot = await localApi.transfer.exportLibrary(
    request.bookIds,
    { includeAgent: request.includeAgent },
  );
  const built = await buildSnapshotPackage(
    library,
    {
      includeImages: request.includeImages,
      includeAgent: request.includeAgent,
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
