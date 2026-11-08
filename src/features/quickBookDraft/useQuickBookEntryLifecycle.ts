import { useCallback, useEffect, useMemo, useRef } from 'react';
import { AppState } from 'react-native';
import { useToast } from '@pennyspring/ui';

import { getBookKey, useBookStore } from '../../stores/bookStore';
import { publishQuickBookCaptureCatalog } from './captureCatalog';
import type { QuickBookEntryMode } from './entryMode';
import { subscribeEntryDisabledByUser } from './entryEvents';
import { getDraftErrorMessage } from './errorMessage';
import { subscribeExcludedPackageAdded } from './excludedPackagesSync';
import {
  consumeQuickBookEntryDisabledByUser,
  getQuickBookEntryStatus,
  isAnyEntryActive,
  isEntryActive,
  isEntryPermissionMissing,
  isQuickBookEntrySupported,
  startQuickBookEntry,
  stopQuickBookEntry,
  syncQuickBookEntryEnabledSetting,
  syncQuickBookExcludedPackages,
} from './quickBookEntry';

interface UseQuickBookEntryLifecycleOptions {
  quickBookReady: boolean;
  entryEnabled: boolean;
  triggerMode: QuickBookEntryMode;
  excludedPackages: string[];
  setEntryEnabled: (enabled: boolean) => void;
}

/**
 * 截图记账入口生命周期：随当前账本发布目录快照，并在启动/切换账本时恢复入口。
 * 所有原生调用失败都不会阻塞首屏，只做状态回写与一次性提示。
 */
export function useQuickBookEntryLifecycle({
  quickBookReady,
  entryEnabled,
  triggerMode,
  excludedPackages,
  setEntryEnabled,
}: UseQuickBookEntryLifecycleOptions): void {
  const toast = useToast();
  const isSupported = useMemo(() => isQuickBookEntrySupported(), []);
  const currentBookRef = useBookStore(state => state.currentBookRef);
  const bookKey = getBookKey(currentBookRef) ?? 'none';
  const disabledReconcileRef = useRef<Promise<boolean> | null>(null);

  const reconcileDisabledByUser = useCallback((): Promise<boolean> => {
    const existing = disabledReconcileRef.current;
    if (existing !== null) {
      return existing;
    }
    const reconcile = (async (): Promise<boolean> => {
      try {
        const disabled = await consumeQuickBookEntryDisabledByUser();
        if (!disabled) {
          return false;
        }
        try {
          syncQuickBookEntryEnabledSetting(false);
        } catch {
          // 原生开关标记失败不阻塞 JS 侧关闭。
        }
        try {
          await stopQuickBookEntry();
        } catch {
          // 通知动作可能已取消入口，失败不阻塞开关回写。
        }
        setEntryEnabled(false);
        toast.show({ messageText: '截图记账入口已在通知栏关闭。' });
        return true;
      } catch {
        return false;
      }
    })();
    disabledReconcileRef.current = reconcile;
    reconcile
      .finally(() => {
        if (disabledReconcileRef.current === reconcile) {
          disabledReconcileRef.current = null;
        }
      })
      .catch(() => undefined);
    return reconcile;
  }, [setEntryEnabled, toast]);

  useEffect(() => {
    if (!isSupported || !quickBookReady) {
      return;
    }
    reconcileDisabledByUser().catch(() => undefined);
    const appStateSubscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        reconcileDisabledByUser().catch(() => undefined);
      }
    });
    const unsubscribe = subscribeEntryDisabledByUser(() => {
      reconcileDisabledByUser().catch(() => undefined);
    });
    return () => {
      appStateSubscription.remove();
      unsubscribe();
    };
  }, [isSupported, quickBookReady, reconcileDisabledByUser]);

  useEffect(() => {
    if (!isSupported || !quickBookReady) {
      return;
    }
    try {
      syncQuickBookExcludedPackages(excludedPackages);
    } catch (error) {
      toast.show({
        messageText: getDraftErrorMessage(error, '同步排除应用失败'),
        status: 'error',
      });
    }
  }, [excludedPackages, isSupported, quickBookReady, toast]);

  useEffect(() => {
    if (!isSupported || !quickBookReady) {
      return;
    }
    return subscribeExcludedPackageAdded();
  }, [isSupported, quickBookReady]);

  useEffect(() => {
    if (!isSupported || !quickBookReady) {
      return;
    }
    publishQuickBookCaptureCatalog().catch(error => {
      toast.show({
        messageText: getDraftErrorMessage(error, '同步截图记账目录失败'),
        status: 'error',
      });
    });
  }, [bookKey, isSupported, quickBookReady, toast]);

  useEffect(() => {
    if (!isSupported || !quickBookReady) {
      return;
    }
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        publishQuickBookCaptureCatalog().catch(() => undefined);
      }
    });
    return () => subscription.remove();
  }, [isSupported, quickBookReady]);

  useEffect(() => {
    if (!isSupported || !quickBookReady || !entryEnabled) {
      return;
    }
    let cancelled = false;
    const restoreEntry = async (): Promise<void> => {
      try {
        const disabledByUser = await reconcileDisabledByUser();
        if (cancelled || disabledByUser) {
          return;
        }
        const status = await getQuickBookEntryStatus();
        if (cancelled) {
          return;
        }
        if (isEntryPermissionMissing(status, triggerMode)) {
          if (isAnyEntryActive(status)) {
            try {
              await stopQuickBookEntry();
            } catch {
              // 权限已失效时尽力停掉旧入口，失败不阻塞开关回写。
            }
          }
          try {
            syncQuickBookEntryEnabledSetting(false);
          } catch {
            // 原生标记失败不应阻止 JS 侧关闭。
          }
          setEntryEnabled(false);
          return;
        }
        if (isEntryActive(status, triggerMode)) {
          try {
            syncQuickBookEntryEnabledSetting(true);
          } catch {
            // 入口已在运行，原生标记失败不影响恢复结果。
          }
          return;
        }
        const started = await startQuickBookEntry(triggerMode);
        if (cancelled) {
          return;
        }
        if (started) {
          try {
            syncQuickBookEntryEnabledSetting(true);
          } catch {
            // 入口已启动，原生标记失败不影响恢复结果。
          }
          return;
        }
        const disabledByUserAfterStart = await reconcileDisabledByUser();
        if (cancelled || disabledByUserAfterStart) {
          return;
        }
        try {
          syncQuickBookEntryEnabledSetting(false);
        } catch {
          // 原生标记失败不应阻止 JS 侧关闭，避免开关与实际状态长期不一致。
        }
        setEntryEnabled(false);
        toast.show({
          messageText:
            '截图记账入口未能恢复运行，已关闭开关，请在设置中重新开启。',
          status: 'error',
        });
      } catch (error) {
        if (cancelled) {
          return;
        }
        try {
          syncQuickBookEntryEnabledSetting(false);
        } catch {
          // 原生标记失败不应阻止 JS 侧关闭，避免开关与实际状态长期不一致。
        }
        setEntryEnabled(false);
        toast.show({
          messageText: getDraftErrorMessage(
            error,
            '恢复截图记账入口失败，已关闭开关',
          ),
          status: 'error',
        });
      }
    };
    restoreEntry().catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [
    entryEnabled,
    isSupported,
    quickBookReady,
    reconcileDisabledByUser,
    setEntryEnabled,
    toast,
    triggerMode,
  ]);
}
