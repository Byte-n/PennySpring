import { PermissionsAndroid, Platform } from 'react-native';

import { publishQuickBookCaptureCatalog } from './captureCatalog';
import type { QuickBookEntryMode } from './entryMode';
import {
  type QuickBookDraftNativeStatus,
  type QuickBookInstalledApp,
  UNSUPPORTED_QUICK_BOOK_ENTRY_STATUS,
  consumeQuickBookDraftEntryDisabledByUser,
  getQuickBookDraftStatus,
  getQuickBookInstalledApps,
  hasQuickBookDraftNativeModule,
  openQuickBookDraftAccessibilitySettings,
  openQuickBookDraftNotificationSettings,
  openQuickBookDraftOverlaySettings,
  setQuickBookDraftExcludedPackages,
  setQuickBookDraftFloatingBallEnabled,
  startQuickBookDraftEntry,
  stopQuickBookDraftEntry,
} from './native';

const ANDROID_11_API_LEVEL = 30;
const ANDROID_13_API_LEVEL = 33;
const POST_NOTIFICATIONS_PERMISSION =
  PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;

export interface QuickBookEntryEnableContext {
  isSupported: boolean;
  isConfigured: boolean;
}

/**
 * 截图记账入口开关被禁用的原因；null 表示允许开启。
 * 顺序与开启校验一致：平台 → 模型。
 */
export function getQuickBookEntryEnableBlockReason(
  context: QuickBookEntryEnableContext,
): string | null {
  if (!context.isSupported) {
    return '当前平台不支持截图记账入口。';
  }
  if (!context.isConfigured) {
    return '请先配置支持图片的 AI 模型。';
  }
  return null;
}

export function isQuickBookEntrySupported(): boolean {
  return (
    Platform.OS === 'android' &&
    Number(Platform.Version) >= ANDROID_11_API_LEVEL &&
    hasQuickBookDraftNativeModule()
  );
}

export async function getQuickBookEntryStatus(): Promise<QuickBookDraftNativeStatus> {
  if (!isQuickBookEntrySupported()) {
    return UNSUPPORTED_QUICK_BOOK_ENTRY_STATUS;
  }
  return getQuickBookDraftStatus();
}

export async function startQuickBookEntry(
  mode: QuickBookEntryMode,
  userInitiated = false,
): Promise<boolean> {
  if (!isQuickBookEntrySupported()) {
    return false;
  }
  await publishQuickBookCaptureCatalog();
  return startQuickBookDraftEntry(mode, userInitiated);
}

export async function consumeQuickBookEntryDisabledByUser(): Promise<boolean> {
  if (!isQuickBookEntrySupported()) {
    return false;
  }
  return consumeQuickBookDraftEntryDisabledByUser();
}

export async function stopQuickBookEntry(): Promise<void> {
  if (!isQuickBookEntrySupported()) {
    return;
  }
  await stopQuickBookDraftEntry();
}

/** 当前模式需要的前置权限；悬浮球模式额外要求悬浮窗权限。 */
export function isEntryPermissionMissing(
  status: QuickBookDraftNativeStatus,
  mode: QuickBookEntryMode,
): boolean {
  if (!status.notificationPermission || !status.accessibilityPermission) {
    return true;
  }
  return mode === 'floatingBall' && !status.overlayPermission;
}

/** 当前模式对应的入口是否正在运行。 */
export function isEntryActive(
  status: QuickBookDraftNativeStatus,
  mode: QuickBookEntryMode,
): boolean {
  return mode === 'floatingBall'
    ? status.floatingBallRunning
    : status.notificationTriggerActive;
}

/** 任一入口是否在运行；关闭或切换时用于判断是否需要停旧入口。 */
export function isAnyEntryActive(status: QuickBookDraftNativeStatus): boolean {
  return status.floatingBallRunning || status.notificationTriggerActive;
}

export function openOverlaySettings(): void {
  if (!isQuickBookEntrySupported()) {
    return;
  }
  openQuickBookDraftOverlaySettings();
}

export function openNotificationSettings(): void {
  if (!isQuickBookEntrySupported()) {
    return;
  }
  openQuickBookDraftNotificationSettings();
}

export function openAccessibilitySettings(): void {
  if (!isQuickBookEntrySupported()) {
    return;
  }
  openQuickBookDraftAccessibilitySettings();
}

/** 把 JS 开关状态同步给原生，供原生侧保持设置一致。 */
export function syncQuickBookEntryEnabledSetting(enabled: boolean): void {
  if (!isQuickBookEntrySupported()) {
    return;
  }
  setQuickBookDraftFloatingBallEnabled(enabled);
}

export async function getQuickBookExcludedAppCandidates(): Promise<
  QuickBookInstalledApp[]
> {
  if (!isQuickBookEntrySupported()) {
    return [];
  }
  return getQuickBookInstalledApps();
}

/** 把排除应用列表同步给原生，前台命中时隐藏悬浮球。 */
export function syncQuickBookExcludedPackages(packages: string[]): void {
  if (!isQuickBookEntrySupported()) {
    return;
  }
  setQuickBookDraftExcludedPackages(packages);
}

/** Android 13+ 需要 POST_NOTIFICATIONS；低版本直接视为已授权。 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (
    Platform.OS !== 'android' ||
    Number(Platform.Version) < ANDROID_13_API_LEVEL
  ) {
    return true;
  }
  try {
    const result = await PermissionsAndroid.request(
      POST_NOTIFICATIONS_PERMISSION,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
}
