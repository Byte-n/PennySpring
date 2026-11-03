import type {
  AiConfigSnapshot,
  LibrarySnapshot,
  SnapshotCounts,
} from '@pennyspring/api';

import type { NetworkBooksSnapshot } from './networkBooks';
import type { SettingsSnapshot } from './settings';

export const SNAPSHOT_FORMAT = 'pennyspring.snapshot';
export const SNAPSHOT_FORMAT_VERSION = 2;

export interface BookContentOptions {
  includeImages: boolean;
  includeAgent: boolean;
  includeAiConfig: boolean;
}

export interface SnapshotManifestBook {
  key: string;
  name: string;
  counts: SnapshotCounts;
  recordRange: [number, number] | null;
  options: BookContentOptions;
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
    includeSettings: boolean;
    includeNetworkBooks: boolean;
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
  bookAiConfigs: Record<string, AiConfigSnapshot>;
  settings: SettingsSnapshot | null;
  networkBooks: NetworkBooksSnapshot | null;
}

export interface TransferFileSystem {
  readBase64(uri: string): Promise<string>;
  writeBase64ToDocuments(fileName: string, base64: string): Promise<string>;
  delete(uri: string): Promise<void>;
}

export interface BuildSnapshotPackageOptions {
  bookOptions: Record<number, BookContentOptions>;
  aiConfigs?: Record<number, AiConfigSnapshot>;
  settings?: SettingsSnapshot;
  networkBooks?: NetworkBooksSnapshot;
  appVersion?: string;
  createdAt?: number;
}

export interface PreparedSnapshotImport {
  library: LibrarySnapshot;
  mediaUris: string[];
}

export type MediaStringResolver = (value: string) => string | undefined;
