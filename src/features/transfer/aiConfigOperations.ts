import type {
  AiConfigSnapshot,
  Api,
  ApplyAiConfigResult,
} from '@pennyspring/api';

import {
  buildAiConfigPackage,
  createAiConfigFileName,
  parseAiConfigPackage,
  zipAiConfigPackage,
  type AiConfigManifest,
  type ParsedAiConfigPackage,
} from './aiConfig';
import { pickPackageFile, savePackageFile } from './packageFiles';

export interface AiConfigExportResult {
  fileName: string;
  manifest: AiConfigManifest;
  sizeBytes: number;
  snapshot: AiConfigSnapshot;
  zip: Uint8Array;
}

export interface SavedAiConfigExportResult extends AiConfigExportResult {
  savedUri: string;
}

export interface PickedAiConfigPreview {
  sourceName: string;
  sizeBytes: number;
  parsed: ParsedAiConfigPackage;
}

export async function buildAiConfigExport(
  api: Api,
): Promise<AiConfigExportResult> {
  const snapshot = await api.agentConfig.exportConfig();
  const built = buildAiConfigPackage(snapshot);
  const zip = await zipAiConfigPackage(built.files);
  return {
    fileName: createAiConfigFileName(built.manifest.createdAt),
    manifest: built.manifest,
    sizeBytes: zip.byteLength,
    snapshot,
    zip,
  };
}

export async function exportAiConfigToFile(
  api: Api,
): Promise<SavedAiConfigExportResult> {
  const exported = await buildAiConfigExport(api);
  const savedUri = await savePackageFile(exported.zip, exported.fileName);
  return { ...exported, savedUri };
}

export async function pickAiConfigPreview(): Promise<PickedAiConfigPreview | null> {
  const picked = await pickPackageFile();
  if (!picked) return null;
  return {
    sourceName: picked.name,
    sizeBytes: picked.bytes.byteLength,
    parsed: await parseAiConfigPackage(picked.bytes),
  };
}

export async function importAiConfig(
  api: Api,
  snapshot: AiConfigSnapshot,
): Promise<ApplyAiConfigResult> {
  return api.agentConfig.importConfig(snapshot);
}
