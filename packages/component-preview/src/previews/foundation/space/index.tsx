import React from 'react';
import { View } from 'react-native';
import { Space, Tag, Text } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
  demoBox: {
    minHeight: token.controlHeightSM,
    minWidth: token.controlHeightLG,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: token.paddingSM,
    borderWidth: token.lineWidth,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadius,
    backgroundColor: token.colorBgContainer,
  },
  verticalFrame: {
    alignSelf: 'flex-start',
  },
  wrapFrame: {
    maxWidth: token.controlHeightLG * 5,
  },
}));

function DemoBox({ children }: { children: string }) {
  const styles = useStyles();

  return (
    <View style={styles.demoBox}>
      <Text size="sm">{children}</Text>
    </View>
  );
}

export function SpacePreview() {
  const styles = useStyles();

  return (
    <PreviewScaffold>
      <PreviewSection title="Direction and size">
        <View style={styles.stack}>
          <Space size="small">
            <DemoBox>Small</DemoBox>
            <DemoBox>Gap</DemoBox>
            <DemoBox>Row</DemoBox>
          </Space>
          <Space direction="vertical" size="large" style={styles.verticalFrame}>
            <DemoBox>Vertical</DemoBox>
            <DemoBox>Large gap</DemoBox>
          </Space>
        </View>
      </PreviewSection>

      <PreviewSection title="Align and justify">
        <View style={styles.stack}>
          <Space align="center" justify="between" block>
            <DemoBox>Start</DemoBox>
            <Text color="description">Center aligned</Text>
            <DemoBox>End</DemoBox>
          </Space>
          <Space align="baseline">
            <Text size="h4" weight="strong">42</Text>
            <Text color="secondary">baseline text</Text>
          </Space>
        </View>
      </PreviewSection>

      <PreviewSection title="Wrap">
        <Space wrap style={styles.wrapFrame}>
          <Tag color="primary">Food</Tag>
          <Tag color="success">Income</Tag>
          <Tag color="warning">Budget</Tag>
          <Tag color="info">Plan</Tag>
          <Tag color="purple">Travel</Tag>
        </Space>
      </PreviewSection>
    </PreviewScaffold>
  );
}
