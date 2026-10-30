import React from 'react';
import { Avatar, Column, Row, Text } from '@pennyspring/ui';
import { createUseSheetStyle, ThemeProvider } from '@pennyspring/theme';

const useStyles = createUseSheetStyle(token => ({
  surface: {
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    padding: token.paddingSM,
  },
  row: {
    alignItems: 'center',
    gap: token.marginSM,
  },
  body: {
    flex: 1,
  },
  amount: {
    fontVariant: ['tabular-nums' as const],
  },
}));

function DarkSurface() {
  const styles = useStyles();

  return (
    <Column gap="normal" style={styles.surface}>
      <Row gap="small">
        <Avatar text="王" />
        <Avatar shape="square" text="李" />
        <Avatar.Group
          items={[
            { key: 'chen', text: '陈' },
            { key: 'zhao', text: '赵' },
            { key: 'zhou', text: '周' },
          ]}
          maxCount={2}
        />
      </Row>
    </Column>
  );
}

export function AvatarStatesDemo() {
  const styles = useStyles();

  return (
    <Column gap="normal">
      <Text color="tertiary" size="xs">默认 / 禁用：禁用只降透明度并换 colorFillQuaternary，不改尺寸与环</Text>
      <Row gap="small">
        <Avatar text="王" />
        <Avatar disabled text="王" />
        <Avatar disabled shape="square" text="李" />
      </Row>
      <Text color="tertiary" size="xs">列表行：行内头像固定 40，不随行高放大</Text>
      <Column style={styles.surface}>
        <Row style={styles.row}>
          <Avatar text="陈" />
          <Column gap={0} style={styles.body}>
            <Text weight="medium">陈嘉宁</Text>
            <Text color="tertiary" size="xs">共同记账 128 天 · 3 本账本</Text>
          </Column>
          <Text style={styles.amount} weight="semibold">¥ 2,480.00</Text>
        </Row>
      </Column>
      <Text color="tertiary" size="xs">深色对照：环取 colorBgContainer，深色卡上自动变深环</Text>
      <ThemeProvider config={{ algorithm: 'dark' }}>
        <DarkSurface />
      </ThemeProvider>
    </Column>
  );
}

export default AvatarStatesDemo;
