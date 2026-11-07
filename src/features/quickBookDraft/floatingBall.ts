import { PermissionsAndroid, Platform } from 'react-native';
import { BOOK_TYPE } from '@pennyspring/api';

import type { BookEntry } from '../../stores/bookStore';
import {
  type QuickBookDraftNativeStatus,
  type QuickBookInstalledApp,
  UNSUPPORTED_FLOATING_BALL_STATUS,
  getQuickBookDraftStatus,
  getQuickBookInstalledApps,
  hasQuickBookDraftNativeModule,
  isQuickBookDraftFloatingBallRunning,
  openQuickBookDraftAccessibilitySettings,
  openQuickBookDraftNotificationSettings,
  openQuickBookDraftOverlaySettings,
  setQuickBookDraftCurrentBookId,
  setQuickBookDraftExcludedPackages,
  setQuickBookDraftFloatingBallEnabled,
  startQuickBookDraftFloatingBall,
  stopQuickBookDraftFloatingBall,
} from './native';

const ANDROID_11_API_LEVEL = 30;
const ANDROID_13_API_LEVEL = 33;
const POST_NOTIFICATIONS_PERMISSION =
  PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;

export interface FloatingBallEnableContext {
  isSupported: boolean;
  isConfigured: boolean;
  isLocalBook: boolean;
}

/**
 * 悬浮球开关被禁用的原因；null 表示允许开启。
 * 顺序与开启校验一致：平台 → 模型 → 账本。
 */
export function getFloatingBallEnableBlockReason(
  context: FloatingBallEnableContext,
): string | null {
  if (!context.isSupported) {
    return '当前平台不支持悬浮球截图记账。';
  }
  if (!context.isConfigured) {
    return '请先配置支持图片的 AI 模型。';
  }
  if (!context.isLocalBook) {
    return '悬浮球只支持本地账本，请先切换到本地账本。';
  }
  return null;
}

export function isFloatingBallSupported(): boolean {
  return (
    Platform.OS === 'android' &&
    Number(Platform.Version) >= ANDROID_11_API_LEVEL &&
    hasQuickBookDraftNativeModule()
  );
}

export async function getFloatingBallStatus(): Promise<QuickBookDraftNativeStatus> {
  if (!isFloatingBallSupported()) {
    return UNSUPPORTED_FLOATING_BALL_STATUS;
  }
  return getQuickBookDraftStatus();
}

export async function startFloatingBall(): Promise<boolean> {
  if (!isFloatingBallSupported()) {
    return false;
  }
  return startQuickBookDraftFloatingBall();
}

export async function stopFloatingBall(): Promise<void> {
  if (!isFloatingBallSupported()) {
    return;
  }
  await stopQuickBookDraftFloatingBall();
}

export async function isFloatingBallRunning(): Promise<boolean> {
  if (!isFloatingBallSupported()) {
    return false;
  }
  return isQuickBookDraftFloatingBallRunning();
}

export function openOverlaySettings(): void {
  if (!isFloatingBallSupported()) {
    return;
  }
  openQuickBookDraftOverlaySettings();
}

export function openNotificationSettings(): void {
  if (!isFloatingBallSupported()) {
    return;
  }
  openQuickBookDraftNotificationSettings();
}

export function openAccessibilitySettings(): void {
  if (!isFloatingBallSupported()) {
    return;
  }
  openQuickBookDraftAccessibilitySettings();
}

/** 把当前账本同步给原生；远程账本或未选择账本传 0。 */
export function syncQuickBookDraftBook(currentBook: BookEntry | null): void {
  if (Platform.OS !== 'android' || !hasQuickBookDraftNativeModule()) {
    return;
  }
  const booksId =
    currentBook !== null && currentBook.kind === BOOK_TYPE.local
      ? currentBook.id
      : 0;
  setQuickBookDraftCurrentBookId(booksId);
}

/** 把 JS 开关状态同步给原生，供原生侧保持设置一致。 */
export function syncFloatingBallEnabledSetting(enabled: boolean): void {
  if (!isFloatingBallSupported()) {
    return;
  }
  setQuickBookDraftFloatingBallEnabled(enabled);
}

export async function getFloatingBallExcludedAppCandidates(): Promise<
  QuickBookInstalledApp[]
> {
  if (!isFloatingBallSupported()) {
    return [];
  }
  return getQuickBookInstalledApps();
}

/** 把排除应用列表同步给原生，前台命中时隐藏悬浮球。 */
export function syncFloatingBallExcludedPackages(packages: string[]): void {
  if (!isFloatingBallSupported()) {
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
