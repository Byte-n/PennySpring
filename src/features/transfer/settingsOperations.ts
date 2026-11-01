import {
  clampFreshWindowSeconds,
  getQuickBookSettings,
  useQuickBookSettingsStore,
} from '../quickBook/settingsStore';
import { getThemeSettings, useThemeStore } from '../../stores/themeStore';
import {
  buildSettingsPackage,
  createSettingsFileName,
  parseSettingsPackage,
  zipSettingsPackage,
  type ParsedSettingsPackage,
  type SettingsManifest,
  type SettingsSnapshot,
} from './settings';
import { pickPackageFile, savePackageFile } from './packageFiles';

export interface SettingsExportResult {
  fileName: string;
  manifest: SettingsManifest;
  settings: SettingsSnapshot;
  sizeBytes: number;
  zip: Uint8Array;
}

export interface SavedSettingsExportResult extends SettingsExportResult {
  savedUri: string;
}

export interface PickedSettingsPreview {
  sourceName: string;
  sizeBytes: number;
  parsed: ParsedSettingsPackage;
}

export function buildSettingsSnapshot(): SettingsSnapshot {
  return {
    quickBook: getQuickBookSettings(),
    theme: getThemeSettings(),
  };
}

export async function buildSettingsExport(): Promise<SettingsExportResult> {
  const settings = buildSettingsSnapshot();
  const built = buildSettingsPackage(settings);
  const zip = await zipSettingsPackage(built.files);
  return {
    fileName: createSettingsFileName(built.manifest.createdAt),
    manifest: built.manifest,
    settings,
    sizeBytes: zip.byteLength,
    zip,
  };
}

export async function exportSettingsToFile(): Promise<SavedSettingsExportResult> {
  const exported = await buildSettingsExport();
  const savedUri = await savePackageFile(exported.zip, exported.fileName);
  return { ...exported, savedUri };
}

export async function pickSettingsPreview(): Promise<PickedSettingsPreview | null> {
  const picked = await pickPackageFile();
  if (!picked) return null;
  return {
    sourceName: picked.name,
    sizeBytes: picked.bytes.byteLength,
    parsed: await parseSettingsPackage(picked.bytes),
  };
}

export function applySettingsPackage(snapshot: SettingsSnapshot): void {
  const quickBook = useQuickBookSettingsStore.getState();
  quickBook.setFreshWindowSeconds(
    clampFreshWindowSeconds(snapshot.quickBook.freshWindowSeconds),
  );
  quickBook.setPresetPrompt(snapshot.quickBook.presetPrompt);
  quickBook.setNudgeEnabled(snapshot.quickBook.nudgeEnabled);
  useThemeStore.getState().setTheme(snapshot.theme);
}
