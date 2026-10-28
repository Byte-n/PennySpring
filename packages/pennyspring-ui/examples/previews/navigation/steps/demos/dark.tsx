import React from 'react';
import { Column, Steps, Text } from '@pennyspring/ui';
import { createUseSheetStyle, ThemeProvider } from '@pennyspring/theme';
import type { StepsItem } from '@pennyspring/ui';

const STEP_ITEMS: StepsItem[] = [
  {
    key: 'book',
    titleText: '选择账本',
    descriptionText: '日常开销',
  },
  {
    key: 'amount',
    titleText: '填写金额',
    descriptionText: '当前步骤',
  },
  {
    key: 'confirm',
    titleText: '确认提交',
    descriptionText: '待开始',
  },
];

const useStyles = createUseSheetStyle(token => ({
  surface: {
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    padding: token.paddingSM,
  },
}));

export const stepsDarkDemoTitle = '深色对照';

function DarkSurface() {
  const styles = useStyles();

  return (
    <Column style={styles.surface}>
      <Steps defaultValue={1} items={STEP_ITEMS} />
    </Column>
  );
}

export function StepsDarkDemo() {
  return (
    <Column gap="normal">
      <Text color="tertiary" size="xs">
        深色下外环用品牌 16% 透明，仍能分出当前步；连接线 colorSplit 自动反转
      </Text>
      <ThemeProvider config={{ algorithm: 'dark' }}>
        <DarkSurface />
      </ThemeProvider>
    </Column>
  );
}

export default StepsDarkDemo;
