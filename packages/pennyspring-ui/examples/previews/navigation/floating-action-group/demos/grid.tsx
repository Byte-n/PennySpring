import React from 'react';
import { View } from 'react-native';
import { FloatingActionGroup, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';
import {
  ArrowsLeftRightIcon,
  ChartLineIcon,
  ListIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  WalletIcon,
} from 'phosphor-react-native';

const useStyles = createUseSheetStyle(token => ({
  canvas: {
    backgroundColor: token.colorBgLayout,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadius,
    borderWidth: token.lineWidth,
    height: token.controlHeightLG * 8,
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    gap: token.paddingSM,
    padding: token.padding,
  },
  summaryCard: {
    backgroundColor: token.colorBgContainer,
    borderColor: token.colorSplit,
    borderRadius: token.borderRadius,
    borderWidth: token.lineWidth,
    gap: token.paddingXXS,
    padding: token.padding,
  },
  amount: {
    fontVariant: ['tabular-nums'],
  },
  hint: {
    maxWidth: '70%',
  },
  status: {
    paddingVertical: token.paddingXXS,
  },
}));

export function FloatingActionGroupGridDemo() {
  const styles = useStyles();
  const [lastEvent, setLastEvent] = React.useState('尚未选择动作');
  const actions = React.useMemo(
    () => [
      {
        key: 'create',
        label: '记一笔',
        icon: PlusIcon,
        onPress: () => {
          setLastEvent('已选择：记一笔');
        },
      },
      {
        key: 'template',
        label: '快捷模板',
        icon: ListIcon,
        onPress: () => {
          setLastEvent('已选择：快捷模板');
        },
      },
      {
        key: 'transfer',
        label: '转账',
        icon: ArrowsLeftRightIcon,
        onPress: () => {
          setLastEvent('已选择：转账');
        },
      },
      {
        key: 'budget',
        label: '预算',
        icon: ChartLineIcon,
        onPress: () => {
          setLastEvent('已选择：预算');
        },
      },
      {
        key: 'wallet',
        label: '账本',
        icon: WalletIcon,
        onPress: () => {
          setLastEvent('已选择：账本');
        },
      },
      {
        key: 'search',
        label: '搜索',
        icon: MagnifyingGlassIcon,
        onPress: () => {
          setLastEvent('已选择：搜索');
        },
      },
    ],
    [],
  );

  return (
    <>
      <View style={styles.status}>
        <Text color="description" size="sm">
          {lastEvent}
        </Text>
      </View>
      <View style={styles.canvas}>
        <View style={styles.content}>
          <Text color="heading" size="h4" weight="semibold">
            明细
          </Text>
          <View style={styles.summaryCard}>
            <Text color="tertiary" size="xs">
              本月支出
            </Text>
            <Text
              color="heading"
              size="h2"
              style={styles.amount}
              weight="semibold"
            >
              ¥3,286.40
            </Text>
          </View>
          <Text color="secondary" size="sm" style={styles.hint}>
            点击右下书签头展开；拖动书签头后松手贴边。
          </Text>
        </View>
        <FloatingActionGroup
          actions={actions}
          draggable
          layout="grid"
          mountPoint="local"
          placement="bottomRight"
          snapToEdge
        />
      </View>
    </>
  );
}

export default FloatingActionGroupGridDemo;
