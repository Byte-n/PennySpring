import React from 'react';
import { View } from 'react-native';
import type { FloatingLayout } from '@pennyspring/ui';
import { Button, FloatingActionGroup, Space, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';
import {
  ArrowsLeftRightIcon,
  ChartLineIcon,
  CoinsIcon,
  CreditCardIcon,
  DownloadSimpleIcon,
  GearSixIcon,
  ListIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  SparkleIcon,
  TagIcon,
  WalletIcon,
} from 'phosphor-react-native';

const useStyles = createUseSheetStyle(token => ({
  canvas: {
    backgroundColor: token.colorBgLayout,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadius,
    borderWidth: token.lineWidth,
    height: token.controlHeightLG * 9,
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
    maxWidth: '74%',
  },
  controls: {
    gap: token.paddingSM,
  },
  status: {
    paddingVertical: token.paddingXXS,
  },
}));

const MAX_COUNT = 12;
const MIN_COUNT = 1;

export function FloatingActionGroupCountLabDemo() {
  const styles = useStyles();
  const [count, setCount] = React.useState(6);
  const [layout, setLayout] = React.useState<FloatingLayout>('grid');
  const [snapToEdge, setSnapToEdge] = React.useState(true);
  const [draggable, setDraggable] = React.useState(true);
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
      {
        key: 'agent',
        label: 'AI 助手',
        icon: SparkleIcon,
        onPress: () => {
          setLastEvent('已选择：AI 助手');
        },
      },
      {
        key: 'tag',
        label: '标签',
        icon: TagIcon,
        onPress: () => {
          setLastEvent('已选择：标签');
        },
      },
      {
        key: 'import',
        label: '导入',
        icon: DownloadSimpleIcon,
        onPress: () => {
          setLastEvent('已选择：导入');
        },
      },
      {
        key: 'settings',
        label: '设置',
        icon: GearSixIcon,
        onPress: () => {
          setLastEvent('已选择：设置');
        },
      },
      {
        key: 'asset',
        label: '资产',
        icon: CoinsIcon,
        onPress: () => {
          setLastEvent('已选择：资产');
        },
      },
      {
        key: 'card',
        label: '银行卡',
        icon: CreditCardIcon,
        onPress: () => {
          setLastEvent('已选择：银行卡');
        },
      },
    ],
    [],
  );
  const isFanFallback = layout === 'fan' && count > 8;
  const status = [
    `n=${count}`,
    isFanFallback
      ? '扇形已降级为网格'
      : `${layout === 'fan' ? '扇形' : '网格'}`,
    snapToEdge ? '右侧书签头' : '浮动',
    draggable ? '可拖拽' : '固定',
  ].join(' · ');

  return (
    <>
      <View style={styles.status}>
        <Text color="description" size="sm">
          {lastEvent}
        </Text>
      </View>
      <View style={styles.controls}>
        <Space align="center" gap="small" wrap>
          <Text color="description" size="sm">
            数量
          </Text>
          <Button
            disabled={count <= MIN_COUNT}
            onPress={() => {
              setCount(value => Math.max(MIN_COUNT, value - 1));
            }}
            size="small"
          >
            −
          </Button>
          <Text color="heading" size="md" weight="semibold">
            {count}
          </Text>
          <Button
            disabled={count >= MAX_COUNT}
            onPress={() => {
              setCount(value => Math.min(MAX_COUNT, value + 1));
            }}
            size="small"
          >
            +
          </Button>
        </Space>
        <Space align="center" gap="small" wrap>
          <Text color="description" size="sm">
            布局
          </Text>
          <Button
            onPress={() => {
              setLayout('grid');
            }}
            size="small"
            type={layout === 'grid' ? 'primary' : 'default'}
          >
            网格
          </Button>
          <Button
            onPress={() => {
              setLayout('fan');
            }}
            size="small"
            type={layout === 'fan' ? 'primary' : 'default'}
          >
            扇形
          </Button>
        </Space>
        <Space align="center" gap="small" wrap>
          <Button
            onPress={() => {
              setSnapToEdge(value => !value);
            }}
            size="small"
            type={snapToEdge ? 'primary' : 'default'}
          >
            自动贴边：{snapToEdge ? '开' : '关'}
          </Button>
          <Button
            onPress={() => {
              setDraggable(value => !value);
            }}
            size="small"
            type={draggable ? 'primary' : 'default'}
          >
            可拖拽：{draggable ? '开' : '关'}
          </Button>
        </Space>
        <Text color="description" size="xs">
          {status}
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
            调数量看列数与张角；关掉自动贴边看浮动，关掉可拖拽看固定。
          </Text>
        </View>
        <FloatingActionGroup
          actions={actions.slice(0, count)}
          draggable={draggable}
          layout={layout}
          mountPoint="local"
          placement="bottomRight"
          snapToEdge={snapToEdge}
        />
      </View>
    </>
  );
}

export default FloatingActionGroupCountLabDemo;
