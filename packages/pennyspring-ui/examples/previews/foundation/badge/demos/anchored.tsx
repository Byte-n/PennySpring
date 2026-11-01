import React from 'react';
import { Avatar, Badge, Column, Icon, Row, Text } from '@pennyspring/ui';
import { createUseSheetStyle, ThemeProvider } from '@pennyspring/ui';

const useStyles = createUseSheetStyle(token => ({
  iconButton: {
    alignItems: 'center',
    backgroundColor: token.colorFillTertiary,
    borderRadius: token.borderRadius,
    height: token.controlHeight,
    justifyContent: 'center',
    width: token.controlHeight,
  },
  surface: {
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    gap: token.marginSM,
    padding: token.paddingSM,
  },
  tabRow: {
    gap: token.marginLG,
  },
}));

function IconButton({ icon }: { icon: 'notification' | 'calendar' }) {
  const styles = useStyles();

  return (
    <Row style={styles.iconButton}>
      <Icon icon={icon} size="large" color="secondary" />
    </Row>
  );
}

function DarkSurface() {
  const styles = useStyles();

  return (
    <Column style={styles.surface}>
      <Row gap="large">
        <Badge count={3} color="danger">
          <IconButton icon="notification" />
        </Badge>
        <Badge color="danger" dot size="normal">
          <IconButton icon="calendar" />
        </Badge>
        <Badge count={12} />
        <Badge count={2} color="primary" />
        <Badge count={5} color="success" />
      </Row>
    </Column>
  );
}

export function BadgeAnchoredDemo() {
  const styles = useStyles();

  return (
    <Column gap="normal">
      <Text color="tertiary" size="xs">
        图标按钮：数字优先，圆点用于「有更新」；环 2px colorBgContainer
      </Text>
      <Row gap="large">
        <Badge count={3} color="danger">
          <IconButton icon="notification" />
        </Badge>
        <Badge color="danger" dot size="normal">
          <IconButton icon="calendar" />
        </Badge>
      </Row>
      <Text color="tertiary" size="xs">
        头像：在线状态用 success 圆点，不写 0
      </Text>
      <Row gap="large">
        <Badge count={2} color="danger">
          <Avatar text="陈" />
        </Badge>
        <Badge color="success" dot size="small">
          <Avatar text="王" />
        </Badge>
      </Row>
      <Text color="tertiary" size="xs">
        Tab 文案：计数贴在文字右上角，位移 40%
      </Text>
      <Row style={styles.tabRow}>
        <Badge count={9} color="danger" size="small">
          <Text color="secondary">账本</Text>
        </Badge>
        <Badge color="danger" dot size="small">
          <Text color="secondary">待办</Text>
        </Badge>
        <Text color="secondary">统计</Text>
      </Row>
      <Text color="tertiary" size="xs">
        深色对照：环取 colorBgContainer，自然融进深色卡
      </Text>
      <ThemeProvider config={{ algorithm: 'dark' }}>
        <DarkSurface />
      </ThemeProvider>
    </Column>
  );
}

export default BadgeAnchoredDemo;
