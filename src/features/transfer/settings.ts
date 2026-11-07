import { strFromU8, strToU8 } from 'fflate';
import { themePresets } from '@pennyspring/theme';
import type { ThemePresetName } from '@pennyspring/theme';
import { z } from 'zod';

import { unzipFiles, zipFiles, type PackageFiles } from './zip';

export const SETTINGS_FORMAT = 'pennyspring.settings';
export const SETTINGS_FORMAT_VERSION = 1;
export const SETTINGS_PACKAGE_EXTENSION = 'pss';

const DEFAULT_APP_VERSION = '0.0.1';
const PRESET_VALUES = themePresets.map(preset => preset.value) as [
  ThemePresetName,
  ...ThemePresetName[],
];

export interface SettingsQuickBook {
  freshWindowSeconds: number;
  presetPrompt: string;
  nudgeEnabled: boolean;
  autoApproveScreenshot: boolean;
  /** 旧版设置包没有该字段；缺失时导入不覆盖目标设备已有排除列表。 */
  excludedPackages?: string[];
}

export interface SettingsTheme {
  themeMode: 'default' | 'dark';
  themePreset: ThemePresetName;
}

export interface SettingsSnapshot {
  quickBook: SettingsQuickBook;
  theme: SettingsTheme;
}

export interface SettingsManifest {
  format: typeof SETTINGS_FORMAT;
  formatVersion: number;
  appVersion: string;
  createdAt: number;
}

export interface BuiltSettingsPackage {
  manifest: SettingsManifest;
  settings: SettingsSnapshot;
  files: PackageFiles;
}

export interface ParsedSettingsPackage {
  manifest: SettingsManifest;
  settings: SettingsSnapshot;
}

export interface BuildSettingsPackageOptions {
  appVersion?: string;
  createdAt?: number;
}

const quickBookSchema = z.object({
  freshWindowSeconds: z.number().int().positive(),
  presetPrompt: z.string(),
  nudgeEnabled: z.boolean(),
  autoApproveScreenshot: z.boolean(),
  excludedPackages: z.array(z.string()).optional(),
});

const themeSchema = z.object({
  themeMode: z.enum(['default', 'dark']),
  themePreset: z.enum(PRESET_VALUES),
});

const settingsSchema = z.object({
  quickBook: quickBookSchema,
  theme: themeSchema,
});

const manifestSchema = z.object({
  format: z.literal(SETTINGS_FORMAT),
  formatVersion: z.number().int().positive(),
  appVersion: z.string(),
  createdAt: z.number().int().nonnegative(),
});

export function parseSettingsSnapshot(value: unknown): SettingsSnapshot {
  const result = settingsSchema.safeParse(value);
  if (!result.success) {
    throw new Error(
      `设置包内容格式不正确: ${result.error.issues[0]?.message ?? '未知错误'}`,
    );
  }
  return result.data as SettingsSnapshot;
}

function readJson(files: PackageFiles, path: string): unknown {
  const file = files[path];
  if (!file) throw new Error(`设置包缺少文件: ${path}`);
  try {
    return JSON.parse(strFromU8(file));
  } catch {
    throw new Error(`设置包文件格式不正确: ${path}`);
  }
}

export function buildSettingsPackage(
  snapshot: SettingsSnapshot,
  options: BuildSettingsPackageOptions = {},
): BuiltSettingsPackage {
  const settings = settingsSchema.parse(snapshot) as SettingsSnapshot;
  const manifest: SettingsManifest = {
    format: SETTINGS_FORMAT,
    formatVersion: SETTINGS_FORMAT_VERSION,
    appVersion: options.appVersion ?? DEFAULT_APP_VERSION,
    createdAt: options.createdAt ?? Date.now(),
  };
  return {
    manifest,
    settings,
    files: {
      'manifest.json': strToU8(JSON.stringify(manifest)),
      'settings.json': strToU8(JSON.stringify(settings)),
    },
  };
}

export function zipSettingsPackage(files: PackageFiles): Promise<Uint8Array> {
  return zipFiles(files);
}

export async function parseSettingsPackage(
  data: Uint8Array,
): Promise<ParsedSettingsPackage> {
  const files = await unzipFiles(data);
  const manifestResult = manifestSchema.safeParse(
    readJson(files, 'manifest.json'),
  );
  if (!manifestResult.success) {
    throw new Error(
      `设置包清单格式不正确: ${manifestResult.error.issues[0]?.message ?? '未知错误'}`,
    );
  }
  if (manifestResult.data.formatVersion > SETTINGS_FORMAT_VERSION) {
    throw new Error('设置包版本过高，请升级 PennySpring 后再导入');
  }

  return {
    manifest: manifestResult.data,
    settings: parseSettingsSnapshot(readJson(files, 'settings.json')),
  };
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createSettingsFileName(createdAt: number): string {
  return `PennySpring_设置_${formatDate(new Date(createdAt))}.${SETTINGS_PACKAGE_EXTENSION}`;
}
