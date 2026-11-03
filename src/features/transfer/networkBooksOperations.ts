import { useNetworkBookStore } from '../../stores/networkBookStore';
import {
  buildNetworkBooksPackage,
  createNetworkBooksFileName,
  parseNetworkBooksPackage,
  zipNetworkBooksPackage,
  type NetworkBookMergeResult,
  type NetworkBooksManifest,
  type NetworkBooksSnapshot,
  type ParsedNetworkBooksPackage,
} from './networkBooks';
import { pickPackageFile, savePackageFile } from './packageFiles';

export interface NetworkBooksExportResult {
  fileName: string;
  manifest: NetworkBooksManifest;
  sizeBytes: number;
  snapshot: NetworkBooksSnapshot;
  zip: Uint8Array;
}

export interface SavedNetworkBooksExportResult extends NetworkBooksExportResult {
  savedUri: string;
}

export interface PickedNetworkBooksPreview {
  sourceName: string;
  sizeBytes: number;
  parsed: ParsedNetworkBooksPackage;
}

export function getNetworkBooksSnapshot(): NetworkBooksSnapshot {
  const { refs, tokens } = useNetworkBookStore.getState();
  const serverUrls = new Set([
    ...Object.keys(tokens),
    ...refs.map(ref => ref.serverUrl),
  ]);
  return {
    servers: Array.from(serverUrls).map(serverUrl => ({
      serverUrl,
      token: tokens[serverUrl] ?? '',
    })),
    refs,
  };
}

export async function buildNetworkBooksExport(): Promise<NetworkBooksExportResult> {
  const snapshot = getNetworkBooksSnapshot();
  const built = buildNetworkBooksPackage(snapshot);
  const zip = await zipNetworkBooksPackage(built.files);
  return {
    fileName: createNetworkBooksFileName(built.manifest.createdAt),
    manifest: built.manifest,
    sizeBytes: zip.byteLength,
    snapshot,
    zip,
  };
}

export async function exportNetworkBooksToFile(): Promise<SavedNetworkBooksExportResult> {
  const exported = await buildNetworkBooksExport();
  const savedUri = await savePackageFile(exported.zip, exported.fileName);
  return { ...exported, savedUri };
}

export async function pickNetworkBooksPreview(): Promise<PickedNetworkBooksPreview | null> {
  const picked = await pickPackageFile();
  if (!picked) return null;
  return {
    sourceName: picked.name,
    sizeBytes: picked.bytes.byteLength,
    parsed: await parseNetworkBooksPackage(picked.bytes),
  };
}

export function applyNetworkBooksSnapshot(
  snapshot: NetworkBooksSnapshot,
): NetworkBookMergeResult {
  return useNetworkBookStore.getState().mergeSnapshot(snapshot);
}
