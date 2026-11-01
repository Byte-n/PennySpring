import React from 'react';
import { Avatar, Column, IndexBar, Row, Text } from '@pennyspring/ui';
import { createUseSheetStyle } from '@pennyspring/ui';
import type { ComponentSize, IndexBarItem } from '@pennyspring/ui';

const INDEX_DATA: IndexBarItem[] = [
  { index: 'A', titleText: 'A' },
  { index: 'B', titleText: 'B' },
  { index: 'L', titleText: 'L' },
];

const PANEL_ROWS: Record<string, { name: string; amount: string }[]> = {
  A: [
    { name: '安琪', amount: '¥ 128' },
    { name: '艾米', amount: '¥ 64' },
  ],
  B: [
    { name: '白露', amount: '¥ 56' },
    { name: '毕青', amount: '¥ 320' },
  ],
  L: [
    { name: '林一', amount: '¥ 320' },
    { name: '刘洋', amount: '¥ 96' },
  ],
};

const SIZE_SAMPLES: { size: ComponentSize; hint: string }[] = [
  { size: 'small', hint: 'small · 字母 20 · 条宽 36 · 字号 11' },
  { size: 'normal', hint: 'normal · 字母 24 · 条宽 36 · 字号 12' },
  { size: 'large', hint: 'large · 字母 28 · 条宽 40 · 字号 13' },
];

const FRAME_HEIGHT = 240;

const useStyles = createUseSheetStyle(token => ({
  frame: {
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadius,
    height: FRAME_HEIGHT,
    overflow: 'hidden',
  },
  row: {
    alignItems: 'center',
    gap: token.marginSM,
    minHeight: token.controlHeight,
    paddingHorizontal: token.padding,
  },
  body: {
    flex: 1,
  },
  amount: {
    fontVariant: ['tabular-nums' as const],
  },
  section: {
    gap: token.marginSM,
  },
}));

function renderItem(item: IndexBarItem) {
  return <DemoPanel index={String(item.index)} />;
}

function DemoPanel({ index }: { index: string }) {
  const styles = useStyles();

  return (
    <Column>
      {(PANEL_ROWS[index] ?? []).map(row => (
        <Row key={row.name} style={styles.row}>
          <Avatar size="small" text={row.name} />
          <Column gap={0} style={styles.body}>
            <Text weight="medium">{row.name}</Text>
          </Column>
          <Text style={styles.amount} weight="semibold">
            {row.amount}
          </Text>
        </Row>
      ))}
    </Column>
  );
}

export function IndexBarSizeDemo() {
  const styles = useStyles();

  return (
    <Column gap="large">
      {SIZE_SAMPLES.map(({ size, hint }) => (
        <Column key={size} style={styles.section}>
          <Text color="tertiary" size="xs">
            {hint}
          </Text>
          <Column style={styles.frame}>
            <IndexBar data={INDEX_DATA} renderItem={renderItem} size={size} />
          </Column>
        </Column>
      ))}
      <Text color="tertiary" size="xs">
        视觉 20 / 24 / 28，热区由整条字母栏承担；分组标题高 32，12/600 + 字距
        .08em
      </Text>
    </Column>
  );
}

export default IndexBarSizeDemo;
