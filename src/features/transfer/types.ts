import type { LibrarySnapshot, SnapshotCounts } from '@pennyspring/api';

export const SNAPSHOT_FORMAT = 'pennyspring.snapshot';
export const SNAPSHOT_FORMAT_VERSION = 1;

export interface SnapshotManifestBook {
  key: string;
  name: string;
  counts: SnapshotCounts;
  recordRange: [number, number] | null;
}

export interface SnapshotManifest {
  format: typeof SNAPSHOT_FORMAT;
  formatVersion: number;
  appVersion: string;
  createdAt: number;
  scope: 'book' | 'library';
  books: SnapshotManifestBook[];
  media: {
    count: number;
    totalBytes: number;
  };
  options: {
    includeImages: boolean;
    includeAgent: boolean;
  };
}

export type SnapshotPackageFiles = Record<string, Uint8Array>;

export interface BuiltSnapshotPackage {
  manifest: SnapshotManifest;
  files: SnapshotPackageFiles;
}

export interface ParsedSnapshotPackage {
  manifest: SnapshotManifest;
  library: LibrarySnapshot;
  mediaFiles: Record<string, Uint8Array>;
}

export interface TransferFileSystem {
  readBase64(uri: string): Promise<string>;
  writeBase64ToDocuments(fileName: string, base64: string): Promise<string>;
  delete(uri: string): Promise<void>;
}

export interface BuildSnapshotPackageOptions {
  includeImages: boolean;
  includeAgent: boolean;
  appVersion?: string;
  createdAt?: number;
}

export interface PreparedSnapshotImport {
  library: LibrarySnapshot;
  mediaUris: string[];
}

export type MediaStringResolver = (value: string) => string | undefined;
