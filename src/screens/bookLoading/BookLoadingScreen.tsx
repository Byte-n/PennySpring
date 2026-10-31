import React from 'react';
import { View } from 'react-native';
import { Column, Loading, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';
import AppIcon from '../../assets/brand/app-icon.svg';

/**
 * 品牌启动页：原生 splash 只能显示图标（Android 12+ 还会被系统按圆形裁切），
 * 所以品牌名与标语放在这一层渲染，承接原生 splash 淡出后的画面。
 */
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

export function BookLoadingScreen() {
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <Column align="center" style={styles.icon}>
        <AppIcon width={ICON_SIZE} height={ICON_SIZE} />
      </Column>
      <Text size="h4" weight="semibold" style={styles.brand}>
        PennySpring
      </Text>
      <Text size="sm" color="tertiary" style={styles.slogan}>
        每一笔，都算数
      </Text>
      <View style={styles.footer}>
        <Loading variant="inline" text="正在加载账本数据" />
      </View>
    </View>
  );
}
