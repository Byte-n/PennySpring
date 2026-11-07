import { NativeModules, Platform } from 'react-native';

/** 原生悬浮球状态；supported=false 表示当前平台没有可用实现。 */
export interface QuickBookDraftNativeStatus {
  overlayPermission: boolean;
  notificationPermission: boolean;
  accessibilityPermission: boolean;
  floatingBallRunning: boolean;
  currentBookId: number;
  supported: boolean;
}

export const UNSUPPORTED_FLOATING_BALL_STATUS: QuickBookDraftNativeStatus = {
  overlayPermission: false,
  notificationPermission: false,
  accessibilityPermission: false,
  floatingBallRunning: false,
  currentBookId: 0,
  supported: false,
};

/** 可被选为“不显示悬浮球”的已安装应用。 */
export interface QuickBookInstalledApp {
  packageName: string;
  label: string;
  /** PNG data URL；原生无法解码图标时为空串。 */
  icon: string;
}

/**
 * Android 原生悬浮球模块契约。
 * 非 Android 或模块缺失时所有方法走 no-op / unsupported 分支。
 */
interface QuickBookDraftNativeModule {
  getStatus: () => Promise<unknown>;
  getInstalledApps: () => Promise<unknown>;
  openOverlaySettings: () => void;
  openNotificationSettings: () => void;
  openAccessibilitySettings: () => void;
  startFloatingBall: () => Promise<unknown>;
  stopFloatingBall: () => void;
  setCurrentBookId: (booksId: number) => void;
  setFloatingBallEnabled: (enabled: boolean) => void;
  setExcludedPackages: (packages: string[]) => void;
  isFloatingBallRunning: () => Promise<unknown>;
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
    throw new Error('悬浮球状态返回格式不正确');
  }
  const {
    overlayPermission,
    notificationPermission,
    accessibilityPermission,
    floatingBallRunning,
    currentBookId,
    supported,
  } = value;
  if (
    typeof overlayPermission !== 'boolean' ||
    typeof notificationPermission !== 'boolean' ||
    typeof accessibilityPermission !== 'boolean' ||
    typeof floatingBallRunning !== 'boolean' ||
    typeof currentBookId !== 'number' ||
    !Number.isFinite(currentBookId) ||
    typeof supported !== 'boolean'
  ) {
    throw new Error('悬浮球状态返回格式不正确');
  }
  return {
    overlayPermission,
    notificationPermission,
    accessibilityPermission,
    floatingBallRunning,
    currentBookId,
    supported,
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
    return UNSUPPORTED_FLOATING_BALL_STATUS;
  }
  try {
    return parseNativeStatus(await module.getStatus());
  } catch {
    throw toChineseError('读取悬浮球状态');
  }
}

export async function startQuickBookDraftFloatingBall(): Promise<boolean> {
  const module = getNativeModule();
  if (!module) {
    return false;
  }
  try {
    return (await module.startFloatingBall()) === true;
  } catch {
    throw toChineseError('启动悬浮球');
  }
}

export async function stopQuickBookDraftFloatingBall(): Promise<void> {
  const module = getNativeModule();
  if (!module) {
    return;
  }
  try {
    module.stopFloatingBall();
  } catch {
    throw toChineseError('关闭悬浮球');
  }
}

export async function isQuickBookDraftFloatingBallRunning(): Promise<boolean> {
  const module = getNativeModule();
  if (!module) {
    return false;
  }
  try {
    return (await module.isFloatingBallRunning()) === true;
  } catch {
    throw toChineseError('读取悬浮球运行状态');
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
    throw toChineseError('同步悬浮球账本');
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
    throw toChineseError('同步悬浮球开关');
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
