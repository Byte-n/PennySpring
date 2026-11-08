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
  supported: boolean;
  /** 原生侧已落盘的悬浮球排除应用，用于启动时与设备设置合并。 */
  excludedPackages: string[];
}

/** 原生 Headless 任务结果，用于原生通知；草稿数据仍由 JS 管理。 */
export interface QuickBookDraftOutcome {
  draftId: string;
  status: 'success' | 'failed';
  itemCount: number;
  bookKey?: string;
}

export const UNSUPPORTED_QUICK_BOOK_ENTRY_STATUS: QuickBookDraftNativeStatus = {
  overlayPermission: false,
  notificationPermission: false,
  accessibilityPermission: false,
  floatingBallRunning: false,
  notificationTriggerActive: false,
  entryDisabledByUser: false,
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
  setFloatingBallEnabled: (enabled: boolean) => void;
  setExcludedPackages: (packages: string[]) => void;
  setCaptureCatalog: (catalogJson: string) => Promise<unknown>;
  getActiveDraftIds: () => Promise<unknown>;
  getPendingDraftJobs: () => Promise<unknown>;
  ackDraftJob: (draftId: string) => Promise<unknown>;
  reportDraftOutcome: (outcome: {
    draftId: string;
    status: 'success' | 'failed';
    itemCount: number;
    bookKey?: string;
  }) => Promise<unknown>;
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

export async function setQuickBookCaptureCatalog(
  catalogJson: string,
): Promise<boolean> {
  const module = getNativeModule();
  if (!module) {
    return false;
  }
  try {
    return (await module.setCaptureCatalog(catalogJson)) === true;
  } catch {
    throw toChineseError('同步截图记账目录');
  }
}

function parseActiveDraftIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    throw new Error('草稿任务状态返回格式不正确');
  }
  return value
    .filter((id): id is string => typeof id === 'string')
    .map(id => id.trim())
    .filter(id => id !== '');
}

/** 原生进程内仍在执行的草稿 id；非 Android 或模块缺失时返回空数组。 */
export async function getQuickBookActiveDraftIds(): Promise<string[]> {
  const module = getNativeModule();
  if (!module) {
    return [];
  }
  try {
    return parseActiveDraftIds(await module.getActiveDraftIds());
  } catch {
    throw toChineseError('读取草稿任务状态');
  }
}

function parsePendingDraftJobs(value: unknown): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error('草稿任务日志返回格式不正确');
  }
  return value.filter(isRecord);
}

/** 已启动但尚未确认占位草稿写入的任务日志；非 Android 或模块缺失时返回空数组。 */
export async function getQuickBookPendingDraftJobs(): Promise<unknown[]> {
  const module = getNativeModule();
  if (!module) {
    return [];
  }
  try {
    return parsePendingDraftJobs(await module.getPendingDraftJobs());
  } catch {
    throw toChineseError('读取草稿任务日志');
  }
}

/** 占位草稿写入后删除任务日志；重复调用是幂等的。 */
export async function ackQuickBookDraftJob(draftId: string): Promise<void> {
  const module = getNativeModule();
  if (!module) {
    return;
  }
  try {
    await module.ackDraftJob(draftId);
  } catch {
    throw toChineseError('更新草稿任务日志');
  }
}

export async function reportQuickBookDraftOutcome(
  outcome: QuickBookDraftOutcome,
): Promise<void> {
  const module = getNativeModule();
  if (!module) {
    return;
  }
  try {
    await module.reportDraftOutcome({
      draftId: outcome.draftId,
      status: outcome.status,
      itemCount: outcome.itemCount,
      ...(outcome.bookKey === undefined ? {} : { bookKey: outcome.bookKey }),
    });
  } catch {
    throw toChineseError('回报草稿生成结果');
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
