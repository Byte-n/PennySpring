import { useEffect, useMemo, useRef } from 'react';
import { BOOK_TYPE } from '@pennyspring/api';
import { useToast } from '@pennyspring/ui';

import type { BookEntry } from '../../stores/bookStore';
import { getDraftErrorMessage } from './errorMessage';
import {
  getFloatingBallStatus,
  isFloatingBallRunning,
  isFloatingBallSupported,
  startFloatingBall,
  stopFloatingBall,
  syncFloatingBallBook,
  syncFloatingBallEnabledSetting,
} from './floatingBall';

interface UseFloatingBallLifecycleOptions {
  book: BookEntry | null;
  quickBookReady: boolean;
  floatingBallEnabled: boolean;
  setFloatingBallEnabled: (enabled: boolean) => void;
}

const REMOTE_BOOK_NOTICE = '当前为远程账本，已关闭悬浮球截图记账。';

/**
 * 悬浮球服务生命周期：随当前账本同步预设账本，并在启动/切换账本时恢复服务。
 * 所有原生调用失败都不会阻塞首屏，只做状态回写与一次性提示。
 */
export function useFloatingBallLifecycle({
  book,
  quickBookReady,
  floatingBallEnabled,
  setFloatingBallEnabled,
}: UseFloatingBallLifecycleOptions): void {
  const toast = useToast();
  const isSupported = useMemo(() => isFloatingBallSupported(), []);
  const isLocalBook = book !== null && book.kind === BOOK_TYPE.local;
  const bookKey = book !== null ? `${book.kind}:${book.id}` : 'none';
  const remoteStoppedBookRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isSupported) {
      return;
    }
    try {
      syncFloatingBallBook(book);
    } catch (error) {
      toast.show({
        messageText: getDraftErrorMessage(error, '同步悬浮球账本失败'),
        status: 'error',
      });
    }
  }, [book, bookKey, isSupported, toast]);

  useEffect(() => {
    if (!isSupported || !floatingBallEnabled || isLocalBook) {
      remoteStoppedBookRef.current = null;
      return;
    }
    if (book !== null && remoteStoppedBookRef.current === bookKey) {
      return;
    }
    remoteStoppedBookRef.current = bookKey;
    const disableNotice =
      book === null
        ? '未选择本地账本，已关闭悬浮球截图记账。'
        : REMOTE_BOOK_NOTICE;
    let cancelled = false;
    const disableForRemoteBook = async (): Promise<void> => {
      try {
        await stopFloatingBall();
      } catch (error) {
        if (!cancelled) {
          toast.show({
            messageText: getDraftErrorMessage(error, '关闭悬浮球失败'),
            status: 'error',
          });
        }
      }
      try {
        syncFloatingBallEnabledSetting(false);
      } catch (error) {
        if (!cancelled) {
          toast.show({
            messageText: getDraftErrorMessage(error, '同步悬浮球开关失败'),
            status: 'error',
          });
        }
      }
      if (cancelled) {
        return;
      }
      setFloatingBallEnabled(false);
      toast.show({ messageText: disableNotice });
    };
    disableForRemoteBook().catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [
    book,
    bookKey,
    floatingBallEnabled,
    isLocalBook,
    isSupported,
    setFloatingBallEnabled,
    toast,
  ]);

  useEffect(() => {
    if (
      !isSupported ||
      !quickBookReady ||
      !floatingBallEnabled ||
      !isLocalBook
    ) {
      return;
    }
    let cancelled = false;
    const restoreFloatingBall = async (): Promise<void> => {
      try {
        const status = await getFloatingBallStatus();
        if (cancelled) {
          return;
        }
        const permissionMissing =
          !status.overlayPermission ||
          !status.notificationPermission ||
          !status.accessibilityPermission;
        if (permissionMissing) {
          if (status.floatingBallRunning) {
            try {
              await stopFloatingBall();
            } catch {
              // 权限已失效时尽力停掉旧服务，失败不阻塞开关回写。
            }
          }
          try {
            syncFloatingBallEnabledSetting(false);
          } catch {
            // 原生标记失败不应阻止 JS 侧关闭。
          }
          setFloatingBallEnabled(false);
          return;
        }
        if (await isFloatingBallRunning()) {
          try {
            syncFloatingBallEnabledSetting(true);
          } catch {
            // 服务已在运行，原生标记失败不影响恢复结果。
          }
          return;
        }
        const started = await startFloatingBall();
        if (cancelled) {
          return;
        }
        if (started) {
          try {
            syncFloatingBallEnabledSetting(true);
          } catch {
            // 服务已启动，原生标记失败不影响恢复结果。
          }
          return;
        }
        try {
          syncFloatingBallEnabledSetting(false);
        } catch {
          // 原生标记失败不应阻止 JS 侧关闭，避免开关与实际状态长期不一致。
        }
        setFloatingBallEnabled(false);
        toast.show({
          messageText: '悬浮球未能恢复运行，已关闭开关，请在设置中重新开启。',
          status: 'error',
        });
      } catch (error) {
        if (cancelled) {
          return;
        }
        try {
          syncFloatingBallEnabledSetting(false);
        } catch {
          // 原生标记失败不应阻止 JS 侧关闭，避免开关与实际状态长期不一致。
        }
        setFloatingBallEnabled(false);
        toast.show({
          messageText: getDraftErrorMessage(
            error,
            '恢复悬浮球失败，已关闭开关',
          ),
          status: 'error',
        });
      }
    };
    restoreFloatingBall().catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [
    floatingBallEnabled,
    isLocalBook,
    isSupported,
    quickBookReady,
    setFloatingBallEnabled,
    toast,
  ]);
}
