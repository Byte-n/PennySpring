import { DeviceEventEmitter } from 'react-native';

import { useQuickBookSettingsStore } from '../quickBook/settingsStore';
import { addExcludedPackage, mergeExcludedPackages } from './excludedApps';
import { isQuickBookEntrySupported } from './quickBookEntry';
import { getQuickBookDraftStatus } from './native';

const EXCLUDED_PACKAGE_ADDED_EVENT = 'QuickBookDraftExcludedPackageAdded';

/**
 * 原生长按菜单会直接落盘排除应用；订阅后同步回设备设置。
 * 由悬浮球生命周期在设置 rehydrate 完成后挂载，避免启动早期覆盖设置。
 */
export function subscribeExcludedPackageAdded(): () => void {
  if (!isQuickBookEntrySupported()) {
    return () => undefined;
  }
  const subscription = DeviceEventEmitter.addListener(
    EXCLUDED_PACKAGE_ADDED_EVENT,
    (packageName: unknown) => {
      if (typeof packageName !== 'string') {
        return;
      }
      const state = useQuickBookSettingsStore.getState();
      state.setExcludedPackages(
        addExcludedPackage(state.excludedPackages, packageName),
      );
    },
  );
  return () => {
    subscription.remove();
  };
}

/** 启动时合并原生已落盘的排除应用，避免 JS 未运行时遗漏长按菜单的结果。 */
export async function mergeNativeExcludedPackages(): Promise<void> {
  if (!isQuickBookEntrySupported()) {
    return;
  }
  const status = await getQuickBookDraftStatus();
  if (status.excludedPackages.length === 0) {
    return;
  }
  const state = useQuickBookSettingsStore.getState();
  const merged = mergeExcludedPackages(
    state.excludedPackages,
    status.excludedPackages,
  );
  if (merged.length !== state.excludedPackages.length) {
    state.setExcludedPackages(merged);
  }
}
