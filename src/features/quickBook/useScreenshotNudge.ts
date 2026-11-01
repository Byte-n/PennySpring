import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import {
  HOME_TAB_ROUTES,
  ROOT_ROUTES,
  rootNavigationRef,
} from '../../navigation';
import { decideScreenshotNudge } from './decision';
import { getLatestScreenshot } from './native';
import { hasScreenshotPermission } from './permission';
import {
  getLastHandledAssetId,
  useQuickBookRuntimeStore,
} from './runtimeStore';
import type { QuickBookImage } from './types';

const NUDGE_ALLOWED_ROUTES = new Set<string>([
  ROOT_ROUTES.Home,
  HOME_TAB_ROUTES.DetailTab,
  HOME_TAB_ROUTES.ChartTab,
]);

function isNudgeRouteAllowed(): boolean {
  if (!rootNavigationRef.isReady()) {
    return false;
  }
  const routeName = rootNavigationRef.getCurrentRoute()?.name;
  return routeName !== undefined && NUDGE_ALLOWED_ROUTES.has(routeName);
}

export interface ScreenshotNudge {
  assetId: string;
  image: QuickBookImage;
}

interface UseScreenshotNudgeOptions {
  enabled: boolean;
  windowSeconds: number;
  suppressed: boolean;
}

interface UseScreenshotNudgeResult {
  nudge: ScreenshotNudge | null;
  dismiss: () => void;
}

export function useScreenshotNudge({
  enabled,
  windowSeconds,
  suppressed,
}: UseScreenshotNudgeOptions): UseScreenshotNudgeResult {
  const [nudge, setNudge] = useState<ScreenshotNudge | null>(null);
  const nudgeRef = useRef<ScreenshotNudge | null>(null);
  const suppressedRef = useRef(suppressed);
  const busyRef = useRef(false);
  const mountedRef = useRef(true);

  nudgeRef.current = nudge;
  suppressedRef.current = suppressed;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const check = useCallback(async (): Promise<void> => {
    if (
      !enabled ||
      suppressedRef.current ||
      nudgeRef.current ||
      busyRef.current
    ) {
      return;
    }
    if (!isNudgeRouteAllowed()) {
      return;
    }
    busyRef.current = true;
    try {
      if (!(await hasScreenshotPermission())) {
        return;
      }
      const result = await getLatestScreenshot(windowSeconds);
      const decision = decideScreenshotNudge(
        result,
        getLastHandledAssetId(),
        windowSeconds,
        Math.floor(Date.now() / 1000),
      );
      if (!decision.shouldPrompt) {
        return;
      }
      useQuickBookRuntimeStore.getState().markAssetHandled(decision.assetId);
      if (mountedRef.current) {
        setNudge({ assetId: decision.assetId, image: decision.image });
      }
    } finally {
      busyRef.current = false;
    }
  }, [enabled, windowSeconds]);

  useEffect(() => {
    if (!enabled) {
      setNudge(null);
      return;
    }
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        check().catch(() => undefined);
      }
    });
    return () => {
      subscription.remove();
    };
  }, [check, enabled]);

  useEffect(() => {
    if (enabled) {
      check().catch(() => undefined);
    }
  }, [check, enabled]);

  const dismiss = useCallback((): void => {
    setNudge(null);
  }, []);

  return { nudge, dismiss };
}
