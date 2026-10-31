import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { addSharedImageListener, consumeSharedImage } from './native';
import type { QuickBookImage } from './types';

export function useQuickBookShare(
  onImage: (image: QuickBookImage) => void,
): void {
  const onImageRef = useRef(onImage);
  onImageRef.current = onImage;

  useEffect(() => {
    let cancelled = false;

    const consume = async (): Promise<void> => {
      const image = await consumeSharedImage();
      if (image !== null && !cancelled) {
        onImageRef.current(image);
      }
    };

    const unsubscribe = addSharedImageListener(() => {
      consume().catch(() => undefined);
    });
    // 冷启动/事件丢失时，回到前台再兜底取一次；原生侧没有待处理图片会直接返回 null。
    const appStateSubscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        consume().catch(() => undefined);
      }
    });
    // 冷启动时分享事件早于 JS 订阅，挂载后主动取一次。
    consume().catch(() => undefined);

    return () => {
      cancelled = true;
      unsubscribe();
      appStateSubscription.remove();
    };
  }, []);
}
