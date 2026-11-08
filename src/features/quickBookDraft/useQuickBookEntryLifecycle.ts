import { useCallback, useEffect, useMemo, useRef } from 'react';
import { AppState } from 'react-native';
import { BOOK_TYPE } from '@pennyspring/api';
import { useToast } from '@pennyspring/ui';

import type { BookEntry } from '../../stores/bookStore';
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
  syncQuickBookDraftBook,
} from './quickBookEntry';

interface UseQuickBookEntryLifecycleOptions {
  book: BookEntry | null;
  quickBookReady: boolean;
  entryEnabled: boolean;
  triggerMode: QuickBookEntryMode;
  excludedPackages: string[];
  setEntryEnabled: (enabled: boolean) => void;
}

const REMOTE_BOOK_NOTICE = '当前为远程账本，已关闭截图记账入口。';
const MISSING_BOOK_NOTICE = '未选择本地账本，已关闭截图记账入口。';

/**
 * 截图记账入口生命周期：随当前账本同步预设账本，并在启动/切换账本时恢复入口。
 * 所有原生调用失败都不会阻塞首屏，只做状态回写与一次性提示。
 */
export function useQuickBookEntryLifecycle({
  book,
  quickBookReady,
  entryEnabled,
  triggerMode,
  excludedPackages,
  setEntryEnabled,
}: UseQuickBookEntryLifecycleOptions): void {
  const toast = useToast();
  const isSupported = useMemo(() => isQuickBookEntrySupported(), []);
  const isLocalBook = book !== null && book.kind === BOOK_TYPE.local;
  const bookKey = book !== null ? `${book.kind}:${book.id}` : 'none';
  const remoteStoppedBookRef = useRef<string | null>(null);
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
    try {
      syncQuickBookDraftBook(book);
    } catch (error) {
      toast.show({
        messageText: getDraftErrorMessage(error, '同步草稿账本失败'),
        status: 'error',
      });
    }
  }, [book, bookKey, toast]);

  useEffect(() => {
    if (!isSupported || !entryEnabled || isLocalBook) {
      remoteStoppedBookRef.current = null;
      return;
    }
    if (book !== null && remoteStoppedBookRef.current === bookKey) {
      return;
    }
    remoteStoppedBookRef.current = bookKey;
    const disableNotice =
      book === null ? MISSING_BOOK_NOTICE : REMOTE_BOOK_NOTICE;
    let cancelled = false;
    const disableForBook = async (): Promise<void> => {
      try {
        await stopQuickBookEntry();
      } catch (error) {
        if (!cancelled) {
          toast.show({
            messageText: getDraftErrorMessage(error, '关闭截图记账入口失败'),
            status: 'error',
          });
        }
      }
      try {
        syncQuickBookEntryEnabledSetting(false);
      } catch (error) {
        if (!cancelled) {
          toast.show({
            messageText: getDraftErrorMessage(
              error,
              '同步截图记账入口开关失败',
            ),
            status: 'error',
          });
        }
      }
      if (cancelled) {
        return;
      }
      setEntryEnabled(false);
      toast.show({ messageText: disableNotice });
    };
    disableForBook().catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [
    book,
    bookKey,
    entryEnabled,
    isLocalBook,
    isSupported,
    setEntryEnabled,
    toast,
  ]);

  useEffect(() => {
    if (!isSupported || !quickBookReady || !entryEnabled || !isLocalBook) {
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
    isLocalBook,
    isSupported,
    quickBookReady,
    reconcileDisabledByUser,
    setEntryEnabled,
    toast,
    triggerMode,
  ]);
}
