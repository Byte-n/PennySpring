import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import BootSplash from 'react-native-bootsplash';
import { Column, Loading, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';

import AppIcon from '../../assets/brand/app-icon.svg';
import { useBookStore } from '../../stores/bookStore';

/** 初始屏最多等待本地 hydration 的时长；网络元信息在进入应用后继续加载。 */
const BOOT_SESSION_TIMEOUT_MS = 2_000;
const ICON_SIZE = 180;

const useStyles = createUseSheetStyle(token => ({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: token.colorBgLayout,
  },
  icon: {
    // 图形只占画布的 72%，用负边距把视觉重心收回一点。
    marginTop: -token.marginMD,
  },
  brand: {
    marginTop: token.marginXS,
    letterSpacing: 0.4,
  },
  slogan: {
    marginTop: token.marginXXS,
    letterSpacing: 1.2,
  },
  footer: {
    position: 'absolute' as const,
    bottom: token.marginXXL,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
}));

interface BootScreenProps {
  onReady: () => void;
}

/**
 * 初始屏：承接原生 splash，只等待本地 hydration（账本 ref、网络令牌、本地默认账本）。
 * 远程账本元信息进入首页后继续加载，期间由头部展示 loading。
 */
export function BootScreen({ onReady }: BootScreenProps) {
  const styles = useStyles();
  const hydrateBookSession = useBookStore(state => state.hydrateBookSession);
  const loadCurrentBook = useBookStore(state => state.loadCurrentBook);
  const finishedRef = useRef(false);

  useEffect(() => {
    BootSplash.hide({ fade: true }).catch(error => {
      console.error('Boot splash dismissal failed:', error);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    const finish = (): void => {
      if (cancelled || finishedRef.current) {
        return;
      }
      finishedRef.current = true;
      onReady();
    };

    const prepare = async (): Promise<void> => {
      const { ref, needsMetadata } = await hydrateBookSession();
      if (!ref || !needsMetadata) {
        return;
      }
      if (ref.kind === 'local') {
        // 本地元信息读取很快，放行前取到名称可避免头部闪一下 loading。
        await loadCurrentBook();
        return;
      }
      // 远程元信息不阻塞进入应用，失败只影响头部与抽屉的账本展示。
      loadCurrentBook().catch(error => {
        console.error('Book metadata loading failed:', error);
      });
    };

    const timer = setTimeout(finish, BOOT_SESSION_TIMEOUT_MS);
    prepare()
      .catch(error => {
        console.error('Book session hydration failed:', error);
      })
      .finally(finish);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [hydrateBookSession, loadCurrentBook, onReady]);

  return (
    <View style={styles.container} testID="boot-screen">
      <Column align="center" style={styles.icon}>
        <AppIcon width={ICON_SIZE} height={ICON_SIZE} />
      </Column>
      <Text size="h4" style={styles.brand} weight="semibold">
        PennySpring
      </Text>
      <Text color="tertiary" size="sm" style={styles.slogan}>
        每一笔，都算数
      </Text>
      <View style={styles.footer}>
        <Loading text="正在加载账本数据" variant="inline" />
      </View>
    </View>
  );
}
