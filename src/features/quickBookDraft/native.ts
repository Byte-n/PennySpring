import { NativeModules, Platform } from 'react-native';

import type { QuickBookEntryMode } from './entryMode';

/** 原生截图记账入口状态；supported=false 表示当前平台没有可用实现。 */
export interface QuickBookDraftNativeStatus {
  overlayPermission: boolean;
  notificationPermission: boolean;
  accessibilityPermission: boolean;
  floatingBallRunning: boolean;
  notificationTriggerActive: boolean;
  entryDisabledByUser: boolean;
  currentBookId: number;
  supported: boolean;
  /** 原生侧已落盘的悬浮球排除应用，用于启动时与设备设置合并。 */
  excludedPackages: string[];
}

export const UNSUPPORTED_QUICK_BOOK_ENTRY_STATUS: QuickBookDraftNativeStatus = {
  overlayPermission: false,
  notificationPermission: false,
  accessibilityPermission: false,
  floatingBallRunning: false,
  notificationTriggerActive: false,
  entryDisabledByUser: false,
  currentBookId: 0,
  supported: false,
  excludedPackages: [],
};

/** 可被选为“不显示悬浮球”的已安装应用。 */
export interface QuickBookInstalledApp {
  packageName: string;
  label: string;
  /** PNG data URL；原生无法解码图标时为空串。 */
  icon: string;
}

/**
 * Android 原生截图记账入口模块契约。
 * 非 Android 或模块缺失时所有方法走 no-op / unsupported 分支。
 */
interface QuickBookDraftNativeModule {
  getStatus: () => Promise<unknown>;
  getInstalledApps: () => Promise<unknown>;
  openOverlaySettings: () => void;
  openNotificationSettings: () => void;
  openAccessibilitySettings: () => void;
  startEntry: (
    mode: QuickBookEntryMode,
    userInitiated: boolean,
  ) => Promise<unknown>;
  stopEntry: () => void;
  consumeEntryDisabledByUser: () => Promise<unknown>;
  setCurrentBookId: (booksId: number) => void;
  setFloatingBallEnabled: (enabled: boolean) => void;
  setExcludedPackages: (packages: string[]) => void;
  cleanupOrphanImages: () => Promise<unknown>;
}

function getNativeModule(): QuickBookDraftNativeModule | null {
  if (Platform.OS !== 'android') {
    return null;
  }
  return (
    (NativeModules.QuickBookDraft as QuickBookDraftNativeModule | undefined) ??
    null
  );
}

