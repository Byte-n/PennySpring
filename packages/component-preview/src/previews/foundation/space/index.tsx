import React from 'react';
import { View } from 'react-native';
import { Space, Tag, Text } from '@pennyspring/component';
import { createUseSheetStyle } from '@pennyspring/theme';
import { PreviewScaffold, PreviewSection } from '../../PreviewScaffold';
import type { ReactNode } from 'react';

const SPACE_SIZES = ['small', 'normal', 'large'] as const;

const useStyles = createUseSheetStyle(token => ({
  stack: {
    gap: token.marginSM,
  },
  cell: {
    minHeight: token.controlHeightSM,
    minWidth: token.controlHeightLG,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: token.paddingSM,
    paddingVertical: token.paddingXXS,
    borderWidth: token.lineWidth,
    borderColor: token.colorBorder,
    borderRadius: token.borderRadiusSM,
    backgroundColor: token.colorBgContainer,
  },
  spaceFrame: {
    backgroundColor: token.colorFillTertiary,
  },
  verticalFrame: {
    alignSelf: 'flex-start',
    backgroundColor: token.colorFillTertiary,
  },
  wrapFrame: {
    maxWidth: token.controlHeightLG * 5,
    backgroundColor: token.colorFillTertiary,
  },
}));

function DemoCell({ children }: { children: ReactNode }) {
  const styles = useStyles();

  return <View style={styles.cell}>{children}</View>;
}

export function SpacePreview() {
  const styles = useStyles();

  return (
    <PreviewScaffold>
      <PreviewSection title="Size">
        <View style={styles.stack}>
          {SPACE_SIZES.map(size => (
            <Space key={size} size={size} style={styles.spaceFrame}>
              <DemoCell>
                <Text size="sm">{size}</Text>
              </DemoCell>
              <DemoCell>
                <Text size="sm">Gap</Text>
              </DemoCell>
              <DemoCell>
                <Text size="sm">Row</Text>
              </DemoCell>
            </Space>
          ))}
        </View>
      </PreviewSection>

      <PreviewSection title="Direction">
        <View style={styles.stack}>
          <Space style={styles.spaceFrame}>
            <DemoCell>
              <Text size="sm">Horizontal</Text>
            </DemoCell>
            <DemoCell>
              <Text size="sm">Gap</Text>
            </DemoCell>
            <DemoCell>
              <Text size="sm">Row</Text>
            </DemoCell>
          </Space>
          <Space direction="vertical" style={styles.verticalFrame}>
            <DemoCell>
              <Text size="sm">Vertical</Text>
            </DemoCell>
            <DemoCell>
              <Text size="sm">Gap</Text>
            </DemoCell>
          </Space>
        </View>
      </PreviewSection>

      <PreviewSection title="Align and justify">
        <View style={styles.stack}>
          <Space align="center" justify="between" block style={styles.spaceFrame}>
            <DemoCell>
              <Text size="sm">Start</Text>
            </DemoCell>
            <DemoCell>
              <Text color="description" size="sm">Center aligned</Text>
            </DemoCell>
            <DemoCell>
              <Text size="sm">End</Text>
            </DemoCell>
          </Space>
          <Space align="baseline" style={styles.spaceFrame}>
            <DemoCell>
              <Text size="h4" weight="strong">42</Text>
            </DemoCell>
            <DemoCell>
              <Text color="secondary">baseline text</Text>
            </DemoCell>
          </Space>
        </View>
      </PreviewSection>

      <PreviewSection title="Wrap">
        <Space wrap style={styles.wrapFrame}>
          <DemoCell>
            <Tag color="primary">Food</Tag>
          </DemoCell>
          <DemoCell>
            <Tag color="success">Income</Tag>
          </DemoCell>
          <DemoCell>
            <Tag color="warning">Budget</Tag>
          </DemoCell>
          <DemoCell>
            <Tag color="info">Plan</Tag>
          </DemoCell>
          <DemoCell>
            <Tag color="purple">Travel</Tag>
          </DemoCell>
        </Space>
      </PreviewSection>
    </PreviewScaffold>
  );
}
