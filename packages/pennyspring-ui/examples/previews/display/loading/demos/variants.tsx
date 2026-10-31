import React from 'react';
import { Loading, Column, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';

const useStyles = createUseSheetStyle(token => ({
  panel: {
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadius,
    gap: token.marginSM,
    padding: token.padding,
  },
  canvas: {
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadius,
    minHeight: 160,
    padding: token.padding,
  },
  overlayHost: {
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadius,
    minHeight: 160,
    padding: token.padding,
  },
}));

export function LoadingVariantsDemo() {
  const styles = useStyles();

  return (
    <Column gap="normal">
      <Text color="tertiary" size="sm">
        inline 行内等待、block 区块加载、more 列表底部、overlay 遮罩浮层；同一屏只允许一处 overlay
      </Text>
      <Column style={styles.panel} gap="small">
        <Loading text="正在读取本月账单" />
        <Loading tone="muted" text="正在校验本地差异（次级任务）" />
      </Column>
      <Column style={styles.canvas} align="center" justify="center">
        <Loading variant="block" text="正在同步账单" description="128 笔记录 · 约 2 秒" />
      </Column>
      <Column style={styles.panel} gap="small">
        <Loading variant="more" text="加载更早的记录" />
        <Text color="tertiary" size="xs">列表底部专用，上下 12，文案 12 三级</Text>
      </Column>
      <Column style={styles.overlayHost}>
        <Text color="secondary" size="sm">正在写入云端，请勿退出</Text>
        <Loading variant="overlay" text="正在写入云端" />
      </Column>
    </Column>
  );
}

export default LoadingVariantsDemo;