export function hasQuickBookDraftNativeModule(): boolean {
  return getNativeModule() !== null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseNativeStatus(value: unknown): QuickBookDraftNativeStatus {
  if (!isRecord(value)) {
    throw new Error('截图记账入口状态返回格式不正确');
  }
  const {
    overlayPermission,
    notificationPermission,
    accessibilityPermission,
    floatingBallRunning,
    notificationTriggerActive,
    entryDisabledByUser,
    currentBookId,
    supported,
    excludedPackages,
  } = value;
  if (
    typeof overlayPermission !== 'boolean' ||
    typeof notificationPermission !== 'boolean' ||
    typeof accessibilityPermission !== 'boolean' ||
    typeof floatingBallRunning !== 'boolean' ||
    typeof notificationTriggerActive !== 'boolean' ||
    typeof entryDisabledByUser !== 'boolean' ||
    typeof currentBookId !== 'number' ||
    !Number.isFinite(currentBookId) ||
    typeof supported !== 'boolean'
  ) {
    throw new Error('截图记账入口状态返回格式不正确');
  }
  const parsedExcludedPackages = Array.isArray(excludedPackages)
    ? excludedPackages.filter(
        (packageName): packageName is string =>
          typeof packageName === 'string' && packageName.trim() !== '',
      )
    : [];
  return {
    overlayPermission,
    notificationPermission,
    accessibilityPermission,
    floatingBallRunning,
    notificationTriggerActive,
    entryDisabledByUser,
    currentBookId,
    supported,
    excludedPackages: parsedExcludedPackages,
  };
}

function toChineseError(action: string): Error {
  return new Error(`${action}失败，请稍后重试`);
}

function parseInstalledApps(value: unknown): QuickBookInstalledApp[] {
  if (!Array.isArray(value)) {
    throw new Error('应用列表返回格式不正确');
  }
  const apps: QuickBookInstalledApp[] = [];
  for (const entry of value) {
    if (!isRecord(entry)) {
      continue;
    }
    const { packageName, label, icon } = entry;
    if (
      typeof packageName !== 'string' ||
      packageName.trim() === '' ||
      typeof label !== 'string' ||
      typeof icon !== 'string'
    ) {
      continue;
    }
    apps.push({ packageName, label, icon });
  }
  return apps;
}

export async function getQuickBookInstalledApps(): Promise<
  QuickBookInstalledApp[]
> {
  const module = getNativeModule();
  if (!module) {
    return [];
  }
  try {
    return parseInstalledApps(await module.getInstalledApps());
  } catch {
    throw toChineseError('读取应用列表');
  }
}

export async function getQuickBookDraftStatus(): Promise<QuickBookDraftNativeStatus> {
  const module = getNativeModule();
  if (!module) {
    return UNSUPPORTED_QUICK_BOOK_ENTRY_STATUS;
  }
  try {
    return parseNativeStatus(await module.getStatus());
  } catch {
    throw toChineseError('读取截图记账入口状态');
  }
}

export async function startQuickBookDraftEntry(
  mode: QuickBookEntryMode,
  userInitiated: boolean,
): Promise<boolean> {
  const module = getNativeModule();
  if (!module) {
    return false;
  }
  try {
    return (await module.startEntry(mode, userInitiated)) === true;
  } catch {
    throw toChineseError('启动截图记账入口');
  }
}

export async function consumeQuickBookDraftEntryDisabledByUser(): Promise<boolean> {
  const module = getNativeModule();
  if (!module) {
    return false;
  }
  try {
    return (await module.consumeEntryDisabledByUser()) === true;
  } catch {
    throw toChineseError('读取截图记账入口关闭状态');
  }
}

export async function stopQuickBookDraftEntry(): Promise<void> {
  const module = getNativeModule();
  if (!module) {
    return;
  }
  try {
    module.stopEntry();
  } catch {
    throw toChineseError('关闭截图记账入口');
  }
}

export function openQuickBookDraftOverlaySettings(): void {
  const module = getNativeModule();
  if (!module) {
    return;
  }
  try {
    module.openOverlaySettings();
  } catch {
    throw toChineseError('打开悬浮窗设置');
  }
}

export function openQuickBookDraftNotificationSettings(): void {
  const module = getNativeModule();
  if (!module) {
    return;
  }
  try {
    module.openNotificationSettings();
  } catch {
    throw toChineseError('打开通知设置');
  }
}

export function openQuickBookDraftAccessibilitySettings(): void {
  const module = getNativeModule();
  if (!module) {
    return;
  }
  try {
    module.openAccessibilitySettings();
  } catch {
    throw toChineseError('打开无障碍设置');
  }
}

export function setQuickBookDraftCurrentBookId(booksId: number): void {
  const module = getNativeModule();
  if (!module) {
    return;
  }
  try {
    module.setCurrentBookId(booksId);
  } catch {
    throw toChineseError('同步截图记账账本');
  }
}

export async function cleanupQuickBookDraftOrphanImages(): Promise<number> {
  const module = getNativeModule();
  if (!module) {
    return 0;
  }
  try {
    const removed = await module.cleanupOrphanImages();
    return typeof removed === 'number' && Number.isFinite(removed)
      ? removed
      : 0;
  } catch {
    throw toChineseError('清理孤儿草稿截图');
  }
}

export function setQuickBookDraftFloatingBallEnabled(enabled: boolean): void {
  const module = getNativeModule();
  if (!module) {
    return;
  }
  try {
    module.setFloatingBallEnabled(enabled);
  } catch {
    throw toChineseError('同步截图记账入口开关');
  }
}

export function setQuickBookDraftExcludedPackages(packages: string[]): void {
  const module = getNativeModule();
  if (!module) {
    return;
  }
  try {
    module.setExcludedPackages(packages);
  } catch {
    throw toChineseError('同步排除应用');
  }
}
