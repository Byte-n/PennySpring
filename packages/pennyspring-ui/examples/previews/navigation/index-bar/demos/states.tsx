import React from 'react';
import { Avatar, Column, IndexBar, Row, Text } from '@pennyspring/ui';
import { createUseSheetStyle, ThemeProvider } from '@pennyspring/theme';
import type { IndexBarItem } from '@pennyspring/ui';

const INDEX_DATA: IndexBarItem[] = [
  { index: 'A', titleText: 'A' },
  { index: 'B', titleText: 'B' },
  { index: 'C', titleText: 'C' },
  { index: 'D', titleText: 'D', disabled: true },
  { index: 'E', titleText: 'E' },
];

const PANEL_ROWS: Record<string, { name: string; amount: string }[]> = {
  A: [{ name: '安琪', amount: '¥ 128' }],
  B: [{ name: '白露', amount: '¥ 56' }],
  C: [{ name: '陈嘉宁', amount: '¥ 2,480' }],
  D: [{ name: '邓真', amount: '¥ 32' }],
  E: [{ name: '尔雅', amount: '¥ 18' }],
};

const FRAME_HEIGHT = 200;

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
          <Text style={styles.amount} weight="semibold">{row.amount}</Text>
        </Row>
      ))}
    </Column>
  );
}

function renderItem(item: IndexBarItem) {
  return <DemoPanel index={String(item.index)} />;
}

export function IndexBarStatesDemo() {
  const styles = useStyles();

  return (
    <Column gap="large">
      <Column style={styles.section}>
        <Text color="tertiary" size="xs">
          四态：默认二级文字；按压 8% 底；选中主色实底 + 白字；禁用四级文字且不响应
        </Text>
        <Column style={styles.frame}>
          <IndexBar data={INDEX_DATA} defaultValue="B" renderItem={renderItem} />
        </Column>
      </Column>
      <Text color="tertiary" size="xs">
        拖动字母条时中央显示 64 气泡（colorPrimaryBg + 主色字母），抬起后 200ms 淡出
      </Text>
      <Column style={styles.section}>
        <Text color="tertiary" size="xs">深色对照：面板与字母条同底，分组标题吸顶不加阴影</Text>
        <ThemeProvider config={{ algorithm: 'dark' }}>
          <Column style={styles.frame}>
            <IndexBar data={INDEX_DATA} defaultValue="A" renderItem={renderItem} />
          </Column>
        </ThemeProvider>
      </Column>
      <Text color="tertiary" size="xs">
        面板结构：行高 48，头像 32，金额 14/600 等宽，行间不加分隔线
      </Text>
    </Column>
  );
}

export default IndexBarStatesDemo;
