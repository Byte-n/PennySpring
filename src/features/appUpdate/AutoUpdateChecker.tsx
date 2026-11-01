import { useEffect, useRef } from 'react';
import { useNotification } from '@pennyspring/ui';

import { ROOT_ROUTES, rootNavigationRef } from '../../navigation';
import { useBookStore } from '../../stores/bookStore';
import { getAutoUpdateSettings, rehydrateAutoUpdate } from './autoUpdateStore';
import { checkForUpdate, getInstalledVersion } from './client';

export function AutoUpdateChecker(): null {
  const initStatus = useBookStore(state => state.initStatus);
  const notification = useNotification();
  const notificationRef = useRef(notification);
  const startedRef = useRef(false);

  useEffect(() => {
    notificationRef.current = notification;
  }, [notification]);

  useEffect(() => {
    if (initStatus !== 'success' || startedRef.current) return;
    startedRef.current = true;

    const controller = new AbortController();
    let cancelled = false;

    const check = async (): Promise<void> => {
      await rehydrateAutoUpdate();
      if (cancelled || !getAutoUpdateSettings().autoCheckEnabled) return;

      const installed = await getInstalledVersion();
      const result = await checkForUpdate(installed, controller.signal);
      if (cancelled || result.status !== 'available') return;

      notificationRef.current.show({
        status: 'info',
        titleText: `发现新版本 v${result.release.versionName}`,
        descriptionText: '前往“关于”页面查看更新说明并安装。',
        actions: [
          {
            key: 'later',
            text: '稍后',
            onPress: () => notificationRef.current.clear(),
          },
          {
            key: 'open',
            text: '查看更新',
            onPress: () => {
              if (!rootNavigationRef.isReady()) return;
              notificationRef.current.clear();
              rootNavigationRef.navigate(ROOT_ROUTES.About);
            },
          },
        ],
      });
    };

    // 自动检查失败不打断启动，用户仍可在“关于”页手动检查。
    check().catch(() => undefined);

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [initStatus]);

  return null;
}
