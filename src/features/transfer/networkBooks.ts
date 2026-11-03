import { strFromU8, strToU8 } from 'fflate';
import { z } from 'zod';

import type { NetworkBookRef } from '../../stores/networkBookStore';
import { unzipFiles, zipFiles, type PackageFiles } from './zip';

export const NETWORK_BOOKS_FORMAT = 'pennyspring.network-books';
export const NETWORK_BOOKS_FORMAT_VERSION = 1;
export const NETWORK_BOOKS_PACKAGE_EXTENSION = 'psn';

const DEFAULT_APP_VERSION = '0.0.1';

export interface NetworkBooksServer {
  serverUrl: string;
  token: string;
}

export interface NetworkBooksSnapshot {
  servers: NetworkBooksServer[];
  refs: NetworkBookRef[];
}

export interface NetworkBooksManifest {
  format: typeof NETWORK_BOOKS_FORMAT;
  formatVersion: number;
  appVersion: string;
  createdAt: number;
  serverCount: number;
  bookCount: number;
  tokenCount: number;
}

export interface BuiltNetworkBooksPackage {
  manifest: NetworkBooksManifest;
  snapshot: NetworkBooksSnapshot;
  files: PackageFiles;
}

export interface ParsedNetworkBooksPackage {
  manifest: NetworkBooksManifest;
  snapshot: NetworkBooksSnapshot;
}

export interface BuildNetworkBooksPackageOptions {
  appVersion?: string;
  createdAt?: number;
}

export interface NetworkBooksState {
  refs: NetworkBookRef[];
  tokens: Record<string, string>;
}

export interface NetworkBookMergeResult {
  refs: NetworkBookRef[];
  tokens: Record<string, string>;
  serversAdded: number;
  tokensUpdated: number;
  refsAdded: number;
}

const serverSchema = z.object({
  serverUrl: z.string().min(1),
  token: z.string(),
});

const refSchema = z.object({
  serverUrl: z.string().min(1),
  bookId: z.number().int().positive(),
});

const snapshotSchema = z.object({
  servers: z.array(serverSchema),
  refs: z.array(refSchema),
});

const manifestSchema = z.object({
  format: z.literal(NETWORK_BOOKS_FORMAT),
  formatVersion: z.number().int().positive(),
  appVersion: z.string(),
  createdAt: z.number().int().nonnegative(),
  serverCount: z.number().int().nonnegative(),
  bookCount: z.number().int().nonnegative(),
  tokenCount: z.number().int().nonnegative(),
});

function readJson(files: PackageFiles, path: string): unknown {
  const file = files[path];
  if (!file) throw new Error(`网络账本列表包缺少文件: ${path}`);
  try {
    return JSON.parse(strFromU8(file));
  } catch {
    throw new Error(`网络账本列表包文件格式不正确: ${path}`);
  }
}

export function parseNetworkBooksSnapshot(
  value: unknown,
): NetworkBooksSnapshot {
  const result = snapshotSchema.safeParse(value);
  if (!result.success) {
    throw new Error(
      `网络账本列表包内容格式不正确: ${result.error.issues[0]?.message ?? '未知错误'}`,
    );
  }
  return result.data;
}

function countTokens(snapshot: NetworkBooksSnapshot): number {
  return snapshot.servers.filter(server => server.token !== '').length;
}

export function buildNetworkBooksPackage(
  snapshot: NetworkBooksSnapshot,
  options: BuildNetworkBooksPackageOptions = {},
): BuiltNetworkBooksPackage {
  const parsed = parseNetworkBooksSnapshot(snapshot);
  const manifest: NetworkBooksManifest = {
    format: NETWORK_BOOKS_FORMAT,
    formatVersion: NETWORK_BOOKS_FORMAT_VERSION,
    appVersion: options.appVersion ?? DEFAULT_APP_VERSION,
    createdAt: options.createdAt ?? Date.now(),
    serverCount: parsed.servers.length,
    bookCount: parsed.refs.length,
    tokenCount: countTokens(parsed),
  };
  return {
    manifest,
    snapshot: parsed,
    files: {
      'manifest.json': strToU8(JSON.stringify(manifest)),
      'network-books.json': strToU8(JSON.stringify(parsed)),
    },
  };
}

export function zipNetworkBooksPackage(
  files: PackageFiles,
): Promise<Uint8Array> {
  return zipFiles(files);
}

export async function parseNetworkBooksPackage(
  data: Uint8Array,
): Promise<ParsedNetworkBooksPackage> {
  const files = await unzipFiles(data);
  const manifestResult = manifestSchema.safeParse(
    readJson(files, 'manifest.json'),
  );
  if (!manifestResult.success) {
    throw new Error(
      `网络账本列表包清单格式不正确: ${manifestResult.error.issues[0]?.message ?? '未知错误'}`,
    );
  }
  if (manifestResult.data.formatVersion > NETWORK_BOOKS_FORMAT_VERSION) {
    throw new Error('网络账本列表包版本过高，请升级 PennySpring 后再导入');
  }

  return {
    manifest: manifestResult.data,
    snapshot: parseNetworkBooksSnapshot(readJson(files, 'network-books.json')),
  };
}

export function mergeNetworkBooks(
  current: NetworkBooksState,
  incoming: NetworkBooksSnapshot,
): NetworkBookMergeResult {
  const tokens = { ...current.tokens };
  const refs = [...current.refs];
  const refKeys = new Set(
    current.refs.map(ref => `${ref.serverUrl}\u0000${ref.bookId}`),
  );
  const serverUrls = new Set([
    ...Object.keys(current.tokens),
    ...current.refs.map(ref => ref.serverUrl),
  ]);

  let serversAdded = 0;
  let tokensUpdated = 0;
  let refsAdded = 0;

  for (const server of incoming.servers) {
    if (!serverUrls.has(server.serverUrl)) {
      serverUrls.add(server.serverUrl);
      serversAdded += 1;
    }
    if (server.token && tokens[server.serverUrl] !== server.token) {
      tokens[server.serverUrl] = server.token;
      tokensUpdated += 1;
    }
  }

  for (const ref of incoming.refs) {
    const key = `${ref.serverUrl}\u0000${ref.bookId}`;
    if (refKeys.has(key)) continue;
    refKeys.add(key);
    refs.push(ref);
    refsAdded += 1;
  }

  return { refs, tokens, serversAdded, tokensUpdated, refsAdded };
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createNetworkBooksFileName(createdAt: number): string {
  return `PennySpring_网络账本_${formatDate(new Date(createdAt))}.${NETWORK_BOOKS_PACKAGE_EXTENSION}`;
}
